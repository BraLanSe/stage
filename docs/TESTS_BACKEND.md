# Documentation Technique — Tests Backend eFatura

> Dernière mise à jour : 2026-05-18  
> Stack : Spring Boot 3 · JUnit 5 · Mockito · OpenPDF 1.3.43 · H2 (in-memory)

---

## Table des Matières

1. [Stratégie Globale](#1-stratégie-globale)
2. [Structure des Packages de Test](#2-structure-des-packages-de-test)
3. [Analyse par Classe de Test](#3-analyse-par-classe-de-test)
   - [FaturaItemCalculoTest](#31-faturaitemculotest)
   - [CreateFaturaVendaCommandHandlerTest](#32-createfaturavendacommandhandlertest)
   - [CreateFaturaCompraCommandHandlerTest](#33-createfaturacompracommandhandlertest)
   - [ConfirmarFaturaVendaCommandHandlerTest](#34-confirmarfaturavendacommandhandlertest)
   - [ConfirmarFaturaCompraCommandHandlerTest](#35-confirmarfaturacompracommandhandlertest)
   - [FaturaPdfServiceTest](#36-faturapdfservicetest)
   - [FaturaCompraPdfServiceTest](#37-faturacomprapdfservicetest)
   - [EFaturaApplicationTests](#38-efaturaapplicationtests)
4. [Tableau Récapitulatif](#4-tableau-récapitulatif)
5. [Guide d'Exécution Maven](#5-guide-dexécution-maven)

---

## 1. Stratégie Globale

Le projet eFatura combine **deux niveaux de test** complémentaires, chacun avec un périmètre et des outils distincts.

### Tests Unitaires (couche dominante)

Toutes les classes métier sont testées de manière **totalement isolée** grâce à l'annotation `@ExtendWith(MockitoExtension.class)`. Mockito simule les dépendances (repositories JPA, auditeurs Spring Security) afin que chaque test valide exclusivement la logique du handler ou du service ciblé, sans démarrer le contexte Spring ni toucher une base de données.

**Bénéfices :**
- Exécution sub-seconde par test (pas d'overhead Spring)
- Déterminisme total — aucun état persisté entre les tests
- Vérification précise des interactions via `verify()`

**Frameworks :**
- `JUnit 5` (assertions groupées `assertAll`, `assertThrows`, `assertDoesNotThrow`)
- `Mockito` (stubs `when/thenReturn`, vérifications `verify`, captureurs `argThat`)
- `@InjectMocks` pour l'injection automatique des dépendances simulées

### Tests d'Intégration

La classe `EFaturaApplicationTests` utilise `@SpringBootTest` pour valider le démarrage complet du contexte Spring. Elle s'appuie sur la base de données **H2 en mémoire** (`testdb`) déclarée dans `src/test/resources/application-test.properties`, garantissant une isolation totale par rapport aux bases PostgreSQL de développement/production.

**Avantage architectural :** aucun service externe n'est requis pour faire tourner la suite complète (`mvn test`).

---

## 2. Structure des Packages de Test

```
src/test/java/cv/igrp/fatura/
│
├── EFaturaApplicationTests.java                        ← Intégration Spring
│
├── shared/util/
│   └── FaturaItemCalculoTest.java                      ← Calculs financiers
│
├── venda/application/
│   ├── commands/
│   │   ├── CreateFaturaVendaCommandHandlerTest.java    ← Création facture vente
│   │   └── ConfirmarFaturaVendaCommandHandlerTest.java ← Confirmation vente
│   └── service/
│       └── FaturaPdfServiceTest.java                   ← PDF facture vente
│
└── compra/application/
    ├── commands/
    │   ├── CreateFaturaCompraCommandHandlerTest.java   ← Création facture achat
    │   └── ConfirmarFaturaCompraCommandHandlerTest.java ← Confirmation achat
    └── service/
        └── FaturaCompraPdfServiceTest.java             ← PDF facture achat
```

---

## 3. Analyse par Classe de Test

---

### 3.1 `FaturaItemCalculoTest`

**Localisation :** `src/test/java/cv/igrp/fatura/shared/util/FaturaItemCalculoTest.java`  
**Type :** Test unitaire pur — aucun mock, aucune dépendance Spring  
**Classe testée :** `cv.igrp.fatura.shared.util.FaturaItemCalculo`  
**Nombre de scénarios : 7**

Ce test valide le **moteur de calcul financier** utilisé par tous les handlers de création de factures. La méthode `FaturaItemCalculo.calcular()` prend en entrée une quantité, un prix unitaire, des pourcentages de remise (commerciale et financière) et un taux de TVA, et retourne un objet immuable contenant tous les montants calculés avec une précision de 4 décimales.

| # | Méthode de Test | Logique Vérifiée |
|---|----------------|-----------------|
| 1 | `shouldCalculateSimpleTotalWithoutDiscount` | `qty=2 × PU=100 = bruto 200, IVA 15% = imposto 30, total 230` — chemin nominal sans remise |
| 2 | `shouldCalculateTotalWithCommercialDiscountCorrectly` | Remise commerciale 10% sur 1 000 → `descontoComercialValor = 100`, `valorLiquido = 900`, IVA=0 |
| 3 | `shouldApplyFinancialDiscountAfterCommercialDiscount` | Application séquentielle : après descC 10% → 900, puis descF 5% sur 900 → `-45`, `valorLiquido = 855` |
| 4 | `shouldCalculateTotalWithBothDiscountsAndIva` | Scénario complet : `bruto=500, descC 20%=100, descF 5%=20, liquido=380, IVA 15%=57, total=437` |
| 5 | `shouldHandleNullInputsAsZeroOrOne` | Null-safety : `qty=null` interprété comme 1, `price=null` comme 0 → tous montants à 0 |
| 6 | `shouldCalculateWithMultipleQuantity` | `qty=3, PU=200, IVA=20% → bruto=600, imposto=120, total=720` |
| 7 | `shouldReturnZeroDiscountsWhenNoneProvided` | Remises à 0% → `descontoComercialValor = 0` et `descontoFinanceiroValor = 0` vérifiés par `compareTo` |

**Invariant clé :** `valorTotal = valorLiquido + valorImposto` avec `valorLiquido = valorBruto - descontoComercialValor - descontoFinanceiroValor`.

---

### 3.2 `CreateFaturaVendaCommandHandlerTest`

**Localisation :** `src/test/java/cv/igrp/fatura/venda/application/commands/CreateFaturaVendaCommandHandlerTest.java`  
**Type :** Test unitaire Mockito (`@ExtendWith(MockitoExtension.class)`)  
**Classe testée :** `CreateFaturaVendaCommandHandler`  
**Nombre de scénarios : 11**

Ce handler orchestre la création d'une facture de vente (CQRS) : validation des entités liées (cliente, série, type), calcul des montants via `FaturaItemCalculo`, construction de l'entité `FaturaVendaEntity`, et persistance. Le test utilise `@BeforeEach` pour préparer un `ClienteEntity`, une `PrSerieEntity` (code `FV`, compteur initial 0) et une `PrFaturaTipoEntity`.

**Mocks déclarés :**
- `FaturaVendaRepository`, `FaturaVendaItemRepository`, `FaturaVendaItemImpostoRepository`
- `ClienteRepository`, `PrFaturaTipoRepository`, `PrSerieRepository`
- `PrImpostoRepository`, `PrUnidadeRepository`, `ProdutoRepository`
- `ApplicationAuditorAware`

| # | Méthode de Test | Logique Vérifiée |
|---|----------------|-----------------|
| 1 | `shouldCreateFaturaVendaWithCorrectTotals` | `qty=4, PU=250 → valorIliquido=1000, valorImposto=0, valorFatura=1000` + code `FV-1` |
| 2 | `shouldSetInitialStateToRascunhoAndUnpaid` | État initial = `RASCUNHO`, `pago=false`, `valorPorPagar=valorFatura`, `valorPago=ZERO` |
| 3 | `shouldApplyCommercialDiscountCorrectlyOnItem` | `descC=10% sur 1000 → descontoComercialValor=100, valorLiquido=900, valorFatura=900` |
| 4 | `shouldApplyBothDiscountsSequentially` | `descC=10% + descF=5% : liquido=855, descontoFinanceiroValor=45` |
| 5 | `shouldIncrementSerieCounterOnEachCreation` | Avec compteur initial=3, vérifie `serieRepo.save(s → s.getContador() == 4)` via `argThat` |
| 6 | `shouldSumMultipleItemsIntoTotals` | Deux items `(2×100 + 1×300) → valorIliquido=500`, `items.size()=2` |
| 7 | `shouldThrowNotFoundWhenClienteDoesNotExist` | `clienteRepo.findById(999)` vide → `IgrpResponseStatusException(NOT_FOUND)` |
| 8 | `shouldThrowWhenDtVencimentoIsBeforeDtFaturacao` | `dtVencimento < dtFaturacao` → `UNPROCESSABLE_ENTITY` |
| 9 | `shouldThrowBadRequestWhenDesigMissingOnFreeTextItem` | Item sans produit et `desig="   "` → `BAD_REQUEST` |
| 10 | `shouldThrowBadRequestWhenPrecoPuMissingOnFreeTextItem` | Item sans produit et `precoUnitario=null` → `BAD_REQUEST` |
| 11 | `shouldMapClienteToSavedEntity` | `assertSame(cliente, saved.getCliente())` — l'entité client est transmise par référence |

---

### 3.3 `CreateFaturaCompraCommandHandlerTest`

**Localisation :** `src/test/java/cv/igrp/fatura/compra/application/commands/CreateFaturaCompraCommandHandlerTest.java`  
**Type :** Test unitaire Mockito (`@ExtendWith(MockitoExtension.class)`)  
**Classe testée :** `CreateFaturaCompraCommandHandler`  
**Nombre de scénarios : 10**

Symétrique au handler de vente, ce handler gère les factures d'achat. La différence principale est la présence d'informations bancaires (`fornecedorBanco`, `fornecedorIban`, `nossoBanco`, `nossoIban`) et l'entité `FornecedorEntity` en lieu et place de `ClienteEntity`. La série par défaut utilise le code `FT`.

**Mocks déclarés :**
- `FaturaCompraRepository`, `FaturaCompraItemRepository`, `FaturaCompraItemImpostoRepository`
- `FornecedorRepository`, `PrFaturaTipoRepository`, `PrSerieRepository`
- `PrImpostoRepository`, `PrUnidadeRepository`, `ProdutoRepository`
- `ApplicationAuditorAware`

| # | Méthode de Test | Logique Vérifiée |
|---|----------------|-----------------|
| 1 | `shouldCreateFaturaCompraWithCorrectTotals` | `qty=2, PU=500 → valorIliquido=1000, valorFatura=1000`, code `FT-1`, état `RASCUNHO`, `pago=false` |
| 2 | `shouldPersistBankingInformation` | Les 4 champs IBAN/banco (fournisseur + émetteur) sont fidèlement copiés sur l'entité sauvegardée |
| 3 | `shouldSetInitialStateToRascunho` | État=`RASCUNHO`, `pago=false`, `valorPago=ZERO`, `valorPorPagar=valorFatura` |
| 4 | `shouldIncrementSerieCounter` | Compteur initial=5 → vérifie `serieRepo.save(s → s.getContador() == 6)` |
| 5 | `shouldGenerateCodigoFromSerieAndCounter` | Série `FC`, compteur=9 → code généré = `FC-10` (compteur pré-incrémenté) |
| 6 | `shouldThrowNotFoundWhenFornecedorDoesNotExist` | `fornecedorRepo.findById(99)` vide → `NOT_FOUND` |
| 7 | `shouldThrowWhenDtVencimentoBeforeDtFaturacao` | `dtVencimento(2024-06-01) < dtFaturacao(2024-06-15)` → `UNPROCESSABLE_ENTITY` |
| 8 | `shouldThrowBadRequestWhenDesigMissingAndNoProdutoId` | Item `desig=""` sans produitId → `BAD_REQUEST` |
| 9 | `shouldCalculateValorFaturaWithMultipleItems` | `item1=(2×100=200) + item2=(3×50=150) → valorFatura=350`, `items.size()=2` |
| 10 | `shouldMapFornecedorToEntity` | `assertSame(fornecedor, saved.getFornecedor())` — mapping par référence d'objet |

---

### 3.4 `ConfirmarFaturaVendaCommandHandlerTest`

**Localisation :** `src/test/java/cv/igrp/fatura/venda/application/commands/ConfirmarFaturaVendaCommandHandlerTest.java`  
**Type :** Test unitaire Mockito  
**Classe testée :** `ConfirmarFaturaVendaCommandHandler`  
**Nombre de scénarios : 7**

Ce test valide la **machine à états** de la facture de vente. La règle métier centrale est que la confirmation est une **opération irréversible** : une facture `CONFIRMADO` ou `ANULADO` ne peut plus être modifiée. Le handler prend uniquement un identifiant en entrée (`ConfirmarFaturaVendaCommand(Integer id)`).

| # | Méthode de Test | Logique Vérifiée |
|---|----------------|-----------------|
| 1 | `shouldTransitionStateFromRascunhoToConfirmado` | `estado` passe de `RASCUNHO` à `CONFIRMADO`, `HTTP 200 OK` |
| 2 | `shouldSetDtConfirmacaoToToday` | `fatura.getDtConfirmacao()` == `LocalDate.now()` après confirmation |
| 3 | `shouldPreserveCodigoAndFinancialAmountsAfterConfirmation` | `codigo="FT-007"` et `valorFatura=500.00` inchangés après la transition |
| 4 | `shouldPersistViaRepositorySave` | `verify(faturaVendaRepo, times(1)).save(fatura)` — une seule persistance |
| 5 | `shouldThrowNotFoundWhenFaturaDoesNotExist` | `findById(404)` vide → `NOT_FOUND` |
| 6 | `shouldThrowUnprocessableWhenFaturaAlreadyConfirmada` | `estado=CONFIRMADO` → `UNPROCESSABLE_ENTITY` + `verify(repo, never()).save()` |
| 7 | `shouldThrowUnprocessableWhenFaturaAlreadyAnulada` | `estado=ANULADO` → `UNPROCESSABLE_ENTITY` |

---

### 3.5 `ConfirmarFaturaCompraCommandHandlerTest`

**Localisation :** `src/test/java/cv/igrp/fatura/compra/application/commands/ConfirmarFaturaCompraCommandHandlerTest.java`  
**Type :** Test unitaire Mockito  
**Classe testée :** `ConfirmarFaturaCompraCommandHandler`  
**Nombre de scénarios : 7**

Implémentation symétrique pour les factures d'achat. Les règles de cycle de vie sont identiques (`RASCUNHO → CONFIRMADO`, irréversibilité de `CONFIRMADO` et `ANULADO`).

| # | Méthode de Test | Logique Vérifiée |
|---|----------------|-----------------|
| 1 | `shouldTransitionStateFromRascunhoToConfirmado` | `estado` → `CONFIRMADO`, `HTTP 200 OK` |
| 2 | `shouldSetDtConfirmacaoToToday` | Date de confirmation == `LocalDate.now()` |
| 3 | `shouldPreserveCodigoAfterConfirmation` | `codigo="FT-42"` préservé, `estado="CONFIRMADO"` |
| 4 | `shouldPersistViaRepositorySave` | `verify(faturaCompraRepo, times(1)).save(fatura)` |
| 5 | `shouldThrowNotFoundWhenFaturaDoesNotExist` | `findById(999)` vide → `NOT_FOUND` |
| 6 | `shouldThrowUnprocessableWhenFaturaAlreadyConfirmada` | Re-confirmation bloquée → `UNPROCESSABLE_ENTITY` + pas de `save` |
| 7 | `shouldThrowUnprocessableWhenFaturaAlreadyAnulada` | Annulation déjà effectuée → `UNPROCESSABLE_ENTITY` |

---

### 3.6 `FaturaPdfServiceTest`

**Localisation :** `src/test/java/cv/igrp/fatura/venda/application/service/FaturaPdfServiceTest.java`  
**Type :** Test unitaire Mockito  
**Classe testée :** `FaturaPdfService` (génération PDF avec OpenPDF 1.3.43)  
**Méthode testée :** `service.gerarRecibo(FaturaVendaReadDTO dto)`  
**Nombre de scénarios : 9**

La stratégie ici est d'injecter `FaturaPdfService` via `@InjectMocks` tout en mockant ses deux repositories (`EntidadeRepository` et `FaturaVendaRepository`). Le `@BeforeEach` stubifie `entidadeRepo.findAll()` pour retourner une liste vide (émetteur non configuré). La génération PDF est ensuite appelée **directement** sur le service réel — OpenPDF produit les bytes sans démarrer Spring.

La validation de chaque test se fait à deux niveaux :
1. **Non-null et non-vide** (`pdf.length > 0`) — le service n'a pas levé d'exception
2. **Signature PDF** (`%PDF`) — les 4 premiers octets du tableau confirment un fichier PDF valide

| # | Méthode de Test | Scénario Couvert |
|---|----------------|-----------------|
| 1 | `shouldReturnNonEmptyByteArrayForValidFatura` | Facture standard `FT-1`, 1 000 CVE — contrôle non-null + longueur |
| 2 | `shouldProduceValidPdfSignatureForStandardFatura` | En-tête `%PDF` vérifiée sur `FT-99` (montant avec IVA 15%) |
| 3 | `shouldGeneratePdfWhenNoDiscountApplied` | `descontoComercial=0, descontoFinanceiro=0` — pas d'exception |
| 4 | `shouldGeneratePdfWhenFaturaValueIsZero` | `valorFatura=0` (remise commerciale 100%) — rendu sans division par zéro |
| 5 | `shouldGeneratePdfForClientWithoutNif` | `ClienteInfo.nif=null` — le bloc client s'affiche sans NIF |
| 6 | `shouldGeneratePdfForClientWithNif` | `nif="123456789"` — NIF inclus dans le document |
| 7 | `shouldGeneratePdfWithNotaFieldPopulated` | `nota="Entrega expressa…"` — champ note rendu correctement |
| 8 | `shouldGeneratePdfForFaturaWithMultipleItems` | 2 items (`Produto A`, `Produto B`) — tableau multi-lignes, en-tête `%PDF` |
| 9 | `shouldGeneratePdfWhenClienteIsNull` | `dto.setCliente(null)` — `assertDoesNotThrow`, robustesse au client anonyme |

---

### 3.7 `FaturaCompraPdfServiceTest`

**Localisation :** `src/test/java/cv/igrp/fatura/compra/application/service/FaturaCompraPdfServiceTest.java`  
**Type :** Test unitaire Mockito  
**Classe testée :** `FaturaCompraPdfService` (génération PDF avec OpenPDF 1.3.43)  
**Méthode testée :** `service.gerarPdf(FaturaCompraReadDTO dto)`  
**Nombre de scénarios : 11**

Même approche que `FaturaPdfServiceTest`, avec les spécificités des factures d'achat : le document inclut des sections dédiées aux **coordonnées bancaires** (IBAN du fournisseur et de l'émetteur), absentes des factures de vente.

| # | Méthode de Test | Scénario Couvert |
|---|----------------|-----------------|
| 1 | `shouldReturnNonEmptyByteArrayForValidFaturaCompra` | Facture achat `FC-1`, 2 000 CVE — contrôle non-null + longueur |
| 2 | `shouldProduceValidPdfSignatureForFaturaCompra` | En-tête `%PDF` sur `FC-2` (montant avec IVA) |
| 3 | `shouldGeneratePdfWhenNoDiscountApplied` | Aucune remise — génération sans erreur |
| 4 | `shouldGeneratePdfWhenFaturaValueIsZero` | `valorFatura=0` avec `descontoComercial=1000` — robustesse |
| 5 | `shouldGeneratePdfForFornecedorWithoutNif` | `FornecedorInfo.nif=null` — bloc fournisseur sans NIF |
| 6 | `shouldGeneratePdfForFornecedorWithNif` | `nif="987654321"` — NIF présent dans le document |
| 7 | `shouldGeneratePdfWithBankingInformation` | `fornecedorBanco/Iban` + `nossoBanco/Iban` renseignés — section bancaire rendue |
| 8 | `shouldGeneratePdfWithNoBankingInformation` | Tous les champs IBAN/banco à `null` — `assertDoesNotThrow` |
| 9 | `shouldGeneratePdfWithNotaFieldPopulated` | `nota="Fatura de fornecimento…"` — rendu du champ note |
| 10 | `shouldGeneratePdfWhenFornecedorIsNull` | `dto.setFornecedor(null)` — `assertDoesNotThrow`, fournisseur anonyme |
| 11 | `shouldGeneratePdfForFaturaCompraWithMultipleItems` | 2 items (`Papel A4`, `Tinta preta`) — tableau multi-lignes, en-tête `%PDF` |

---

### 3.8 `EFaturaApplicationTests`

**Localisation :** `src/test/java/cv/igrp/fatura/EFaturaApplicationTests.java`  
**Type :** Test d'intégration (`@SpringBootTest`)  
**Nombre de scénarios : 1**

| # | Méthode de Test | Logique Vérifiée |
|---|----------------|-----------------|
| 1 | `contextLoads` | Le contexte Spring Boot complet démarre sans erreur avec la configuration de test (H2 `testdb`) |

Ce test est un **smoke test** de démarrage : il garantit qu'aucune dépendance circulaire, aucune configuration manquante, et aucune erreur de bean n'empêche l'application de s'initialiser.

---

## 4. Tableau Récapitulatif

| Classe de Test | Type | Framework | Tests | Couverture Principale |
|---------------|------|-----------|-------|-----------------------|
| `FaturaItemCalculoTest` | Unitaire | JUnit 5 pur | 7 | Calculs financiers (remises, IVA, null-safety) |
| `CreateFaturaVendaCommandHandlerTest` | Unitaire | Mockito | 11 | Création facture vente, totaux, séries, validations |
| `CreateFaturaCompraCommandHandlerTest` | Unitaire | Mockito | 10 | Création facture achat, IBAN, totaux, séries |
| `ConfirmarFaturaVendaCommandHandlerTest` | Unitaire | Mockito | 7 | Machine à états vente (RASCUNHO → CONFIRMADO) |
| `ConfirmarFaturaCompraCommandHandlerTest` | Unitaire | Mockito | 7 | Machine à états achat (RASCUNHO → CONFIRMADO) |
| `FaturaPdfServiceTest` | Unitaire | Mockito + OpenPDF | 9 | Génération PDF vente (edge cases, NIF, notes, multi-items) |
| `FaturaCompraPdfServiceTest` | Unitaire | Mockito + OpenPDF | 11 | Génération PDF achat (IBAN, NIF, notes, multi-items) |
| `EFaturaApplicationTests` | Intégration | SpringBootTest + H2 | 1 | Démarrage du contexte complet |
| **TOTAL** | | | **63** | |

---

## 5. Guide d'Exécution Maven

### Exécuter toute la suite de tests

```bash
mvn test
```

Lance les 63 tests. Les tests unitaires s'exécutent sans infrastructure externe. Le test d'intégration utilise H2 en mémoire.

### Exécuter une classe de test spécifique

```bash
# Calculs financiers uniquement
mvn test -Dtest=FaturaItemCalculoTest

# Création facture vente
mvn test -Dtest=CreateFaturaVendaCommandHandlerTest

# Création facture achat
mvn test -Dtest=CreateFaturaCompraCommandHandlerTest

# Confirmation vente
mvn test -Dtest=ConfirmarFaturaVendaCommandHandlerTest

# Confirmation achat
mvn test -Dtest=ConfirmarFaturaCompraCommandHandlerTest

# PDF vente
mvn test -Dtest=FaturaPdfServiceTest

# PDF achat
mvn test -Dtest=FaturaCompraPdfServiceTest

# Test d'intégration uniquement
mvn test -Dtest=EFaturaApplicationTests
```

### Exécuter plusieurs classes en parallèle

```bash
mvn test -Dtest="FaturaItemCalculoTest,CreateFaturaVendaCommandHandlerTest,CreateFaturaCompraCommandHandlerTest"
```

### Exécuter un scénario précis

```bash
# Syntaxe: NomClasse#nomMethode
mvn test -Dtest="CreateFaturaVendaCommandHandlerTest#shouldApplyBothDiscountsSequentially"
mvn test -Dtest="FaturaItemCalculoTest#shouldCalculateTotalWithBothDiscountsAndIva"
```

### Générer le rapport Surefire (HTML)

```bash
mvn test && mvn surefire-report:report
# Rapport disponible dans : target/site/surefire-report.html
```

### Compiler sans exécuter les tests

```bash
mvn clean compile -DskipTests
```

### Exécuter uniquement les tests d'intégration (si séparés par convention)

```bash
mvn verify -Dit.test=EFaturaApplicationTests
```

---

*Documentation générée automatiquement à partir de l'analyse statique des sources de test du projet eFatura.*
