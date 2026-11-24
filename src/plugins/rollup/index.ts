import {createFilter, type FilterPattern} from '@rollup/pluginutils'
import type {Plugin} from 'rollup'
import {loadMapping} from '../../core/mapping.js'
import {transformSource} from '../../core/transform.js'

export interface MaterialWebAllOptions {
	/**
	 * Whether to remove comments before detecting Material Web components.
	 *
	 * Defaults to `true`.
	 */
	ignoreComments?: boolean

	/**
	 * Package prefix used for generated component imports.
	 *
	 * Allows using a fork or a custom Material Web package.
	 *
	 * Defaults to `@material/web`.
	 */
	prefix?: string

	/**
	 * File patterns to include in the transformation.
	 *
	 * Defaults to JavaScript and TypeScript files:
	 * `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, `.cts`.
	 */
	include?: FilterPattern

	/**
	 * File patterns to exclude from the transformation.
	 *
	 * Defaults to `/node_modules/`.
	 */
	exclude?: FilterPattern
}

export function materialWebAll({
	ignoreComments = true,
	prefix = '@material/web',
	include = /\.[cm]?[jt]sx?$/,
	exclude = /\/node_modules\//,
}: MaterialWebAllOptions = {}): Plugin {
	const filter = createFilter(include, exclude)

	let mapping: Awaited<ReturnType<typeof loadMapping>>

	return {
		name: 'vite-plugin-material-web-all',

		async buildStart() {
			mapping = await loadMapping()
		},

		async transform(source, id) {
			if (!filter(id)) {
				return null
			}

			return transformSource(source, mapping, {
				ignoreComments,
				prefix,
			})
		},
	}
}
