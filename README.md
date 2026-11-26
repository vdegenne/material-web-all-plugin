# material-web-all-plugin

A Rollup/Vite plugin that automatically manages `@material/web` component imports for you.

It supports both the original [Material 3 Web components](https://github.com/material-components/material-web) (e.g. `md-filled-button`) as well as [Material 3 Expressive components](https://github.com/material-components/material-web/tree/main/labs/gb/components) (e.g. `md-gb-split-button`).

## How to use

Install the package:

```bash
npm install material-web-all-plugin@nightly
```

Add global imports of Material Web at the top level of your application:

```ts
import '@material/web/all.js' // og components
import '@material/web/labs/gb/components/all.js' // expressive components

// The following is not needed if you don't use expressive elements
import {adoptStyles} from '@material/web/labs/gb/styles/adopt-styles.js'
import m3Styles from '@material/web/labs/gb/styles/m3.cssresult.js'
adoptStyles(document, [m3Styles])
```

That's really all you need during development. Just use the elements in your code _without_ individually importing them.

Then add the plugin to your Rollup or Vite configuration.

```ts
// vite.config.ts
import {materialWebAll} from 'material-web-all-plugin/vite'

export default defineConfig({
	plugins: [materialWebAll()],
})
```

At build time, the plugin removes the global import declarations and automatically injects individual component in each file where they are consumed, which optimizes code-splitting and helps reducing the size of your final bundle.

---

## Known limitations

1. HTML files are ignored. This plugin works best in a `js`/`ts`/`jsx` environment where templates are directly written into your JavaScript files.

2. When `ignoreComments` is enabled (default: `true`), the plugin removes comments before detecting Material Web components:

- HTML comments (`<!-- ... -->`)
- Single-line comments (`// ...`)
- Block comments (`/* ... */`)

This is a simple text-based approach, not a syntax-aware parser. Consequently, comment-like sequences inside JavaScript strings or template literals may also be removed. For example, URLs containing `//` may be affected.

Set `ignoreComments: false` to disable comment removal.

## License

This project is licensed under the [MIT License](./LICENSE).
