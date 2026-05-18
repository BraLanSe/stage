# eFatura — Stratégie de Test Frontend (Next.js)

> **Stack technologique :** Next.js 15, React 19, TanStack Query v5, React Hook Form v7, Zod v4, IGRP Framework React Design System.
> **Outil de lint/format :** Biome (remplace ESLint + Prettier).

---

## Table des matières

1. [Stratégie globale](#1-stratégie-globale)
2. [Installation et configuration](#2-installation-et-configuration)
3. [Couverture des composants critiques](#3-couverture-des-composants-critiques)
   - 3.1 [Formulaire Nova Venda / Nova Compra](#31-formulaire-nova-venda--nova-compra)
   - 3.2 [Tabela de Produtos (useFieldArray)](#32-tabela-de-produtos-usefieldarray)
   - 3.3 [Menu latéral (Sidebar)](#33-menu-latéral-sidebar)
4. [Interaction API — hooks personnalisés](#4-interaction-api--hooks-personnalisés)
5. [Guide d'exécution](#5-guide-dexécution)
6. [Conventions et bonnes pratiques](#6-conventions-et-bonnes-pratiques)

---

## 1. Stratégie globale

### Objectif

Valider la logique métier critique sans dépendre du backend Spring Boot. Trois niveaux de test :

| Niveau | Outil | Portée |
|--------|-------|--------|
| **Unitaire** | Jest + `@testing-library/react` | Fonctions pures, composants isolés |
| **Intégration** | Jest + MSW (Mock Service Worker) | Hooks TanStack Query + enveloppe API JSON |
| **E2E (optionnel)** | Playwright | Parcours complet (login → création facture → confirmation) |

### Environnement

```
jest              → runner principal
@testing-library/react → render, fireEvent, userEvent, screen
@testing-library/user-event → interactions clavier/souris réalistes
msw               → interception des appels fetch vers /api/v1/*
jest-environment-jsdom → DOM simulé dans Node
```

MSW intercepte tous les appels vers `http://localhost:8080/api/v1/*` (URL configurée dans `src/lib/api/client.ts`) et retourne des fixtures JSON sans serveur réel.

### Philosophie

- **Tester le comportement, pas l'implémentation** : `screen.getByRole`, `screen.getByText`, jamais `wrapper.find('.some-class')`.
- **Éviter les snapshots** pour les composants dynamiques — ils cassent à chaque refactoring UI mineur.
- **Chaque test est autonome** : aucune dépendance d'état entre suites (`beforeEach` remet le store TanStack Query à zéro).

---

## 2. Installation et configuration

### Dépendances à ajouter

```bash
npm install --save-dev \
  jest \
  jest-environment-jsdom \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  msw \
  ts-jest \
  identity-obj-proxy
```

### `jest.config.ts`

```ts
import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterFramework: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.css$": "identity-obj-proxy",
  },
  collectCoverageFrom: [
    "src/app/(igrp)/(myapp)/**/*.tsx",
    "src/hooks/**/*.ts",
    "src/lib/api/**/*.ts",
    "!src/**/*.d.ts",
  ],
};

export default createJestConfig(config);
```

### `jest.setup.ts`

```ts
import "@testing-library/jest-dom";
import { server } from "./src/__mocks__/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### `src/__mocks__/server.ts` (MSW)

```ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

### `src/__mocks__/handlers.ts`

```ts
import { http, HttpResponse } from "msw";

const API = "http://localhost:8080/api/v1";

export const handlers = [
  // ── Clientes ─────────────────────────────────────────────────
  http.get(`${API}/clientes`, () =>
    HttpResponse.json({
      content: [
        { id: 1, codigo: "C-00000001", desig: "ACME Lda", estado: "ATIVO", indColetivo: true, nif: "123456789" },
        { id: 2, codigo: "C-00000002", desig: "João Silva", estado: "ATIVO", indColetivo: false },
      ],
      totalElements: 2, totalPages: 1, size: 50, number: 0, first: true, last: true, empty: false,
    })
  ),

  // ── Fornecedores ─────────────────────────────────────────────
  http.get(`${API}/fornecedores`, () =>
    HttpResponse.json({
      content: [
        { id: 10, codigo: "F-00000010", desig: "Tech Supplies SA", estado: "ATIVO", indColetivo: true },
      ],
      totalElements: 1, totalPages: 1, size: 50, number: 0, first: true, last: true, empty: false,
    })
  ),

  // ── Produtos ─────────────────────────────────────────────────
  http.get(`${API}/produtos`, () =>
    HttpResponse.json({
      content: [
        { id: 5, codigo: "PRD-10001", desig: "Ordinateur Portable", preco: 150000, estado: "ATIVO" },
        { id: 6, codigo: "PRD-10002", desig: "Écran 24 pouces", preco: 45000, estado: "ATIVO" },
      ],
      totalElements: 2, totalPages: 1, size: 50, number: 0, first: true, last: true, empty: false,
    })
  ),

  // ── Faturas Venda ─────────────────────────────────────────────
  http.get(`${API}/faturas-venda`, () =>
    HttpResponse.json({
      content: [],
      totalElements: 0, totalPages: 0, size: 10, number: 0, first: true, last: true, empty: true,
    })
  ),

  http.post(`${API}/faturas-venda`, () =>
    HttpResponse.json(
      { id: 99, codigo: "FT2025/001", estado: "RASCUNHO" },
      { status: 201 }
    )
  ),

  // ── Parametrização ────────────────────────────────────────────
  http.get(`${API}/parametrizacao/tipos-fatura`, () =>
    HttpResponse.json([
      { id: 1, codigo: "FT", desig: "Fatura" },
      { id: 2, codigo: "FR", desig: "Fatura-Recibo" },
    ])
  ),

  http.get(`${API}/parametrizacao/series`, () =>
    HttpResponse.json([
      { id: 1, codigo: "A", desig: "Série A 2025", contador: 0 },
    ])
  ),
];
```

---

## 3. Couverture des composants critiques

### 3.1 Formulaire Nova Venda / Nova Compra

**Fichier source :** `src/app/(igrp)/(myapp)/faturas-venda/nova/page.tsx`

#### Logique de remise commerciale bidirectionnelle

Le formulaire gère deux champs liés par ligne d'article :

| Champ | Rôle | Formule |
|-------|------|---------|
| `descontoPerc` (%) | Pourcentage de remise | `descontoValor = round2(baseTTC × perc / 100)` |
| `descontoValor` (CVE) | Montant de remise | `descontoPerc = round2((val / baseTTC) × 100)` |

`baseTTC = round2(quantite × prixTTC)` — le prix unitaire saisi est **TTC**, pas HT.

La fonction `calcItem` extrait l'HT après déduction de la remise :

```ts
function calcItem(qty, priceTTC, ivaPerc, descontoPerc = 0) {
  const baseTTC = round2(qty * priceTTC);
  const discTTC = round2(baseTTC * descontoPerc / 100);
  const netTTC  = round2(baseTTC - discTTC);
  const netHT   = round2(netTTC / (1 + ivaPerc / 100));
  const imposto = round2(netHT * ivaPerc / 100);
  return { bruto: netHT, imposto, total: round2(netHT + imposto) };
}
```

#### Tests unitaires — `calcItem`

```ts
// src/__tests__/utils/calcItem.test.ts
import { calcItem } from "@/app/(igrp)/(myapp)/faturas-venda/nova/page"; // export nommé nécessaire

describe("calcItem — logique de remise TTC", () => {
  it("calcule correctement sans remise", () => {
    const { bruto, imposto, total } = calcItem(2, 1000, 15);
    expect(bruto).toBeCloseTo(1739.13, 1);   // 2000 / 1.15
    expect(imposto).toBeCloseTo(260.87, 1);  // bruto × 0.15
    expect(total).toBe(2000);
  });

  it("remise 10% → réduction du montant TTC puis extraction HT", () => {
    const { total } = calcItem(1, 1000, 15, 10);
    expect(total).toBe(900); // 1000 - 10%
  });

  it("remise 100% → total zéro", () => {
    const { bruto, imposto, total } = calcItem(1, 500, 15, 100);
    expect(bruto).toBe(0);
    expect(imposto).toBe(0);
    expect(total).toBe(0);
  });

  it("arrondit à 2 décimales (spécification CVE §119)", () => {
    const { bruto } = calcItem(3, 100, 15);
    // 300 / 1.15 = 260.869... → round2 = 260.87
    expect(bruto).toBe(260.87);
  });
});
```

#### Tests d'intégration — formulaire Nova Venda

```ts
// src/__tests__/pages/nova-fatura-venda.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NovaFaturaVendaPage from "@/app/(igrp)/(myapp)/faturas-venda/nova/page";

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("NovaFaturaVendaPage — remise bidirectionnelle", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    render(<NovaFaturaVendaPage />, { wrapper: Wrapper });
  });

  it("affiche le formulaire avec les champs requis", async () => {
    await waitFor(() => {
      expect(screen.getByText("Nova Fatura de Venda")).toBeInTheDocument();
      expect(screen.getByLabelText(/client/i)).toBeInTheDocument();
    });
  });

  it("remise % → met à jour le montant CVE automatiquement", async () => {
    // 1. Ajouter un article manuellement
    await user.click(screen.getByRole("button", { name: /adicionar linha/i }));

    // 2. Renseigner quantité et prix
    const qtyInput = screen.getByRole("spinbutton", { name: /quantidade/i });
    await user.clear(qtyInput);
    await user.type(qtyInput, "2");

    const priceInput = screen.getByRole("spinbutton", { name: /preço unitário/i });
    await user.clear(priceInput);
    await user.type(priceInput, "1000");

    // 3. Saisir 10% de remise
    const discPercInput = screen.getByRole("spinbutton", { name: /desconto %/i });
    await user.clear(discPercInput);
    await user.type(discPercInput, "10");

    // 4. Vérifier que le champ CVE est calculé → 10% × 2000 = 200
    await waitFor(() => {
      const discValInput = screen.getByRole("spinbutton", { name: /desconto valor/i });
      expect(discValInput).toHaveValue(200);
    });
  });

  it("remise CVE → met à jour le pourcentage automatiquement", async () => {
    await user.click(screen.getByRole("button", { name: /adicionar linha/i }));

    const priceInput = screen.getByRole("spinbutton", { name: /preço unitário/i });
    await user.clear(priceInput);
    await user.type(priceInput, "1000");

    // Saisir 150 CVE de remise sur base TTC 1000
    const discValInput = screen.getByRole("spinbutton", { name: /desconto valor/i });
    await user.clear(discValInput);
    await user.type(discValInput, "150");

    // 150 / 1000 × 100 = 15%
    await waitFor(() => {
      const discPercInput = screen.getByRole("spinbutton", { name: /desconto %/i });
      expect(discPercInput).toHaveValue(15);
    });
  });

  it("empêche la soumission sans article", async () => {
    await user.click(screen.getByRole("button", { name: /criar fatura/i }));
    await waitFor(() => {
      expect(screen.getByText(/adicione pelo menos um item/i)).toBeInTheDocument();
    });
  });
});
```

---

### 3.2 Tabela de Produtos (useFieldArray)

**Fichier source :** utilise `useFieldArray({ control, name: "itens" })` de React Hook Form.

#### Comportement testé

| Scénario | Résultat attendu |
|----------|-----------------|
| Rendu initial | Tableau vide — message "Adicione produtos" affiché |
| Ajout via sélecteur | Nouvelle ligne ajoutée avec désignation, prix et IVA préremplis depuis le catalogue produit |
| Ajout manuel (+ Adicionar linha) | Ligne vide avec valeurs par défaut (`qty=1`, `iva=15`, `descontoPerc=0`) |
| Suppression d'une ligne | Ligne disparaît, totaux recalculés immédiatement |
| Totaux réactifs | `Valor Ilíquido`, `IVA`, `Total` mis à jour à chaque frappe |

#### Tests

```ts
// src/__tests__/components/tabela-produtos.test.tsx
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NovaFaturaVendaPage from "@/app/(igrp)/(myapp)/faturas-venda/nova/page";

const wrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe("Tabela de Produtos — useFieldArray", () => {
  const user = userEvent.setup();

  it("affiche un tableau vide au chargement initial", async () => {
    render(<NovaFaturaVendaPage />, { wrapper: wrapper() });
    // Aucune ligne de saisie présente
    await waitFor(() => {
      const rows = screen.queryAllByRole("row", { name: /descricao/i });
      expect(rows).toHaveLength(0);
    });
    // Total à zéro
    expect(screen.getByText(/0,00 CVE/)).toBeInTheDocument();
  });

  it("ajoute un produit depuis le catalogue et pré-remplit les champs", async () => {
    render(<NovaFaturaVendaPage />, { wrapper: wrapper() });

    // Attendre le chargement des produits MSW
    await waitFor(() => {
      expect(screen.getByText("Ordinateur Portable")).toBeInTheDocument();
    });

    // Sélectionner "Ordinateur Portable" (id=5, preco=150000)
    const select = screen.getByRole("combobox", { name: /selecionar produto/i });
    await user.selectOptions(select, "5");

    await user.click(screen.getByRole("button", { name: /adicionar produto/i }));

    // La ligne doit apparaître avec la désignation
    await waitFor(() => {
      expect(screen.getByDisplayValue("Ordinateur Portable")).toBeInTheDocument();
    });

    // Prix unitaire prérempli à 150000
    const priceField = screen.getByRole("spinbutton", { name: /preço unitário/i });
    expect(priceField).toHaveValue(150000);

    // IVA par défaut = 15%
    const ivaField = screen.getByRole("spinbutton", { name: /iva/i });
    expect(ivaField).toHaveValue(15);
  });

  it("ajoute une ligne manuelle vide via 'Adicionar linha'", async () => {
    render(<NovaFaturaVendaPage />, { wrapper: wrapper() });

    await user.click(screen.getByRole("button", { name: /adicionar linha/i }));

    const rows = screen.getAllByRole("row");
    // En-tête (1) + nouvelle ligne (1)
    expect(rows.length).toBeGreaterThanOrEqual(2);

    const qtyField = screen.getByRole("spinbutton", { name: /quantidade/i });
    expect(qtyField).toHaveValue(1);
  });

  it("supprime une ligne et met les totaux à jour", async () => {
    render(<NovaFaturaVendaPage />, { wrapper: wrapper() });

    await user.click(screen.getByRole("button", { name: /adicionar linha/i }));

    const delButton = screen.getByRole("button", { name: /remover/i });
    await user.click(delButton);

    await waitFor(() => {
      const rows = screen.queryAllByRole("spinbutton", { name: /quantidade/i });
      expect(rows).toHaveLength(0);
    });
  });

  it("recalcule les totaux en temps réel lors de la saisie", async () => {
    render(<NovaFaturaVendaPage />, { wrapper: wrapper() });

    await user.click(screen.getByRole("button", { name: /adicionar linha/i }));

    const priceInput = screen.getByRole("spinbutton", { name: /preço unitário/i });
    await user.clear(priceInput);
    await user.type(priceInput, "1000");

    // Total TTC = 1000 (qty=1, iva=15% inclus dans le prix TTC)
    await waitFor(() => {
      expect(screen.getByText(/1\.000/)).toBeInTheDocument();
    });
  });
});
```

---

### 3.3 Menu latéral (Sidebar)

**Fichier source :** `src/temp/menus/menus.ts` → consommé par le framework IGRP `@igrp/framework-next`.

#### Structure de navigation validée

```
APP_EFATURA
├── Venda (FOLDER, pos 0)
│   ├── Fatura de Venda        → /faturas-venda
│   ├── Cadastro de Cliente    → /cadastro-clientes   [badge vert  VENDA]
│   └── Produtos Vendidos      → /produtos-vendidos   [badge vert  VENDA]
├── Compra (FOLDER, pos 1)
│   ├── Fatura de Compra       → /faturas-compra
│   ├── Cadastro de Fornecedor → /cadastro-fornecedores [badge bleu COMPRA]
│   └── Produtos Comprados     → /produtos-comprados    [badge bleu COMPRA]
├── Configurações (FOLDER, pos 2)
│   ├── Parametrização         → /parametrizacao
│   ├── Dados Bancários        → /dados-bancarios
│   └── Empresa                → /empresa
└── Dashboard & Analytics (FOLDER, pos 3)
    ├── Analytics              → /dashboard
    └── Relatório de Vendas    → /reports/vendas
```

#### Tests — structure des menus

```ts
// src/__tests__/menus/menus.test.ts
import { IGRP_DEFAULT_MENU } from "@/temp/menus/menus";

describe("IGRP_DEFAULT_MENU — structure de navigation eFatura", () => {
  const efaturaMenus = IGRP_DEFAULT_MENU.filter(
    (m) => m.applicationCode === "APP_EFATURA"
  );

  const groups = efaturaMenus.filter((m) => m.type === "FOLDER" && !m.parentCode);
  const pages  = efaturaMenus.filter((m) => m.type === "MENU_PAGE");

  it("contient exactement 4 groupes de navigation", () => {
    expect(groups).toHaveLength(4);
  });

  it("les groupes sont dans l'ordre : Venda, Compra, Configurações, Dashboard", () => {
    const sorted = [...groups].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    expect(sorted.map((g) => g.code)).toEqual([
      "EFATURA_VENDAS_GROUP",
      "EFATURA_COMPRAS_GROUP",
      "EFATURA_CONFIG_GROUP",
      "EFATURA_RELATORIOS_GROUP",
    ]);
  });

  it("groupe Venda contient 3 entrées (Fatura, Cliente, Produtos Vendidos)", () => {
    const vendaChildren = pages.filter((m) => m.parentCode === "EFATURA_VENDAS_GROUP");
    expect(vendaChildren).toHaveLength(3);
    const urls = vendaChildren.map((m) => m.url);
    expect(urls).toContain("faturas-venda");
    expect(urls).toContain("cadastro-clientes");
    expect(urls).toContain("produtos-vendidos");
  });

  it("groupe Compra contient 3 entrées (Fatura, Fornecedor, Produtos Comprados)", () => {
    const compraChildren = pages.filter((m) => m.parentCode === "EFATURA_COMPRAS_GROUP");
    expect(compraChildren).toHaveLength(3);
    const urls = compraChildren.map((m) => m.url);
    expect(urls).toContain("faturas-compra");
    expect(urls).toContain("cadastro-fornecedores");
    expect(urls).toContain("produtos-comprados");
  });

  it("groupe Configurações contient Parametrização, Dados Bancários, Empresa", () => {
    const configChildren = pages.filter((m) => m.parentCode === "EFATURA_CONFIG_GROUP");
    const urls = configChildren.map((m) => m.url);
    expect(urls).toContain("parametrizacao");
    expect(urls).toContain("dados-bancarios");
    expect(urls).toContain("empresa");
  });

  it("tous les items MENU_PAGE ont un pageSlug non null", () => {
    for (const item of pages) {
      expect(item.pageSlug).toBeTruthy();
    }
  });

  it("aucun doublon d'id", () => {
    const ids = efaturaMenus.map((m) => m.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
```

#### Tests — distinction visuelle Vendido / Comprado

Les pages `produtos-vendidos` et `produtos-comprados` affichent des badges couleur dans la colonne **Tipo** :

```ts
// src/__tests__/pages/produtos-vendidos.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProdutosVendidosPage from "@/app/(igrp)/(myapp)/produtos-vendidos/page";
import ProdutosCompradosPage from "@/app/(igrp)/(myapp)/produtos-comprados/page";

const makeWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe("Badge Vendido (vert) — page Produtos Vendidos", () => {
  it("affiche les badges 'Vendido' en vert pour chaque produit", async () => {
    render(<ProdutosVendidosPage />, { wrapper: makeWrapper() });

    // MSW retourne 2 produits
    await waitFor(() => {
      const badges = screen.getAllByText("Vendido");
      expect(badges.length).toBeGreaterThanOrEqual(1);
      // Vérifier la classe CSS verte
      for (const badge of badges) {
        expect(badge).toHaveClass("bg-green-100");
        expect(badge).toHaveClass("text-green-700");
      }
    });

    // Le badge de contexte VENDA est présent dans l'en-tête
    expect(screen.getByText("VENDA")).toBeInTheDocument();
  });
});

describe("Badge Comprado (bleu) — page Produtos Comprados", () => {
  it("affiche les badges 'Comprado' en bleu pour chaque produit", async () => {
    render(<ProdutosCompradosPage />, { wrapper: makeWrapper() });

    await waitFor(() => {
      const badges = screen.getAllByText("Comprado");
      expect(badges.length).toBeGreaterThanOrEqual(1);
      for (const badge of badges) {
        expect(badge).toHaveClass("bg-blue-100");
        expect(badge).toHaveClass("text-blue-700");
      }
    });

    expect(screen.getByText("COMPRA")).toBeInTheDocument();
  });
});
```

---

## 4. Interaction API — hooks personnalisés

### Architecture des hooks

Tous les hooks suivent le même pattern **TanStack Query + enveloppe `PaginatedResponse<T>`** :

```
Appel fetch → apiRequest() → JSON brut → mapper fromXxxDTO() → type TypeScript
                                          ↓
                               { content: T[], totalElements, totalPages, ... }
```

Le backend Spring Boot retourne toujours `Page<Entity>` :

```json
{
  "content": [...],
  "totalElements": 42,
  "totalPages": 5,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false,
  "empty": false
}
```

Les hooks exposent `data.content` pour les listes et `data.totalElements` pour la pagination.

### `useFaturasVenda`

```ts
// src/hooks/use-faturas-venda.ts
export function useFaturasVenda(page = 0, size = 10) {
  return useQuery({
    queryKey: [FATURAS_VENDA_KEY, "list", page, size],
    queryFn: () => faturasVendaApi.listar(page, size),
  });
}
```

**Tests :**

```ts
// src/__tests__/hooks/use-faturas-venda.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFaturasVenda } from "@/hooks/use-faturas-venda";

describe("useFaturasVenda", () => {
  it("retourne data.content comme tableau (liste vide par défaut MSW)", async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useFaturasVenda(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // data.content est un tableau (vide dans le handler MSW)
    expect(Array.isArray(result.current.data?.content)).toBe(true);
    expect(result.current.data?.totalElements).toBe(0);
  });

  it("est en état 'loading' pendant la requête réseau", () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useFaturasVenda(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });
});
```

### `useClientes`

```ts
// src/hooks/use-cadastro.ts
export function useClientes(page = 0, size = 50) {
  return useQuery({
    queryKey: [CLIENTES_KEY, page, size],
    queryFn: () => cadastroApi.clientes.listar(page, size),
  });
}
```

**Tests :**

```ts
// src/__tests__/hooks/use-clientes.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useClientes } from "@/hooks/use-cadastro";

describe("useClientes — enveloppe PaginatedResponse", () => {
  const makeWrapper = () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );
  };

  it("extrait correctement data.content depuis la réponse paginée", async () => {
    const { result } = renderHook(() => useClientes(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // MSW retourne 2 clients
    expect(result.current.data?.content).toHaveLength(2);
    expect(result.current.data?.content[0].desig).toBe("ACME Lda");
    expect(result.current.data?.totalElements).toBe(2);
  });

  it("mappe correctement indColetivo → tipoEntidade", async () => {
    const { result } = renderHook(() => useClientes(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const acme = result.current.data?.content.find((c) => c.desig === "ACME Lda");
    expect(acme?.tipoEntidade).toBe("COLETIVO"); // indColetivo: true → COLETIVO

    const joao = result.current.data?.content.find((c) => c.desig === "João Silva");
    expect(joao?.tipoEntidade).toBe("SINGULAR"); // indColetivo: false → SINGULAR
  });

  it("mappe estado ATIVO → ativo: true", async () => {
    const { result } = renderHook(() => useClientes(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.content[0].ativo).toBe(true);
  });

  it("invalide le cache après création d'un client", async () => {
    // Tester que useCriarCliente appelle qc.invalidateQueries([CLIENTES_KEY])
    // → vérifiable via un spy sur queryClient.invalidateQueries
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const spy = jest.spyOn(qc, "invalidateQueries");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result: createResult } = renderHook(
      () => ({ criar: require("@/hooks/use-cadastro").useCriarCliente() }),
      { wrapper }
    );

    await createResult.current.criar.mutateAsync({
      desig: "Nouveau Client",
      tipoEntidade: "SINGULAR",
      ativo: true,
    });

    expect(spy).toHaveBeenCalledWith({ queryKey: ["clientes"] });
  });
});
```

### `useProdutos` — recherche avec debounce

```ts
// src/__tests__/hooks/use-produtos.test.ts
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useProdutos } from "@/hooks/use-cadastro";

describe("useProdutos — recherche", () => {
  it("retourne les produits mappés depuis le catalogue", async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useProdutos(0, 50), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // MSW retourne 2 produits
    expect(result.current.data?.content).toHaveLength(2);
    expect(result.current.data?.content[0].codigo).toBe("PRD-10001");
  });
});
```

---

## 5. Guide d'exécution

### Installation (une seule fois)

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react \
  @testing-library/user-event @testing-library/jest-dom msw ts-jest identity-obj-proxy
```

### Commandes npm

| Commande | Description |
|----------|-------------|
| `npm test` | Exécute tous les tests en mode CI (une passe, rapport final) |
| `npm run test:watch` | Mode interactif — relance les tests à chaque sauvegarde |
| `npm run test:coverage` | Génère le rapport de couverture dans `coverage/` |
| `npm run test:ci` | Mode CI strict — échoue si couverture < seuil défini |

### `package.json` — scripts à ajouter

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --coverageThreshold='{\"global\":{\"branches\":70,\"functions\":75,\"lines\":75,\"statements\":75}}'"
  }
}
```

### Seuils de couverture recommandés

| Métrique | Seuil minimum | Cible |
|----------|--------------|-------|
| Lignes | 70% | 85% |
| Fonctions | 75% | 90% |
| Branches | 65% | 80% |
| Logique métier (`calcItem`, mappers) | 90% | 100% |

---

## 6. Conventions et bonnes pratiques

### Organisation des fichiers

```
src/
└── __tests__/
    ├── utils/
    │   └── calcItem.test.ts          # Fonctions pures (calcItem, round2, formatCVE)
    ├── hooks/
    │   ├── use-faturas-venda.test.ts
    │   ├── use-clientes.test.ts
    │   └── use-produtos.test.ts
    ├── pages/
    │   ├── nova-fatura-venda.test.tsx
    │   ├── nova-fatura-compra.test.tsx
    │   ├── produtos-vendidos.test.tsx
    │   └── produtos-comprados.test.tsx
    └── menus/
        └── menus.test.ts
src/__mocks__/
    ├── server.ts    # MSW node server
    └── handlers.ts  # Route handlers pour tous les endpoints /api/v1/*
```

### Règles

1. **Chaque `describe` ne teste qu'un seul composant ou hook.** Éviter les suites de 20 assertions dans un seul `it`.
2. **Ne pas importer directement `fetch` ou `axios`** — tout passe par `apiRequest()` intercepté par MSW.
3. **Utiliser `userEvent` (asynchrone) plutôt que `fireEvent`** — plus fidèle aux interactions navigateur.
4. **Réinitialiser le `QueryClient` dans chaque `describe`** via `beforeEach` pour éviter les effets de bord.
5. **Les composants IGRP (`IGRPButton`, `IGRPTable`, etc.) doivent être mockés** si non testables en jsdom :
   ```ts
   jest.mock("@igrp/igrp-framework-react-design-system", () => ({
     IGRPButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
     IGRPTable: ({ content, columns }: any) => (
       <table>
         <tbody>
           {content.map((row: any, i: number) => (
             <tr key={i}>
               {columns.map((col: any) => (
                 <td key={col.accessorKey}>{col.render ? col.render(row[col.accessorKey]) : row[col.accessorKey]}</td>
               ))}
             </tr>
           ))}
         </tbody>
       </table>
     ),
     // ... autres composants
   }));
   ```
6. **Les tests de la logique bidirectionnelle de remise** (`descontoPerc` ↔ `descontoValor`) sont les plus critiques — toute régression ici affecte la validité fiscale des factures.

---

*Document généré le 2026-05-18 — eFatura v1.x / Next.js 15 / React 19*
