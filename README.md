# eFatura — Module Core de Facturation IGRP 3.0

> Microservice Spring Boot de gestion de la facturation électronique,  
> développé dans l'écosystème IGRP 3.0 pour le marché cabo-verdien.

---

## Table des matières

1. [But du projet](#1-but-du-projet)
2. [Modules et domaines métier](#2-modules-et-domaines-métier)
3. [Architecture technique](#3-architecture-technique)
4. [Guide d'utilisation](#4-guide-dutilisation)

---

## 1. But du projet

**eFatura** est le module central de facturation de la plateforme ERP IGRP 3.0. Il couvre l'ensemble du cycle de vie d'une facture — de sa création à son paiement — en respectant les règles fiscales cabo-verdiennes (TVA, IVA).

### Objectifs métier

| Objectif | Description |
|----------|-------------|
| **Gestion de la facturation** | Création, confirmation et annulation des factures de vente et d'achat, avec numérotation automatique par série |
| **Calcul fiscal rigoureux** | Support de multiples types d'impôts par ligne (IVA en pourcentage ou valeur fixe), calcul automatique des bases, montants et totaux avec `BigDecimal` (aucune perte de précision) |
| **Traçabilité complète** | Chaque entité hérite d'`AuditEntity` : les champs `created_by`, `created_date`, `last_modified_by`, `last_modified_date` sont remplis automatiquement. Hibernate Envers génère en parallèle des tables d'audit `_AUD` pour l'historique complet des modifications |
| **Cycle de vie documentaire** | Les factures transitent par des états métier explicites : `RASCUNHO` → `CONFIRMADO` → `ANULADO`. Chaque transition est validée côté serveur |
| **Isolation par entreprise** | La base de données est isolée par entreprise, conformément au modèle multi-tenant de l'écosystème IGRP |

### Périmètre de ce module (Phase 1)

Ce module constitue le **Core de facturation**. L'intégration avec la plateforme eFatura nationale (SIGEF/ANS) est prévue en Phase 2, dans un module séparé.

---

## 2. Modules et domaines métier

L'application est découpée en **6 domaines fonctionnels** indépendants, plus une couche partagée.

```
src/main/java/cv/igrp/fatura/
├── shared/          Infrastructure transversale
├── parametrizacao/  Référentiels et tables de configuration
├── cadastro/        Données maîtres (tiers, produits)
├── contabilidade/   Plan comptable général
├── venda/           Factures de vente
├── compra/          Factures d'achat
└── pagamento/       Paiements et imputation sur documents
```

### Interactions entre domaines

```
parametrizacao  ──────────────────────────────────────────────┐
(types, séries,                                                │ fournit les
 unités, impostos,                                            │ référentiels
 moedas, méthodes)                                             │
                                                               ▼
cadastro ──────────────────► venda ◄──────── contabilidade
(clients,                   (FaturaVenda     (gl_conta —
 fournisseurs,               + items         lien comptable
 produits)                   + impostos)     optionnel)
       │                        │
       └──────────────► compra  │
                        (FaturaCompra        pagamento
                         + items             (Pagamento
                         + impostos)          + documents
                                              imputés sur
                                              venda/compra)
```

### Détail des modules

#### `shared/` — Infrastructure partagée
- **`AuditEntity`** : classe abstraite dont héritent toutes les entités. Fournit les 4 champs d'audit JPA + l'annotation `@Audited` pour Hibernate Envers.
- **`SpringCommandBus`** / **`SpringQueryBus`** : implémentations du bus de commandes CQRS, auto-découvrent les `CommandHandler` au démarrage.
- **`GlobalExceptionHandler`** : gestion centralisée des erreurs HTTP (validation, contraintes, format JSON invalide).
- **`SecurityConfig`** : OAuth2/JWT (Keycloak) — désactivé en profil `development`.

#### `parametrizacao/` — Référentiels
Tables de configuration gérées par les administrateurs, référencées par tous les autres modules.

| Table | Description |
|-------|-------------|
| `pr_fatura_tipo` | Types de document (FT = Factura, NC = Nota de Crédito…) |
| `pr_serie` | Séries de numérotation par type, avec compteur auto-incrémenté |
| `pr_imposto` | Taux et types d'impôts (IVA 15%, IVA réduit, exonéré…) |
| `pr_unidade` | Unités de mesure (UN, KG, L, HR…) |
| `pr_moeda` | Devises (CVE, EUR…) |
| `pr_categoria` | Catégories de produits/services |
| `pr_enquadramento` | Enquadrements fiscaux clients |
| `pr_metodo_pagamento` | Méthodes de paiement (Numerário, Transferência…) |

#### `cadastro/` — Données maîtres
| Entité | Description |
|--------|-------------|
| `EntidadeEntity` | Entité juridique de base (NIF, adresse, contacts) |
| `ClienteEntity` | Client, étend la logique entité avec indicateurs fiscaux |
| `FornecedorEntity` | Fournisseur |
| `ProdutoEntity` | Produit ou service avec code article |

#### `contabilidade/` — Plan comptable
- `GlContaEntity` : comptes du plan général (gl = General Ledger). Les lignes de facture et les impostos peuvent référencer un `conta_gl_id` pour l'intégration comptable.

#### `venda/` — Factures de vente *(module principal)*
Modèle en 3 niveaux avec cascade JPA complète :
```
FaturaVendaEntity          (en-tête : client, série, dates, totaux, état)
  └── FaturaVendaItemEntity[]    (lignes : désignation, qté, prix, remises, totaux)
        └── FaturaVendaItemImpostoEntity[]  (impostos par ligne : base, taux, montant)
```
**Cycle de vie** : `RASCUNHO` → `CONFIRMADO` → `ANULADO`

**Calcul automatique** (dans le CommandHandler) :
- `valorBruto = quantite × precoUnitario`
- `valorLiquido = valorBruto − descontoComercial − descontoFinanceiro`
- `valorImposto = ∑ valorImposto des impostos de la ligne`
- `valorTotal (ligne) = valorLiquido + valorImposto`
- `valorFatura = ∑ valorBruto + ∑ valorImposto (toutes lignes)`

#### `compra/` — Factures d'achat
Structure symétrique à `venda/`, orientée fournisseur (`FornecedorEntity` au lieu de `ClienteEntity`).

#### `pagamento/` — Paiements
- `PagamentoEntity` : enregistrement d'un paiement (méthode, montant, date, banque).
- `PagamentoDocumentoEntity` : imputation du paiement sur une ou plusieurs factures (`fatura_venda_id` / `fatura_compra_id`), avec montant appliqué et remise financière éventuelle.

---

## 3. Architecture technique

### Stack

| Composant | Détail |
|-----------|--------|
| **Langage** | Java 25 |
| **Framework** | Spring Boot 3.5.10 |
| **Build** | Maven 3.x |
| **ORM** | Spring Data JPA + Hibernate 6 |
| **Audit** | Hibernate Envers (`spring-data-envers`) |
| **Sécurité** | Spring Security + OAuth2 Resource Server (JWT Keycloak) |
| **BD dev** | H2 in-memory (`jdbc:h2:mem:efaturadb`) |
| **BD prod** | PostgreSQL 5432 / base `efatura_db` |
| **API Docs** | SpringDoc OpenAPI 2.8 (Swagger UI) |
| **Sérialisation** | Jackson + `jackson-datatype-hibernate6` |
| **Framework métier** | IGRP Framework Core 0.1.0-beta.1 |

### Pattern CQRS — Command / Handler

Toutes les opérations d'écriture transitent par un **bus de commandes** :

```
Controller
    │  new XxxCommand(dto)
    ▼
CommandBus.send(command)
    │  résolution du handler par type
    ▼
XxxCommandHandler.handle(command)   ← @Transactional ici, jamais sur le controller
    │  logique métier + validation
    ▼
Repository.save(entity)
    │
    ▼
ResponseEntity<Entity>
```

**Avantages dans ce projet :**
- Logique métier isolée, testable unitairement sans Spring
- Transaction délimitée précisément autour du handler
- Ajout de nouveaux cas d'usage sans toucher aux controllers

### Entités et audit automatique

```java
@Audited                                // Hibernate Envers — génère fatura_venda_AUD
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public abstract class AuditEntity {
    @CreatedDate  private LocalDateTime createdDate;
    @CreatedBy    private String createdBy;        // "system" en dev, JWT en prod
    @LastModifiedDate private LocalDateTime lastModifiedDate;
    @LastModifiedBy   private String lastModifiedBy;
}
```

Toutes les entités métier étendent `AuditEntity` et sont donc auditées automatiquement.

### Gestion des proxies Hibernate (OSIV + Jackson)

Le projet utilise le pattern **Open Session In View** (`spring.jpa.open-in-view=true`) : la session Hibernate reste ouverte pendant toute la sérialisation HTTP. Deux mécanismes complémentaires évitent les erreurs de sérialisation :

1. **`@JsonIgnore`** sur toutes les back-références bidirectionnelles (`item.faturaVenda`, `imposto.faturaVendaItem`) → prévient la récursion infinie
2. **`Hibernate6Module` avec `FORCE_LAZY_LOADING`** → Jackson désemballe les proxies ByteBuddy correctement
3. **`@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})`** sur `AuditEntity` → neutralise les propriétés internes des proxies Hibernate

### Profils de déploiement

| Profil | BD | Sécurité | Usage |
|--------|----|----------|-------|
| `development` (défaut) | H2 in-memory | Désactivée (tout `permitAll`) | Développement local |
| `staging` | PostgreSQL | Désactivée | Recette / tests d'intégration |
| `production` | PostgreSQL | OAuth2/JWT Keycloak | Production |

---

## 4. Guide d'utilisation

### Prérequis

- Java 25+
- Maven 3.x
- PowerShell 7+ (pour les scripts)
- *(PostgreSQL uniquement en staging/prod)*

### Démarrage du serveur

```powershell
# Profil development (H2 in-memory, sécurité désactivée)
mvn spring-boot:run

# Vérifier que l'API répond
Invoke-RestMethod http://localhost:8080/api/v1/parametrizacao/impostos
```

Le serveur démarre sur le port **8080**. La console H2 est accessible à :
```
http://localhost:8080/h2-console
JDBC URL : jdbc:h2:mem:efaturadb
User     : sa   |   Password : (vide)
```

La documentation Swagger UI est disponible à :
```
http://localhost:8080/swagger-ui.html
```

### Script `seed-and-test.ps1`

Ce script PowerShell initialise un jeu de données complet et valide le cycle de vie d'une facture de vente de bout en bout. Il est idempotent : les données déjà présentes sont ignorées (`GET-or-create`).

```powershell
.\seed-and-test.ps1
# ou avec une URL différente :
.\seed-and-test.ps1 -BaseUrl "http://localhost:9090"
```

**Étapes exécutées :**

| Étape | Endpoint | Action |
|-------|----------|--------|
| 0 | `GET /api/v1/parametrizacao/impostos` | Vérification disponibilité API |
| 1 | `POST /api/v1/parametrizacao/moedas` | Crée la devise CVE |
| 2 | `POST /api/v1/parametrizacao/tipos-fatura` | Crée le type `FT` (Factura) |
| 3 | `POST /api/v1/parametrizacao/series` | Crée la série `FT-2025` |
| 4 | `POST /api/v1/parametrizacao/impostos` | Crée l'impôt `IVA15` (15%) |
| 5 | `POST /api/v1/parametrizacao/unidades` | Crée l'unité `UN` |
| 6 | `POST /api/v1/clientes` | Crée le client `CLI-001` |
| 7 | `POST /api/v1/faturas-venda` | Crée une facture (2 × 10 000 CVE + IVA 15% = 23 000 CVE) |
| — | `PUT /api/v1/faturas-venda/{id}/confirmar` | Confirme la facture → état `CONFIRMADO` |
| — | `PUT /api/v1/faturas-venda/{id}/confirmar` | Tente une double-confirmation → vérifie le `422` |
| — | `GET /api/v1/faturas-venda/{id}` | Vérifie la facture complète avec items et impostos |

### Endpoints principaux

#### Paramétrage

```http
GET    /api/v1/parametrizacao/impostos
POST   /api/v1/parametrizacao/impostos
GET    /api/v1/parametrizacao/series
POST   /api/v1/parametrizacao/series
GET    /api/v1/parametrizacao/tipos-fatura
POST   /api/v1/parametrizacao/tipos-fatura
GET    /api/v1/parametrizacao/unidades
POST   /api/v1/parametrizacao/unidades
GET    /api/v1/parametrizacao/moedas
POST   /api/v1/parametrizacao/moedas
GET    /api/v1/parametrizacao/metodos-pagamento
POST   /api/v1/parametrizacao/metodos-pagamento
```

#### Données maîtres

```http
GET    /api/v1/clientes
POST   /api/v1/clientes
GET    /api/v1/clientes/{id}
PUT    /api/v1/clientes/{id}
DELETE /api/v1/clientes/{id}

GET    /api/v1/fornecedores
POST   /api/v1/fornecedores

GET    /api/v1/produtos
POST   /api/v1/produtos
```

#### Factures de vente *(cycle complet)*

```http
GET    /api/v1/faturas-venda           # Liste toutes les factures
POST   /api/v1/faturas-venda           # Crée une facture (état RASCUNHO)
GET    /api/v1/faturas-venda/{id}      # Détail complet (items + impostos)
PUT    /api/v1/faturas-venda/{id}/confirmar  # RASCUNHO → CONFIRMADO
PUT    /api/v1/faturas-venda/{id}/anular     # → ANULADO
```

#### Exemple — Créer une facture de vente

```json
POST /api/v1/faturas-venda
{
  "tipoFaturaId": 1,
  "prSerieId": 1,
  "clienteId": 1,
  "dtFaturacao": "2026-04-06",
  "dtVencimentoFatura": "2026-05-06",
  "codigoReferencia": "REF-001",
  "nota": "Commande n°2026-001",
  "termCondicoes": "Paiement à 30 jours",
  "items": [
    {
      "numLinha": 1,
      "desig": "Consultoria em Desenvolvimento de Software",
      "quantidade": 2,
      "precoUnitario": 10000.00,
      "prUnidadeId": 1,
      "impostos": [
        {
          "impostoId": 1,
          "tipoCalculo": "PERCENTAGEM",
          "taxa": 15,
          "baseCalculo": 20000.00,
          "valorImposto": 3000.00,
          "ordem": 1
        }
      ]
    }
  ]
}
```

**Réponse (201) :** facture en état `RASCUNHO`, código `FT-2025-1`, `valorFatura = 23000.00 CVE`.

#### Exemple — Confirmer la facture

```http
PUT /api/v1/faturas-venda/1/confirmar
```

**Réponse (200) :** facture avec `estado = "CONFIRMADO"` et `dtConfirmacao = "2026-04-06"`.  
**Erreur (422) :** si la facture n'est pas en état `RASCUNHO`.  
**Erreur (404) :** si l'ID n'existe pas.

#### Factures d'achat et paiements

```http
GET    /api/v1/faturas-compra
POST   /api/v1/faturas-compra          # Structure identique à venda, avec fornecedorId

GET    /api/v1/pagamentos
POST   /api/v1/pagamentos              # Enregistre un paiement avec imputation sur factures
GET    /api/v1/pagamentos/{id}
GET    /api/v1/pagamentos/{id}/documentos
```

### Skills PowerShell (`.claude/skills/`)

```powershell
.\.claude\skills\health-check.ps1   # État Spring Boot, PostgreSQL, Docker, ports
.\.claude\skills\analyze-logs.ps1   # Extraction erreurs/exceptions des logs Spring
.\.claude\skills\db-reset.ps1       # Reset complet de la base PostgreSQL
.\.claude\skills\deep-clean.ps1     # Clean Maven + Docker + target/
```

### Réutiliser cette architecture dans un autre projet

```powershell
# Copier init-ai-env.ps1 à la racine du nouveau projet, puis :
.\init-ai-env.ps1 -ProjectName "MonProjet" -DbName "mon_db"
```

---

## Conventions de développement

| Règle | Application |
|-------|-------------|
| Montants | `BigDecimal` systématiquement — jamais `float` ni `double` |
| Transactions | `@Transactional` sur les `CommandHandler`, jamais sur les controllers |
| Entités | Étendent `AuditEntity`, annotées `@IgrpEntity` |
| DTOs | Annotés `@IgrpDTO`, validations Jakarta Bean Validation |
| Routes | Préfixe `api/v1/` |
| SQL | snake_case, noms de tables explicites |
| Imports | Jamais de wildcard `*` |

---

*Module eFatura — IGRP 3.0 © NOSI — Núcleo Operacional da Sociedade de Informação*
