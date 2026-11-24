## Limitations

When `ignoreComments` is enabled (default: `true`), the plugin removes comments before detecting Material Web components:

- HTML comments (`<!-- ... -->`)
- Single-line comments (`// ...`)
- Block comments (`/* ... */`)

This is a simple text-based approach, not a syntax-aware parser. Consequently, comment-like sequences inside JavaScript strings or template literals may also be removed. For example, URLs containing `//` may be affected.

Set `ignoreComments: false` to disable comment removal.
