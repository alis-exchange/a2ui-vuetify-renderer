# Contributing to A2UI Vuetify Renderer

Thank you for helping improve this project. Clear contribution guidelines save time for both maintainers and contributors. GitHub surfaces this file on the repository **Contributing** tab and when opening issues or pull requests; see [Setting guidelines for repository contributors](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors) for how that works.

## Code of conduct

Be respectful and constructive. Assume good intent, keep feedback specific, and focus on the problem or the code.

## What to contribute

Useful contributions include bug reports with reproduction steps (minimal A2UI JSONL or host-app snippet when possible), failing tests, documentation fixes, and focused pull requests that solve one problem at a time.

## Before you start

- Read [README.md](README.md) for installation, setup in a host app, and how consumers use the library.
- For architecture, component catalog rules, `web_core` integration, and testing patterns, see [AGENTS.md](AGENTS.md).

## A2UI documentation

This package implements the [A2UI Protocol v0.9](https://a2ui.org/specification/v0.9-a2ui/) on top of [`@a2ui/web_core`](https://github.com/google/A2UI/tree/main/renderers/web_core). These official guides complement [AGENTS.md](AGENTS.md) and help when you change protocol behavior, catalogs, or host integration:

| Topic | Link |
| ----- | ---- |
| **Renderer development** — what a compliant renderer must do, how web renderers use `web_core`, protocol checklist | [Renderer Development](https://a2ui.org/guides/renderer-development/) |
| **Client setup** — integrating a renderer, message flow, actions, transports | [Client Setup](https://a2ui.org/guides/client-setup/) |
| **Custom catalogs** — JSON Schema catalogs, registering components with the client, `supportedCatalogIds` | [Defining Your Own Catalog](https://a2ui.org/guides/defining-your-own-catalog/) |
| **Theming** — semantic hints vs renderer-controlled styling | [Theming & Styling](https://a2ui.org/guides/theming/) |
| **Component reference** — standard component shapes and properties | [Component Gallery](https://a2ui.org/reference/components/) |
| **Agents** — how agents generate surfaces and messages | [Agent Development](https://a2ui.org/guides/agent-development/) |
| **Messages** — `createSurface`, `updateComponents`, `updateDataModel`, etc. | [Message Reference](https://a2ui.org/reference/messages/) |

For **custom components and catalog extensions in this Vue renderer** (registry, `getCatalogSchema`, `useA2UI` / `useDynamicProps`), follow [AGENTS.md](AGENTS.md) and the “Custom components” sections in [README.md](README.md).

## Development setup

### Requirements

- **Node.js** — use a current **LTS** release (for example 20.x or 22.x).
- **pnpm** — this repo uses pnpm; install it from [pnpm.io](https://pnpm.io/installation) if needed.

### Clone and install

```shell
git clone https://github.com/alis-exchange/a2ui-vuetify-renderer.git
cd a2ui-vuetify-renderer
pnpm install
```

If you use a fork or a monorepo layout, run `pnpm install` from the directory that contains this package’s `package.json`.

## Common commands

| Command | Purpose |
| ------- | ------- |
| `pnpm dev` | Vite dev server (playground under `examples/client/`) |
| `pnpm build` | Type-check (`vue-tsc`) then Vite library build → `dist/` |
| `pnpm test` | Full Vitest suite |
| `pnpm generate:catalog` | Regenerate `catalog/vuetify-catalog.json` from Zod schemas |
| `pnpm format` | Prettier on `src/`, `examples/`, `scripts/` |

Run `pnpm build` and `pnpm test` before opening a PR that changes library code.

## Catalog and components

- **`catalog/vuetify-catalog.json` is generated** — do not edit it by hand. Change Zod schemas in `src/catalog/vuetify-components.ts` (and related generator code in `scripts/generate-catalog.ts` when needed), then run `pnpm generate:catalog`.
- **Registry alignment** — new or renamed components must be registered in `src/core/defaultCatalog.ts` and covered by the generator’s checks. See [AGENTS.md](AGENTS.md) for the full checklist (Vue file, Zod `ComponentApi`, tests).

## Code style

- **Prettier** — run `pnpm format` on files you touch, or configure your editor to format on save (see `.prettierrc.json`).
- **TypeScript** — the project uses strict settings; prefer explicit types on public APIs and `resolveValue<V>()` generics in components as in existing code.
- **ESLint** — an ESLint flat config is present; align new code with surrounding patterns in `src/`.

## Making a change

1. **Prefer small PRs** — one logical change per pull request when possible.
2. **Add or extend tests** for behavior you fix or introduce (Vitest + `@vue/test-utils`; see `src/**/*.spec.ts` and `scripts/generate-catalog.spec.ts`).
3. **Run `pnpm test` and `pnpm build`** before opening a PR.
4. **Documentation** — update **AGENTS.md** when the change is **significant** for people working on or integrating the renderer (for example: new components, catalog schema shape, plugin API, or contributor workflows). Small fixes, internal refactors, or changes that do not affect documented behavior do **not** require an AGENTS.md update.

## Pull requests

A good PR usually includes:

- A short description of the problem and what you changed.
- Test updates when behavior changes.
- Regenerated catalog output (`pnpm generate:catalog`) when Zod schemas or generator logic changes—review the diff carefully.
- No unrelated refactors or formatting-only churn in files you did not need to touch.

If the change is user-visible (bug fix or feature), note it in the PR body so maintainers can decide whether release notes or a version bump are needed.

## Issues

**Bug reports** are most actionable when they include:

- Versions: Node, `pnpm`, `@alis-build/a2ui-vuetify-renderer` (or commit), and peer deps in the host app (`vue`, `vuetify`, `@a2ui/web_core`) when relevant.
- Expected vs actual behavior (UI, console errors, or incorrect rendering).
- Minimal reproduction: A2UI message stream snippet, or steps using `examples/client` if applicable.

**Feature requests** are welcome; describe the use case (for example a missing A2UI mapping, catalog extension, or integration pain with Vuetify/`web_core`) so maintainers can weigh design trade-offs.

## License

By contributing, you agree your contributions are licensed under the same terms as the project — see [LICENSE](LICENSE).
