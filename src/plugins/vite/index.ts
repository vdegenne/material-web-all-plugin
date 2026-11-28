import type {Plugin} from 'vite'
import {createPluginHooks, type PluginOptions} from '../../core/plugin.js'

export interface MaterialWebAllOptions extends PluginOptions {
	/**
	 * Apply production transformations during development.
	 *
	 * Defaults to `false`.
	 */
	emulateProduction?: boolean
}

/**
 * Vite adapter for the Material Web All plugin.
 *
 * Applies the transformation during production builds,
 * or during development when emulateProduction is enabled.
 */
export function materialWebAll({
	emulateProduction = false,
	...options
}: MaterialWebAllOptions = {}) {
	return {
		name: 'vite-plugin-material-web-all',
		...createPluginHooks(options),
		apply: emulateProduction ? undefined : 'build',
	} satisfies Plugin
}
