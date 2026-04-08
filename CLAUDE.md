# eFatura — Contexte Claude

## Projet
Module Core de Faturação — microserviço Spring Boot dans l'écosystème IGRP 3.0.
Base de données isolée par entreprise. Pas d'intégration eFatura dans ce module (phase 2 séparée).

## Stack technique
| Composant       | Version / Détail                        |
|-----------------|-----------------------------------------|
| Java            | 25                                      |
| Spring Boot     | 3.5.10                                  |
| Build           | Maven 3.x                               |
| Base de données | PostgreSQL 5432 / base `efatura_db`     |
| Sécurité        | OAuth2 + JWT (Keycloak) — désactivé en dev |
| Framework       | IGRP Framework core 0.1.0-beta.1        |
| OS Dev          | Windows 11, PowerShell 7+               |

## Commandes essentielles

```powershell
# Compiler le projet
mvn clean compile

# Lancer l'application (profil development)
mvn spring-boot:run

# Lancer avec profil spécifique
mvn spring-boot:run -Dspring-boot.run.profiles=development

# Build complet + tests
mvn clean package

# Build sans tests
mvn clean package -DskipTests

# Nettoyer profondément (voir skills)
.\.claude\skills\deep-clean.ps1

# Analyser les logs d'erreur
.\.claude\skills\analyze-logs.ps1

# Réinitialiser la base de données
.\.claude\skills\db-reset.ps1
```

## Base de données locale
```
Host     : localhost:5432
Database : efatura_db
User     : postgres
Password : postgres
Schema   : public
DDL auto : update (Hibernate)
```

Initialisation complète : `psql -U postgres -d efatura_db -f erp_core_setup.sql`

## Architecture du projet
```
src/main/java/cv/igrp/fatura/
├── shared/              # Infrastructure partagée (AuditEntity, Security, Bus)
├── parametrizacao/      # Tables de paramétrage (pr_*)
├── contabilidade/       # Plan de comptes GL (gl_conta)
├── cadastro/            # Données maîtres (entidade, cliente, fornecedor, produto)
├── venda/               # Factures de vente (fatura_venda + items + impostos)
├── compra/              # Factures d'achat (fatura_compra + items + impostos)
└── pagamento/           # Paiements et application sur documents
```

Chaque module suit la structure : `application/` → `domain/` → `infrastructure/` → `interfaces/`

## Conventions de code

- **Entités** : étendent `AuditEntity`, annotées `@IgrpEntity`, table snake_case
- **DTOs** : annotés `@IgrpDTO`, suffixe `DTO`, validations Jakarta
- **Commandes** : implémentent `Command`, traitées par `CommandHandler<C,R>`
- **Contrôleurs** : annotés `@IgrpController + @RestController`, préfixe `api/v1/`
- **Noms** : camelCase Java, snake_case SQL, PascalCase classes
- **Imports** : jamais de wildcard `*` dans les imports
- **BigDecimal** : toujours utilisé pour les montants, jamais float/double
- **Transactions** : `@Transactional` sur les CommandHandlers, jamais sur les contrôleurs

## Règle absolue — Format des solutions

> Toutes les solutions impliquant le système de fichiers, la base de données,
> la configuration, le build ou le déploiement **doivent être fournies sous forme
> de scripts PowerShell robustes** avec gestion d'erreurs (`try/catch`),
> messages de statut colorés (`Write-Host -ForegroundColor`) et vérification
> préalable des prérequis.

## Skills disponibles (`.claude/skills/`)

| Script              | Description                                      |
|---------------------|--------------------------------------------------|
| `deep-clean.ps1`    | Nettoyage Maven + Docker + target                |
| `analyze-logs.ps1`  | Analyse des logs Spring Boot — erreurs/exceptions|
| `db-reset.ps1`      | Reset complet de la base de données PostgreSQL   |
| `health-check.ps1`  | Vérification état Spring Boot, DB, Docker, ports |

## Git Hooks (`.githooks/`)

- `pre-commit` — Vérifications qualité avant commit (System.out, credentials, .env, gros fichiers)
- Activer les hooks : `.\.githooks\configure-hooks.ps1`

## MCP Servers configurés (`.claude/settings.json`)

| Serveur      | Capacité                                           |
|--------------|----------------------------------------------------|
| `postgres`   | Lire/écrire directement dans `efatura_db`          |
| `filesystem` | Accès fichiers au dossier du projet                |

## Réutiliser cette architecture dans un autre projet

```powershell
# Copier init-ai-env.ps1 à la racine du nouveau projet, puis :
.\init-ai-env.ps1 -ProjectName "MonProjet" -DbName "mon_db"
```

## Fichiers importants à ne pas modifier
- `src/main/java/cv/igrp/fatura/shared/` — infrastructure partagée
- `pom.xml` — dépendances IGRP Framework
- `.env` — variables d'environnement locales
