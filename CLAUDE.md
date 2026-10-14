# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Stripped-down starter based on Apollo v7.0.0 — PrimeTek's commercial Vue 3 admin template (PrimeVue 4 + Tailwind CSS v4 + Vite 5). Plain JavaScript (`<script setup>`, no TypeScript), `@` → `./src` alias. Demo pages were removed; only Dashboard, Settings, Help (+ NotFound) remain. The original template zip is the reference for any removed demo component.

## Commands

Lockfile is `package-lock.json` → npm.

- `npm run dev` — Vite dev server
- `npm run build` / `npm run preview`
- `npm run lint` — ESLint with `--fix` (vue3-essential + prettier)
- `npm run format` — Prettier write (js/vue only). Don't point `prettier --write` at `src/assets/` — vendor submodule styles, not in `.prettierignore`.

- `npm test` — Vitest (run once); `npm run test:watch` for watch mode
- Single file: `npx vitest run src/stores/__tests__/layout.spec.js`; single test: add `-t "<name>"`

Vitest is pinned to v3 because v4+/v5 require Vite 6+ (project is on Vite 5). Test environment is jsdom (`test` block in `vite.config.mjs`). Store tests live in `src/stores/__tests__/`: fresh `setActivePinia(createPinia())` and `localStorage.clear()` per test; `@primeuix/themes` is mocked in the layout tests. Don't `structuredClone` store state in tests (reactive proxies can't be cloned).

## Conventions

- SFC block order enforced by ESLint: `<script>`, `<template>`, `<style>`.
- Prettier: 4-space indent, single quotes, semicolons, no trailing commas, `printWidth: 250` (long lines are expected).
- PrimeVue components are **auto-imported** via `unplugin-vue-components` + `PrimeVueResolver` (`vite.config.mjs`) — don't add manual `import Button from 'primevue/button'`.
- `ToastService` and `ConfirmationService` are installed globally; a single `<Toast />` lives in `AppLayout.vue`.

## Architecture

- **Routing** (`src/router/index.js`): one root route renders `layout/AppLayout.vue` with app pages (`/`, `/settings`, `/help`) as lazy-loaded children; the catch-all NotFound is a top-level sibling without the layout. `meta.breadcrumb` (array) drives `AppBreadcrumb`. Sidebar items are a separate hardcoded model in `layout/AppMenu.vue` — adding a page means updating both router and menu.
- **State (Pinia)** (`src/stores/`): setup stores, each with an HMR snippet. `layout` = `config` (appearance: preset, primary, surface, darkTheme, menuMode, menuTheme; persisted) + `ui` (transient sidebar/menu/drawer flags) + getters (`isSlim`, `hasOverlaySubmenu`, …) and actions (`toggleMenu`, `setMenuMode(mode, path)`, `setPrimary`, `applyTheme`, …). `user` = profile; `preferences` = regional + notifications; `todos` = drawer To-Do list. Persistence uses `usePersistedRef(key, defaults)` from `stores/persisted.js` (localStorage key `app.<key>`, stored objects shallow-merged over defaults) — use it for any new state that should survive reloads. Components call `useXStore()` and access fields on the store object (don't destructure without `storeToRefs`). `AppLayout.vue` maps `layout.config`/`layout.ui` to `layout-*` CSS classes. Menu modes: static, overlay, slim, slim-plus, horizontal, reveal, drawer; menu themes: colorScheme, primaryColor, transparent.
- **Theming**: presets (Aura/Lara/Nora) and primary/surface palettes live in `src/layout/theme.js`; theme changes go through `layout` store actions (`@primeuix/themes` `$t` / `updatePreset` / `updateSurfacePalette`). `main.js` installs Pinia first, boots PrimeVue with the saved preset, then calls `layout.applyTheme()` to restore colors and dark mode. `layout/AppConfig.vue` is the inline Appearance panel (rendered in Settings > Appearance). Dark mode = `app-dark` class on `<html>` (matches `darkModeSelector` and the Tailwind `dark` custom variant in `assets/tailwind.css`).
- **Styling**: `src/assets/` is a git submodule (`primefaces/apollo-assets`, private — Vercel build fetches it with `GITHUB_ACCESS_TOKEN` via `.vercel/submodule-workaround.sh`). Layout SCSS lives in `assets/layout/` (split by sidebar mode, menu theme, light/dark variables), entry `assets/styles.scss` uses `@use`. Tailwind v4 is configured CSS-first in `assets/tailwind.css` (custom breakpoints sm 576 / md 768 / lg 992 / xl 1200 / 2xl 1920 + `tailwindcss-primeui` plugin); `tailwind.config.js` is a v3 leftover.
- **Utility drawer** (`src/layout/AppProfileSidebar.vue`, toggled by the topbar avatar via `layout.toggleProfileSidebar()`): To-Do list from the `todos` store and today's schedule (placeholder events generated for today).
- **Data**: no backend. `src/service/ProductService.js` returns hardcoded mock data (used by dashboard widgets); user/preferences data is only in Pinia + localStorage; Account section is a placeholder. Images used by kept pages live in `public/demo/images/{avatar,product}`.
- **Settings** (`views/settings/`): `SettingsLayout.vue` (left nav, tab strip below `lg`) + one child route per section (`/settings/<section>`, `/settings` redirects to profile). Sections are built from `components/settings/SettingsSection.vue` (header + actions slot) and `SettingsRow.vue` (label/description + control). Profile/Preferences edit a draft and commit on Save; Notifications/Appearance apply immediately. `AppMenuItem` keeps leaf items highlighted on nested routes.
- **Views**: top-level pages in `src/views/*.vue`. `Dashboard.vue` composes widgets from `components/dashboard-widgets/` (Chart.js charts via PrimeVue `Chart`).

## CI

`.github/workflows/ci.yml` runs on pull requests only (opened/synchronize/reopened): three parallel jobs — **Lint** (`npm run lint:check`, the non-fixing variant of `npm run lint`), **Unit tests** (`npm test`) and **Build** (`npm run build`) — each doing `npm ci` with Node from `.nvmrc`. Keep `.nvmrc` in sync when changing Node versions, and keep job `name:`s stable (they are the status-check names).

## Deployment

Vercel (`vercel.json`): SPA rewrite to `/index.html`; build runs the submodule workaround then `npm run build`.
