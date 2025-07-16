## [1.0.4](https://github.com/graphty-org/graphty-element/compare/v1.0.3...v1.0.4) (2025-07-15)


### Bug Fixes

* fix npm provenance ([922edf5](https://github.com/graphty-org/graphty-element/commit/922edf5a13a1108457adfa9a2b6d2dc225cb95ae))

## [1.0.3](https://github.com/graphty-org/graphty-element/compare/v1.0.2...v1.0.3) (2025-07-15)


### Bug Fixes

* provenance for semantic release ([0785f04](https://github.com/graphty-org/graphty-element/commit/0785f04c660a740682c7a420a658e01df25c0d07))

## [1.0.2](https://github.com/graphty-org/graphty-element/compare/v1.0.1...v1.0.2) (2025-07-15)


### Bug Fixes

* allow side-effects to that the web component automatically gets registered ([b8f1e90](https://github.com/graphty-org/graphty-element/commit/b8f1e9048475aa6dca3d967ce1a86e717a101e91))

## [1.0.1](https://github.com/graphty-org/graphty-element/compare/v1.0.0...v1.0.1) (2025-07-15)


### Bug Fixes

* semantic release (take 3) ([f603c55](https://github.com/graphty-org/graphty-element/commit/f603c55ee25bd5725baea63c0724784cf7187363))

# 1.0.0 (2025-07-15)


### Bug Fixes

* build and optional argument fixes ([26a1ef6](https://github.com/graphty-org/graphty-element/commit/26a1ef6323a8aadb280fe4f0d9c3b66217846dc7))
* **config:** fix default config parsing ([dbaa610](https://github.com/graphty-org/graphty-element/commit/dbaa610a9aab497f081899315bad540c9eaf9ecd))
* **config:** fix label default values ([3b4f3bb](https://github.com/graphty-org/graphty-element/commit/3b4f3bb0f5af6ddad4638dc471ef07a3e1b46b14))
* correct edge-node connection gaps and enable label animation ([1a82a09](https://github.com/graphty-org/graphty-element/commit/1a82a090c045f4353bf78296426abdeb621d79c5)), closes [#35](https://github.com/graphty-org/graphty-element/issues/35) [#27](https://github.com/graphty-org/graphty-element/issues/27)
* **edge:** fix edge styling and caching ([7749c50](https://github.com/graphty-org/graphty-element/commit/7749c506567222427b7fe8973211bd97db956935))
* **edge:** fix typo in color ([e9497f7](https://github.com/graphty-org/graphty-element/commit/e9497f7f66057a47bd17d49eb0fbeec19cba9a0c))
* **element:** fix async firstUpdate ([3d74616](https://github.com/graphty-org/graphty-element/commit/3d7461608e90ebb805164afdbb80938962a08b63)), closes [#24](https://github.com/graphty-org/graphty-element/issues/24) [#15](https://github.com/graphty-org/graphty-element/issues/15)
* fix arrows, fix storybook build, fix chromatic visual tests, fix spiral ([e12e82a](https://github.com/graphty-org/graphty-element/commit/e12e82a6e7fc2f8c7c8d478f89d073e5861bd732))
* fix bugs caused by delinting ([bf9a250](https://github.com/graphty-org/graphty-element/commit/bf9a25069ae1d2b08eb4867fdf796605d10fae22))
* fix calculated values ([b324b7e](https://github.com/graphty-org/graphty-element/commit/b324b7e483b61c1874c94ae4a7a145b052181e2b))
* fix claude code notifications, make them global across all projects ([250899e](https://github.com/graphty-org/graphty-element/commit/250899ed3147400a5258ee907c79cd368507ea98))
* fix flipping when starting two finger gesture ([ad7a525](https://github.com/graphty-org/graphty-element/commit/ad7a5258599c9a9135b7c6cfb797bc4c788c9083))
* fix initial camera zoom for 2D ([9155d6a](https://github.com/graphty-org/graphty-element/commit/9155d6ac58faa30c3cea3a6b53f71b70c17c90d3))
* fix label background gradient ([16a7dad](https://github.com/graphty-org/graphty-element/commit/16a7dadeb2bbd365d60823c34fddc0151196ba1b))
* fix package names for semantic release ([91e0adf](https://github.com/graphty-org/graphty-element/commit/91e0adf55ba42208b2f47a17e0bf7df14829fd4b))
* fix semantic release, refactor edge, node, and richtextlabel to use their config objects ([e6e22a7](https://github.com/graphty-org/graphty-element/commit/e6e22a76b774f24e20a605cfe7b7da9024cfb021))
* fix typescript errors for 'any' ([3b78721](https://github.com/graphty-org/graphty-element/commit/3b78721aa2a40707563a3d36b1deac0fe3f44264))
* **graph:** fix async handling ([f93266c](https://github.com/graphty-org/graphty-element/commit/f93266cb6e18751680e5fd5d4a5aca3d5f8c1489))
* **graphty:** fix hanging promise when handling propperties ([7c799ff](https://github.com/graphty-org/graphty-element/commit/7c799fffd9fb685a607147fd73e1b7e94a1e76fd))
* **layout:** fix 2D layouts and stories to only render in 2D ([d4927af](https://github.com/graphty-org/graphty-element/commit/d4927afc974f5a23cd8c65f0866ef9c28321e726)), closes [#17](https://github.com/graphty-org/graphty-element/issues/17)
* **layout:** fix 3d layouts ([e7a962e](https://github.com/graphty-org/graphty-element/commit/e7a962eeb65ba79c1ea598bf0283d86fcc5b579d))
* **node:** fix node labels and behavior, add storybook stories for labels and wireframes ([bbce06a](https://github.com/graphty-org/graphty-element/commit/bbce06a69d5a74911afc228c39c35ea88e602a48)), closes [#21](https://github.com/graphty-org/graphty-element/issues/21) [#22](https://github.com/graphty-org/graphty-element/issues/22)
* **node:** fix node style updates ([a947def](https://github.com/graphty-org/graphty-element/commit/a947def8b7b72daf23fc3befd46ddff1d9406e7c))
* prevent label crashes with large fontSize values and improve type safety ([b28b5e6](https://github.com/graphty-org/graphty-element/commit/b28b5e60b63dde957222eca2522192f63685356e))
* remove P0 memory leaks ([dacaf8b](https://github.com/graphty-org/graphty-element/commit/dacaf8b18f1d3cb5aea20f0125b8fdcb36a14ec5))
* rename graphty canvas element ([40e4d85](https://github.com/graphty-org/graphty-element/commit/40e4d85524b9e6890221ec8de0049c16ce444126))
* semantic release ([df9ed11](https://github.com/graphty-org/graphty-element/commit/df9ed11af4e55aa29e0f1c9b7723b67052a5020f))
* semantic release ([985a12e](https://github.com/graphty-org/graphty-element/commit/985a12e89a0567629239275f5fec7aa05d5f3464))
* semantic release should only run 'npm run test' for now ([d4e8dec](https://github.com/graphty-org/graphty-element/commit/d4e8dec0e25ac2b9f6310ba46465b0e199506fe2))
* **style:** fix graph skybox rotation. close [#37](https://github.com/graphty-org/graphty-element/issues/37) ([dc3ebbd](https://github.com/graphty-org/graphty-element/commit/dc3ebbdf272879eab00cab83fc54302d7b1252d9))
* **style:** fix style layering ([9a64041](https://github.com/graphty-org/graphty-element/commit/9a6404156ca85c602f41fd277a7be0e8a56b2d6a))


### Features

* add 2d node style ([6eddc59](https://github.com/graphty-org/graphty-element/commit/6eddc59f4bdcddad55fa931c986c56be42f6fb66))
* add calculated styles for nodes ([7acb622](https://github.com/graphty-org/graphty-element/commit/7acb62270d50db3ab41686d57e7e06b99dda8986))
* add calculated values ([a2daa05](https://github.com/graphty-org/graphty-element/commit/a2daa05459fd9c7ea3b44d91bda0e4e407760ae9))
* add layout support from styleTemplate and fix multipartite story rendering ([6704bda](https://github.com/graphty-org/graphty-element/commit/6704bda7ebcd1e0ab443ed044df9f17dba0e619a)), closes [#19](https://github.com/graphty-org/graphty-element/issues/19)
* add rich text label ([97baf9d](https://github.com/graphty-org/graphty-element/commit/97baf9db269b67647d943e2ccb307bf3c8508ca3))
* add rich text labels and associated stories (wip) ([4d374b6](https://github.com/graphty-org/graphty-element/commit/4d374b69f3d67bad658b018107bc312d7b711449))
* add schema parsing and conversion to calculated values ([3e6512c](https://github.com/graphty-org/graphty-element/commit/3e6512c570efb83df7f4f9f0834ff4824a7c11f0))
* add working 2D camera, camera manager ([d599847](https://github.com/graphty-org/graphty-element/commit/d599847440a3e0f11a8f59cceaed5ae0ffc47621))
* **algorithm:** add algorithm api, add node degree algorithm and corresponding test ([01f8b94](https://github.com/graphty-org/graphty-element/commit/01f8b9498ec75a216c3a6d0b37304c4dfc2e1681)), closes [#14](https://github.com/graphty-org/graphty-element/issues/14)
* **edge:** add edge id ([e7b7a30](https://github.com/graphty-org/graphty-element/commit/e7b7a30d822d830ccbeee3d0944400d35c204ede))
* **graph:** add background color, add skybox ([94a52f7](https://github.com/graphty-org/graphty-element/commit/94a52f77ed1e16bad89ec0bfa922459437f5f46d))
* **graph:** add orbit controller with mouse, touch, and keyboard inputs and without gimbal lock ([24f24f4](https://github.com/graphty-org/graphty-element/commit/24f24f4ecd755b7078ec1c663f6a26c9911aa6b0))
* **graph:** add zoom on initial layout ([16f59cd](https://github.com/graphty-org/graphty-element/commit/16f59cd5d30c3ac103a3c8fbea594634bfe3175e))
* **graph:** add zoom-to-fit for initial layouts ([27c7016](https://github.com/graphty-org/graphty-element/commit/27c701651dcfe8dd3172b13d6d5c33cc2d01e46b)), closes [#6](https://github.com/graphty-org/graphty-element/issues/6) [#3](https://github.com/graphty-org/graphty-element/issues/3)
* **graph:** remove initial graph config options ([1bc6c26](https://github.com/graphty-org/graphty-element/commit/1bc6c26ad78a72e9086b0859e95799df27e33318)), closes [#23](https://github.com/graphty-org/graphty-element/issues/23)
* **graph:** silence babylonjs logs ([b53e8be](https://github.com/graphty-org/graphty-element/commit/b53e8beb4cdc5bf7c2f3f3e9116c0620f4e623a0))
* implement flexible layout dimension configuratio ([f6a2bad](https://github.com/graphty-org/graphty-element/commit/f6a2bad3be1f8747d95d5bca4bd8027923c8fe6d))
* **layout:** add arf and spectral layouts ([b573e36](https://github.com/graphty-org/graphty-element/commit/b573e363e6145528bf86c0fa69a432ba6fdac4f2))
* **layout:** add bfs layout, fix layout options ([3b4af6f](https://github.com/graphty-org/graphty-element/commit/3b4af6f3707cfe8a0e783b3ca8518facb96fe2db))
* **layout:** add bipartite and multipartite layouts ([30feb74](https://github.com/graphty-org/graphty-element/commit/30feb74a417830df2032a5fad3291d34b29388cb))
* **layout:** add forceatlas2 layout ([8cd570b](https://github.com/graphty-org/graphty-element/commit/8cd570b2845add320ca9b8d91a699251183a50e4))
* **layout:** add more sensible layout defaults ([6fa6583](https://github.com/graphty-org/graphty-element/commit/6fa65838cc24dbb11141d5451ed6b077abb0bd87))
* **style:** add 2d node style ([9c19704](https://github.com/graphty-org/graphty-element/commit/9c197048802717e6a3404e7249a0d403752b1f77))
* **styles:** add edge inheritance, add styles to web component ([2f600bc](https://github.com/graphty-org/graphty-element/commit/2f600bc04d5da288f1398b8d2e7538400e187072))
* **styles:** add style inheritance, other refactoring ([f4d80e8](https://github.com/graphty-org/graphty-element/commit/f4d80e8b3b17f60680e1d9a19fa045af6ee18051)), closes [#1](https://github.com/graphty-org/graphty-element/issues/1)
* **style:** update default styles ([b44114b](https://github.com/graphty-org/graphty-element/commit/b44114b28c57f71577422074349af46d79a515c3))
