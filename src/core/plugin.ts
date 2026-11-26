import {createFilter, type FilterPattern} from '@rollup/pluginutils'
import {loadMapping} from './mapping.js'
import type {TransformOptions} from './transform.js'
import {transformSource} from './transform.js'

export interface PluginOptions extends TransformOptions {
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

export function createPluginHooks({
	ignoreComments = true,
	prefix = '@material/web',
	include = /\.[cm]?[jt]sx?$/,
	exclude = /\/node_modules\//,
}: PluginOptions = {}) {
	const filter = createFilter(include, exclude)

	let mapping: Awaited<ReturnType<typeof loadMapping>>

	async function buildStart(): Promise<void> {
		mapping = await loadMapping()
	}

	async function transform(source: string, id: string): Promise<string | null> {
		if (!filter(id)) {
			return null
		}

		return transformSource(source, mapping, {
			ignoreComments,
			prefix,
		})
	}

	return {buildStart, transform}
}
