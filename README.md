# material-web-all-plugin

A Rollup/Vite plugin that automatically manages `@material/web` component imports for you.

It supports both the original [Material 3 Web components](https://github.com/material-components/material-web) (e.g. `md-filled-button`) and the upcoming [Material 3 Expressive components](https://github.com/material-components/material-web/tree/main/labs/gb/components) (e.g. `md-gb-split-button`).

## How to use

Install the package:

```bash
npm install material-web-all-plugin@nightly
```

Add global imports of Material Web at the top level of your application:

```ts
import '@material/web/all.js' // og components
import '@material/web/labs/gb/components/all.js' // expressive components
```

During development, the global import registers all Material Web components, making them available throughout your application. So you don't need to individually import them where you need them.

Then add the plugin to your Vite or Rollup configuration.

```ts
// vite.config.ts
import {materialWebAll} from 'material-web-all-plugin/vite'

export default defineConfig({
	plugins: [materialWebAll()],
})
```

At build time, the plugin removes the global imports and automatically injects individual component imports into each source file based on the elements it contains.

## Known limitations

When `ignoreComments` is enabled (default: `true`), the plugin removes comments before detecting Material Web components:

- HTML comments (`<!-- ... -->`)
- Single-line comments (`// ...`)
- Block comments (`/* ... */`)

This is a simple text-based approach, not a syntax-aware parser. Consequently, comment-like sequences inside JavaScript strings or template literals may also be removed. For example, URLs containing `//` may be affected.

Set `ignoreComments: false` to disable comment removal.

## License

This project is licensed under the [MIT License](./LICENSE).
