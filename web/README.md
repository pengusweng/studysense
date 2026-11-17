# StudySense Web

Next.js (App Router, TypeScript) frontend, organised by feature.

```
src/
  app/                      # routes only: thin pages that render a container
  components/               # GLOBAL shared components
    atoms/ molecules/ organisms/
  features/<feature>/
    components/{atoms,molecules,organisms}/
    hooks/                  # state + data logic
    services/               # API calls
    containers/             # wires hooks to components; rendered by app/ pages
    types.ts
  lib/                      # shared utilities (http client, ...)
```

Flow: app/ page -> container -> hooks/services + organisms -> molecules -> atoms.
Features must not import from each other; share via `components/` or `lib/`.

```
npm install
cp .env.example .env.local
npm run dev
```
