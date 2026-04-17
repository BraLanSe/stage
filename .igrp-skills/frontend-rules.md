# IGRP 3.0 Frontend Development Rules

> Reference absolute pour le développement Front-end eFatura.
> Stack: Next.js 15 + React 19 + TypeScript + Tailwind v4 + IGRP Framework.

---

## 1. IGRPContainer — Structure obligatoire

Chaque page IGRP **doit** déclarer un `IGRPContainer` caché en tête de composant.  
Les trois props `id`, `name`, et `tag` sont **non-négociables** — l'IGRP Studio les utilise pour enregistrer la page.

```tsx
import { IGRPContainer, IGRPButton } from "@igrp/igrp-framework-react-design-system";

// ✅ CORRECT — toujours en premier dans le return
<IGRPContainer id="nom-page" name="nom-page" tag="nom-page" className="hidden">
  <IGRPButton id="force-studio" name="force-studio" tag="force-studio">FORCE</IGRPButton>
</IGRPContainer>
```

**Règles :**
- `id` = identifiant unique kebab-case (ex: `faturas-venda`, `nova-fatura`)
- `name` = même valeur que `id`
- `tag` = même valeur que `id`
- `className="hidden"` — toujours caché, sert uniquement au Studio
- Le `IGRPButton` interne est requis pour forcer la détection par IGRP Studio

---

## 2. Composants Atomic IGRP

Imports depuis `@igrp/igrp-framework-react-design-system`.

| Composant | Usage | Props obligatoires |
|-----------|-------|--------------------|
| `IGRPContainer` | Wrapper de page/section | `id`, `name`, `tag` |
| `IGRPButton` | Bouton d'action | `id`, `name`, `tag` |
| `IGRPInput` | Champ texte/numérique | `id`, `name`, `tag` |
| `IGRPTable` | Tableau de données | `id`, `name`, `tag` |
| `IGRPSelect` | Liste déroulante | `id`, `name`, `tag` |

**Règle universelle :** Tout composant IGRP nécessite `id` + `name` + `tag`.  
Ces trois valeurs sont généralement identiques.

---

## 3. Structure des Pages

### Convention de routing
```
src/app/(igrp)/(myapp)/<feature>/
  page.tsx          ← liste
  nova/page.tsx     ← création
  [id]/page.tsx     ← détail / édition
```

- `(igrp)` et `(myapp)` sont des route groups Next.js → l'URL reste propre (`/faturas-venda`)
- Toutes les pages héritent du layout IGRP (sidebar + auth)
- Directive `"use client"` obligatoire sur toute page avec hooks React

### Template de page liste
```tsx
"use client";

import { IGRPContainer, IGRPButton } from "@igrp/igrp-framework-react-design-system";
import Link from "next/link";
import { useState } from "react";
import { useMonHook } from "@/hooks/use-mon-hook";

export default function MonPage() {
  const { data, isLoading, isError } = useMonHook();

  return (
    <div className="flex flex-col gap-0 p-0">
      {/* IGRP Studio registration — obligatoire */}
      <IGRPContainer id="mon-module" name="mon-module" tag="mon-module" className="hidden">
        <IGRPButton id="force-studio" name="force-studio" tag="force-studio">FORCE</IGRPButton>
      </IGRPContainer>

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white px-6 py-2.5">
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <Link href="/" className="hover:text-gray-700">Página Inicial</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Mon Module</span>
        </nav>
      </div>

      {/* Contenu */}
      <div className="p-5">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* ... */}
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Mapping des Champs Backend → Frontend

Les DTOs backend utilisent des noms en camelCase. Correspondances fréquentes :

| Entité backend | Champ DTO | Affichage frontend |
|----------------|-----------|--------------------|
| `FaturaVenda` | `numero` / `codigo` | Nº Documento |
| `FaturaVenda` | `clienteNome` | Cliente |
| `FaturaVenda` | `dataVencimento` | Data Vencimento (formatDate) |
| `FaturaVenda` | `total` / `valorFatura` | Valor da fatura (formatCVE) |
| `FaturaVenda` | `pagamentoStatus` | Badge Pagamento |
| `FaturaVenda` | `docFiscalStatus` | Badge Doc. Fiscal |
| `Modelo` | `desig` | Désignation/Nom |
| `Modelo` | `nome` | → utiliser `desig` si disponible |

**Règle de fallback :** Toujours prévoir un fallback pour les champs optionnels :
```tsx
{f.clienteNome ?? `Cliente ${f.clienteId}`}
{f.total ?? f.valorFatura ?? 0}
{f.numero ?? f.codigo ?? `#${f.id}`}
```

---

## 5. Gestion des Données — TanStack Query v5

### Pattern Hook standard
```typescript
// src/hooks/use-mon-module.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getItems, createItem } from "@/lib/api/mon-module";

export function useItems(page = 0, size = 10) {
  return useQuery({
    queryKey: ["items", page, size],
    queryFn: () => getItems(page, size),
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}
```

### Pattern API Client
```typescript
// src/lib/api/mon-module.ts
import { apiFetch } from "@/lib/api/client";
import type { MonDTO } from "@/app/(myapp)/types/efatura";

const BASE = "/mon-module";

export async function getItems(page: number, size: number) {
  return apiFetch<{ content: MonDTO[]; totalElements: number }>
    (`${BASE}?page=${page}&size=${size}`);
}

export async function createItem(payload: CreatePayload) {
  return apiFetch<MonDTO>(BASE, { method: "POST", body: JSON.stringify(payload) });
}
```

---

## 6. Formulaires — React Hook Form v7 + Zod v4

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  clienteId: z.number({ required_error: "Cliente obrigatório" }),
  dataEmissao: z.string().min(1, "Data obrigatória"),
  itens: z.array(z.object({
    produtoId: z.number(),
    quantidade: z.number().min(1),
    precoUnitario: z.number().min(0),
  })).min(1, "Adicione pelo menos um item"),
});

type FormData = z.infer<typeof schema>;

export default function NovaFaturaPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => { /* ... */ };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* champs */}
    </form>
  );
}
```

---

## 7. Types TypeScript

Tous les types centralisés dans :
```
src/app/(myapp)/types/efatura.ts
```

Déclarés dans `src/app/igrp.config.ts` :
```typescript
types: ["types/efatura"]
```

**Règle :** Pas de types inline dans les pages — toujours importer depuis `@/app/(myapp)/types/efatura`.

---

## 8. Architecture Backend (IGRP Spring Boot)

Comprendre le backend aide à aligner les appels API.

### Styles de structure projet
| Style | Description |
|-------|-------------|
| `technical` | CRUD simple — packages `controllers/services/models/dto` |
| `domain-lite` | CQRS léger avec split application/domain/infrastructure |
| `domain` | DDD complet — commandes, requêtes, événements séparés |

### Manifests IGRP Studio (`.igrpstudio/`)
Le générateur IGRP Studio crée des manifests JSON pour chaque entité :
```
.igrpstudio/baseApi.json          ← config de base
.igrpstudio/<module>/dto/         ← DTOs
.igrpstudio/<module>/controllers/ ← Controllers
.igrpstudio/<module>/models/      ← Entités JPA
.igrpstudio/<module>/enum/        ← Enums
```

### Stéréotypes IGRP (backend)
- `@IgrpController` → controller REST
- `@IgrpEntity` → entité JPA
- `@IgrpDTO` → objet de transfert

### Pattern CQRS (domain style)
- GET → `QueryBus.handle(new XxxQuery(...))` 
- POST/PUT/DELETE → `CommandBus.send(new XxxCommand(...))`

---

## 9. Formatage des données (Cape Verde)

```typescript
// Monnaie CVE
function formatCVE(value?: number) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("pt-CV", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Date portugais
function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
```

---

## 10. États métier — Machine à états Fatura

```
RASCUNHO → CONFIRMADO (final, immuable)
```

- `RASCUNHO` : éditable, supprimable
- `CONFIRMADO` : **immuable** — le backend retourne 422 sur toute modification
- Le bouton "Emitir DFE" n'est visible que si `estado === "CONFIRMADO"`

### Badges de statut

```tsx
// Pagamento
NAO_PROCESSADO → amber
PROCESSADO     → emerald
PARCIAL        → blue

// Doc. Fiscal Electrónico
NAO_ENVIADO → masqué
VALIDADO    → emerald
RECUSADO    → red
PENDENTE    → gray
```

---

## 11. Règles de Style (Tailwind v4)

- Pas de classes arbitraires sans raison — utiliser les classes utilitaires standard
- Palette cohérente : `blue-500` pour actions primaires, `red-*` pour destructif, `gray-*` pour neutre
- Tables : `min-w-[900px]` + `overflow-x-auto` sur le wrapper
- Cartes : `rounded-lg border border-gray-200 bg-white shadow-sm`
- Breadcrumb : toujours présent, `text-xs text-gray-500`

---

## 12. Menu Structure

```typescript
// src/temp/menus/menus.ts
applicationCode: "APP_EFATURA"

Vendas       → /faturas-venda
Compras      → /faturas-compra
Configurações → /parametrizacao, /cadastro
```

---

## 13. Checklist avant commit

- [ ] `IGRPContainer` présent avec `id`/`name`/`tag` identiques et `className="hidden"`
- [ ] Directive `"use client"` si hooks React utilisés
- [ ] Types importés depuis `@/app/(myapp)/types/efatura`
- [ ] Hook TanStack Query pour chaque appel API
- [ ] Schéma Zod pour chaque formulaire
- [ ] Gestion `isLoading` / `isError` dans chaque page liste
- [ ] `formatCVE` pour les montants, `formatDate` pour les dates
- [ ] État `CONFIRMADO` → champs désactivés, bouton Emitir visible
