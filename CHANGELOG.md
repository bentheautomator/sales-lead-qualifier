# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.2.0](https://github.com/bentheautomator/sales-lead-qualifier/compare/v0.1.0...v0.2.0) (2026-03-09)

### Features

- **api:** add health check and server-side scoring endpoints ([10ac10a](https://github.com/bentheautomator/sales-lead-qualifier/commit/10ac10aaad5c73242bb670cf1cc16d5d3d6a1079))
- **glitter:** add NEXT_PUBLIC_ENABLE_GLITTER env feature flag ([6e1c5ad](https://github.com/bentheautomator/sales-lead-qualifier/commit/6e1c5ad5e0486fa6230c5f4013272cbc520d0cf3))
- **pages:** add /book and /guide follow-up pages with API endpoints ([a1f02bf](https://github.com/bentheautomator/sales-lead-qualifier/commit/a1f02bf383cd11aec738320f96ab8a8f4198be6d))
- **pdf:** add sales qualification playbook PDF generation ([2a012e5](https://github.com/bentheautomator/sales-lead-qualifier/commit/2a012e55a99699355781083b3e8c40a97f558056))
- **pdf:** rewrite playbook generation with Playwright HTML-to-PDF ([73c8168](https://github.com/bentheautomator/sales-lead-qualifier/commit/73c816866ece7c2f644fc5056bbe888419913142))
- **security:** add middleware, input validation, and security headers ([7282dd0](https://github.com/bentheautomator/sales-lead-qualifier/commit/7282dd0278ef5972f99d1f28324e6baf02b11862))
- **security:** move scoring to server-side with signed cookies ([cd8f5a5](https://github.com/bentheautomator/sales-lead-qualifier/commit/cd8f5a50930f23b2acf08c9f81a7451cd5f7a956))
- **ui:** add visual UX upgrade with dark mode, glitter, and animations ([b732b2f](https://github.com/bentheautomator/sales-lead-qualifier/commit/b732b2fe7e4a5c0d7409ece6ea3aa050fbe5f11b))
- **ux:** improve book and guide success states ([ac1164b](https://github.com/bentheautomator/sales-lead-qualifier/commit/ac1164bb73a3bddac9c207a2f0b8f331f717de4b))

### Bug Fixes

- **e2e:** update tests for /book and /guide pages ([78df8f8](https://github.com/bentheautomator/sales-lead-qualifier/commit/78df8f86f25fe725d6b70bbd896f95b303dc0b09))
- **security:** harden cookies and restore CSP for Next.js hydration ([0bba30d](https://github.com/bentheautomator/sales-lead-qualifier/commit/0bba30da4363299183852980926f71a37a9e910f))
- **ui:** move GlitterBomb pointer-events to inline style ([c76e85a](https://github.com/bentheautomator/sales-lead-qualifier/commit/c76e85a39897c04752af43b64a75a2cabaef0bc5))
- **ux:** simplify email confirmation text on success pages ([6fa3918](https://github.com/bentheautomator/sales-lead-qualifier/commit/6fa391809dbe65203a30683e889a28df637955d1))

### Tests

- **security:** add deliberately insecure cookie scenario for agent testing ([974ab2a](https://github.com/bentheautomator/sales-lead-qualifier/commit/974ab2a3915bcfe83d200b1d876d07fbc90c35b5))
- **security:** add validation, query params, and API endpoint tests ([9037966](https://github.com/bentheautomator/sales-lead-qualifier/commit/90379665ece8178bf644670a81c1790b8bb3bb25))

### Maintenance

- add security docs, e2e setup, cookie-monster agent, and deps ([8db5874](https://github.com/bentheautomator/sales-lead-qualifier/commit/8db58744952ecf5e11c718d956dace01e6e30189))
- exclude scripts/ from tsconfig and add \*.orig to gitignore ([9465b55](https://github.com/bentheautomator/sales-lead-qualifier/commit/9465b55e4f3f58967a01ca452b372e1332ffe9bd))

### Documentation

- add README, env example, and user guide ([8326ad4](https://github.com/bentheautomator/sales-lead-qualifier/commit/8326ad4249cc36a98745407c06d1e6cac1d7ce36))
- **security:** add security rules and update architecture in CLAUDE.md ([6a77159](https://github.com/bentheautomator/sales-lead-qualifier/commit/6a77159c08140b232008fa1e7130d837014b6b6e))

## 0.1.0 (2026-03-09)

### Features

- **qualifier:** add BANT lead qualification engine with multi-step form ([9d59395](https://github.com/bentheautomator/sales-lead-qualifier/commit/9d593952696763b474ddcebbfcd821dff888073e))

### Tests

- add component, config validation, and integration tests (107 total) ([842ea67](https://github.com/bentheautomator/sales-lead-qualifier/commit/842ea671f7877114d6c0ca99ce72967e265057b4))

### Documentation

- add Automators API, business strategy, and decisions analysis ([d3b6bd0](https://github.com/bentheautomator/sales-lead-qualifier/commit/d3b6bd094d70b7c83003d60888ac41f454a71a6f))
- add CLAUDE.md project guide and Automators upgrade analysis ([2236a0e](https://github.com/bentheautomator/sales-lead-qualifier/commit/2236a0e5fe373ba89892a9ef81612b178a4371f4))

### Maintenance

- add ESLint flat config, Prettier, and Lefthook git hooks ([cac49ba](https://github.com/bentheautomator/sales-lead-qualifier/commit/cac49bac76a0bef4e65017e6f0f081da6e8abfa0))
- **hooks:** configure lefthook with lint, format, and test gates ([a87448b](https://github.com/bentheautomator/sales-lead-qualifier/commit/a87448bf094c1167296304cb71f8dfe16e79dbc8))
- initialize Next.js 16 project with TypeScript and Tailwind v4 ([f9a3f88](https://github.com/bentheautomator/sales-lead-qualifier/commit/f9a3f888b3a5d0d69234c1da795a67d4faecf6fa))
