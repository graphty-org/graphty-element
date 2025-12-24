import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitepress';
import { loadEnv } from 'vite';
import typedocSidebar from '../api/generated/typedoc-sidebar.json';

// Load environment variables from .env (reuse existing config)
const env = loadEnv('development', process.cwd(), '');

export default defineConfig({
    vite: {
        server: {
            host: env.HOST || true,
            port: env.DOCS_PORT ? parseInt(env.DOCS_PORT) : 9027,
            https: env.HTTPS_KEY_PATH && env.HTTPS_CERT_PATH ? {
                key: readFileSync(env.HTTPS_KEY_PATH),
                cert: readFileSync(env.HTTPS_CERT_PATH),
            } : undefined,
        },
    },

    title: 'Graphty',
    description: '3D/2D Graph Visualization Web Component',
    // Use /graphty-element/ for GitHub Pages project site deployment
    base: '/graphty-element/',

    vue: {
        template: {
            compilerOptions: {
                // Treat tags that look like type parameters as custom elements
                // to avoid Vue parsing errors in generated API docs
                isCustomElement: (tag) => tag.includes('>')
            }
        }
    },

    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/getting-started' },
            { text: 'API', link: '/api/' },
            // Points to Storybook deployed alongside docs at /storybook/
            { text: 'Examples', link: '/storybook/' }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Introduction',
                    items: [
                        { text: 'Getting Started', link: '/guide/getting-started' },
                        { text: 'Installation', link: '/guide/installation' },
                    ]
                },
                {
                    text: 'Usage',
                    items: [
                        { text: 'Web Component API', link: '/guide/web-component' },
                        { text: 'JavaScript API', link: '/guide/javascript-api' },
                        { text: 'Styling', link: '/guide/styling' },
                        { text: 'Style Helpers & Palettes', link: '/guide/style-helpers' },
                        { text: 'Layouts', link: '/guide/layouts' },
                        { text: 'Algorithms', link: '/guide/algorithms' },
                        { text: 'Data Sources', link: '/guide/data-sources' },
                        { text: 'Events', link: '/guide/events' },
                        { text: 'Camera', link: '/guide/camera' },
                        { text: 'Screenshots & Video', link: '/guide/screenshots' },
                        { text: 'VR/AR', link: '/guide/vr-ar' },
                    ]
                },
                {
                    text: 'Extending',
                    items: [
                        { text: 'Custom Layouts', link: '/guide/extending/custom-layouts' },
                        { text: 'Custom Algorithms', link: '/guide/extending/custom-algorithms' },
                        { text: 'Custom Data Sources', link: '/guide/extending/custom-data-sources' },
                    ]
                }
            ],
            '/api/': [
                { text: 'Overview', link: '/api/' },
                {
                    text: 'API References',
                    items: [
                        { text: 'Web Component API', link: '/api/web-component' },
                        { text: 'JavaScript API', link: '/api/javascript' },
                    ]
                },
                {
                    text: 'Generated TypeDoc',
                    collapsed: true,
                    items: typedocSidebar,
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/graphty-org/graphty-element' }
        ],

        search: {
            provider: 'local'
        },

        editLink: {
            pattern: 'https://github.com/graphty-org/graphty-element/edit/master/docs/:path'
        }
    }
});
