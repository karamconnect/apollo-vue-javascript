# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Stripped-down starter based on Apollo v7.0.0 — PrimeTek's commercial Vue 3 admin template (PrimeVue 4 + Tailwind CSS v4 + Vite 5). Plain JavaScript (`<script setup>`, no TypeScript), `@` → `./src` alias. Demo pages were removed; only Dashboard, Settings, Help (+ NotFound) remain. The original template zip is the reference for any removed demo component.

## Commands

Lockfile is `package-lock.json` → npm.

- `npm run dev` — Vite dev server
- `npm run build` / `npm run preview`
- `npm run lint` — ESLint with `--fix` (vue3-essential + prettier)
- `npm run format` — Prettier write

No test runner configured.

## Conventions

- SFC block order enforced by ESLint: `<script>`, `<template>`, `<style>`.
- Prettier: 4-space indent, single quotes, semicolons, no trailing commas, `printWidth: 250` (long lines are expected).
- PrimeVue components are **auto-imported** via `unplugin-vue-components` + `PrimeVueResolver` (`vite.config.mjs`) — don't add manual `import Button from 'primevue/button'`.
- `ToastService` and `ConfirmationService` are installed globally; a single `<Toast />` lives in `AppLayout.vue`.

## Architecture

- **Routing** (`src/router/index.js`): one root route renders `layout/AppLayout.vue` with app pages (`/`, `/settings`, `/help`) as lazy-loaded children; the catch-all NotFound is a top-level sibling without the layout. `meta.breadcrumb` (array) drives `AppBreadcrumb`. Sidebar items are a separate hardcoded model in `layout/AppMenu.vue` — adding a page means updating both router and menu.
- **Layout state** (`src/layout/composables/layout.js`): `layoutConfig` / `layoutState` are module-level `reactive` singletons shared by every `useLayout()` caller (no Pinia). `AppLayout.vue` maps them to `layout-*` CSS classes on `.layout-wrapper`. Menu modes: static, overlay, slim, slim-plus, horizontal, reveal, drawer; menu themes: colorScheme, primaryColor, transparent.
- **Theming** (`src/layout/AppConfig.vue`): inline panel rendered in the Settings page "Appearance" card (no theme drawer). Runtime preset switching (Aura/Lara/Nora) via `@primeuix/themes` `updatePreset` / `updateSurfacePalette`; primary/surface palettes are hardcoded there. Dark mode = toggling `app-dark` class on `<html>` (matches `darkModeSelector` in `main.js` and the Tailwind `dark` custom variant in `assets/tailwind.css`).
- **Styling**: `src/assets/` is a git submodule (`primefaces/apollo-assets`, private — Vercel build fetches it with `GITHUB_ACCESS_TOKEN` via `.vercel/submodule-workaround.sh`). Layout SCSS lives in `assets/layout/` (split by sidebar mode, menu theme, light/dark variables), entry `assets/styles.scss` uses `@use`. Tailwind v4 is configured CSS-first in `assets/tailwind.css` (custom breakpoints sm 576 / md 768 / lg 992 / xl 1200 / 2xl 1920 + `tailwindcss-primeui` plugin); `tailwind.config.js` is a v3 leftover.
- **Utility drawer** (`src/layout/AppProfileSidebar.vue`, opened by the topbar avatar via `layoutState.profileSidebarVisible`): today's To-Do list (persisted to `localStorage` key `app.todos`) and schedule (placeholder events generated for today).
- **Data**: no backend. `src/service/ProductService.js` returns hardcoded mock data (used by dashboard widgets); Settings form state is local and "Save" only shows a toast. Images used by kept pages live in `public/demo/images/{avatar,product}`.
- **Views**: flat `src/views/*.vue`. `Dashboard.vue` composes widgets from `components/dashboard-widgets/` (Chart.js charts via PrimeVue `Chart`).

## Deployment

Vercel (`vercel.json`): SPA rewrite to `/index.html`; build runs the submodule workaround then `npm run build`.
