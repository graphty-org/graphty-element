[@graphty/graphty-element](../../index.md) / [config](../index.md) / defaultXRConfig

# Variable: defaultXRConfig

> `const` **defaultXRConfig**: [`XRConfig`](../interfaces/XRConfig.md)

Defined in: [src/config/XRConfig.ts:166](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L166)

Default XR configuration

Note: XR is disabled by default to avoid issues with navigator.xr.isSessionSupported()
hanging in headless browser environments (CI, tests). Users who want XR should
explicitly enable it by setting xr.enabled: true in their configuration.
