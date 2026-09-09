# [0.3.0](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.4.0...v0.3.0) (2026-09-09)


### Bug Fixes

* **catalog:** let agents invoke the catalog's functions ([2edc8a9](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/2edc8a97de84b44fc952e1bbe17d2f08b294854e)), closes [#1](https://github.com/alis-exchange/a2ui-vuetify-renderer/issues/1)
* **catalog:** validate function names inside dynamic values ([9b5c1d8](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/9b5c1d80c8ac3d820e1c7db430a612180ca9c004)), closes [#1](https://github.com/alis-exchange/a2ui-vuetify-renderer/issues/1)

# [0.3.0](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.2.0...v0.3.0) (2026-09-09)


### Bug Fixes

* **build:** externalize every web_core subpath and zod, guard the dist ([3164b6d](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/3164b6dd6592dea79b3ef52bc6d4f25e56150fd2))
* **catalog:** drop the dead Checkable definition from the generated catalog ([721492f](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/721492f4fb825e8116c0cd2b41800751e4800570))
* **catalog:** keep the Button schema readable by web_core's binder ([ed339f5](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/ed339f531ddfe3f468f0f9d1fcbe3ee8a4675f80))
* **components:** expand Form template children like every other container ([a906de5](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/a906de5a0fafa594356b400bb6c404b3458bd69b))
* **components:** give Slider one validation source per mode ([5e353a5](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/5e353a59754da5175f9739826a6cccff88390eb2))
* **components:** read dynamic props from the node's properties bag ([7e68bac](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/7e68bacb94609de776efe58d33c71b8926c43b0d))
* **core:** root template child paths on the enclosing data scope ([9a9748c](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/9a9748c8c629d8e9e1763b68990484bfdff60f39))
* **provider:** reconcile surface events against the model, not the event ([7cc15fb](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/7cc15fb82779df0ef33a6e84da5bf1e7a5ce0aa9))
* **provider:** warn when the processor is a Vue reactive proxy ([e2d6c93](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/e2d6c9390a90b444e5556a0bf02a78953becb73a))
* **validation:** evaluate protocol check conditions in createVuetifyRules ([ffccc09](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/ffccc09bd8a01c00bd3c6308513d3f4f0d2902bb))
* **validation:** ignore a null check entry instead of throwing ([261ddcd](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/261ddcd52a84918478603c4e4bcead03bb304f10))


### Features

* **catalog:** add createVuetifyFunctions with locale and Vuetify openUrl override ([75cf756](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/75cf756886faf6344ea4068d13a3be60b3b3df7a))
* **components:** gate Button and IconButton on binder validity ([6d4a68e](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/6d4a68e69ff9bda248b6cd9b68d1e8d131fbd0dc))
* **components:** show failing checks on Slider and DatePicker ([3b2d61f](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/3b2d61f0931b84b34eec890c5bc28b4ba2cb9f4d))
* **components:** surface binder validity on Slider and DatePicker via useChecks ([44dfe26](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/44dfe26c9c7738c5e0ee59f39965258b2e2d28e4))
* **core:** render live NodeResolver nodes in ComponentNode ([ba21cd2](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/ba21cd28745a23aad070e40af0539ccd670da0fe))
* **provider:** drive rendering from a NodeResolver per surface ([b5c9fb5](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/b5c9fb5ae10b5be699feaa3c75cdfe8da6e78787))


### Performance Improvements

* **core:** reuse the binder's resolved values in resolveValue ([d1ff7b1](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/d1ff7b113b008fdf5657f6e7234a48de55aebad9))

# [0.2.0](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.18...v0.2.0) (2026-06-09)

## [0.1.18](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.17...v0.1.18) (2026-06-09)

## [0.1.17](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.16...v0.1.17) (2026-06-09)

## [0.1.16](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.15...v0.1.16) (2026-06-09)

## [0.1.15](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.14...v0.1.15) (2026-06-09)

## [0.1.14](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.13...v0.1.14) (2026-06-09)

## [0.1.12](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.11...v0.1.12) (2026-04-09)


### Features

* implement CommonProps schema for components; enhance component APIs with accessibility and dynamic properties ([4729dc0](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/4729dc031d5077d43d5aa23ce03e932bf8b56a7d))

## [0.1.11](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.10...v0.1.11) (2026-04-08)


### Bug Fixes

* update npm_publish workflow to use pnpm for dependency management and streamline changelog generation steps ([c6d738a](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/c6d738a11ea383c59f556849553a7aaaba16f292))

## [0.1.10](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.9...v0.1.10) (2026-04-08)


### Bug Fixes

* restore import order and formatting in App.vue; update test structure in generate-catalog.spec.ts for consistency ([2ba6ae2](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/2ba6ae25ec246fbdfd49b0cf6f6eb1432d1fb517))


### Features

* enhance accessibility attributes in component schema; add dynamic string support for text property ([798866d](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/798866d7a82fcfb0e0b83a195dcfe65b89822eb7))
* introduce catalog filtering options for getCatalogSchema; add pre-built predicates for component selection ([1a1a6e7](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/1a1a6e7899fac21e26975e233676ee07ca1a78fb))

## [0.1.9](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.8...v0.1.9) (2026-04-01)


### Features

* add CustomChartWidget component and enhance App.vue with dynamic form surface controls ([42cc151](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/42cc151da5f8f0a694399ca59282fb7c945ca8d3))
* add option to include component schema when registering custom components ([74da0ad](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/74da0ad29a6e9178432d196f25514966c18dde14))

## [0.1.8](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.7...v0.1.8) (2026-03-31)


### Features

* add Vuetify components, functions, and theme schema to the catalog; ([75c2b78](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/75c2b78117689d793d0e9d2b94077ec7422ea9ba))

## [0.1.6](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.5...v0.1.6) (2026-03-31)


### Bug Fixes

* streamline color handling in A2UICalendar and remove unused validation rules in A2UIDatePicker ([079e356](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/079e3560454971d32c9504c758655797ecf0b0f1))

## [0.1.5](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.4...v0.1.5) (2026-03-31)


### Bug Fixes

* clean up useA2UI by standardizing formatting and improving readability ([e0bb78f](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/e0bb78fa39d18c049a7555e0c889717b6c771871))


### Features

* add action property to components and enhance event handling across the catalog ([153e9cb](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/153e9cbaa0fb7c5ffa763ef1d7c56d8270a46bf5))

## [0.1.4](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.3...v0.1.4) (2026-03-30)

## [0.1.3](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.2...v0.1.3) (2026-03-30)

## [0.1.2](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.1...v0.1.2) (2026-03-27)

## [0.1.1](https://github.com/alis-exchange/a2ui-vuetify-renderer/compare/v0.1.0...v0.1.1) (2026-03-27)


### Features

* implement a2ui surface, message processor, basic vuetify 4 components, component catalog ([086e029](https://github.com/alis-exchange/a2ui-vuetify-renderer/commit/086e029197f345419e444c11a7e37029d7885607))
