import {init, parse} from 'es-module-lexer'
import {detectComponents} from './detect.js'
import type {Mapping} from './mapping.js'

const lexerReady = init()

export interface TransformOptions {
	/**
	 * Whether to remove comments before detecting Material Web components.
	 *
	 * Defaults to `true`.
	 */
	ignoreComments?: boolean

	/**
	 * Package prefix used for generated imports.
	 *
	 * Can be changed to use a fork or a custom Material Web package.
	 * For example: `@mahmoodkhalil/material-web-3-demo`.
	 *
	 * Defaults to `@material/web`.
	 */
	prefix?: string
}

export async function transformSource(
	source: string,
	mapping: Mapping,
	{ignoreComments = true, prefix = '@material/web'}: TransformOptions = {},
): Promise<string> {
	await lexerReady

	const components = detectComponents(source, {ignoreComments})

	const [imports] = parse(source)

	const normalizedPrefix = prefix.replace(/\/+$/, '')

	const globalImports = new Set([
		`${normalizedPrefix}/all.js`,
		`${normalizedPrefix}/labs/gb/components/all.js`,
	])

	const allImports = imports.filter((item) => {
		if (item.type !== 'static' || !globalImports.has(item.specifier)) {
			return false
		}

		const declaration = source.slice(item.importStart, item.importEnd)

		return /^import\s*['"]/.test(declaration.trim())
	})

	const existingImports = new Set(
		imports
			.filter(
				(item) => item.type !== 'import-meta' && item.specifier !== undefined,
			)
			.map((item) => item.specifier),
	)

	const newImports = [...components]
		.map((component) => mapping[component])
		.filter((path): path is string => Boolean(path))
		.map((path) => path.replace(/^@material\/web(?=\/)/, normalizedPrefix))
		.filter((path) => !existingImports.has(path))

	let result = source

	for (const item of allImports.sort((a, b) => b.importStart - a.importStart)) {
		result = result.slice(0, item.importStart) + result.slice(item.importEnd)
	}

	if (newImports.length === 0) {
		return result
	}

	return `${newImports.map((path) => `import '${path}'`).join('\n')}\n${result}`
}
