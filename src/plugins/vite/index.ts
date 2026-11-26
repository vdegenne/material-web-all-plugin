import type {Plugin} from 'vite'
import {createPluginHooks, type PluginOptions} from '../../core/plugin.js'

export interface MaterialWebAllOptions extends PluginOptions {}

/**
 * Vite adapter for the Material Web All plugin.
 *
 * Applies the transformation only during production builds.
 *
 * Accepts the same options as the Rollup plugin.
 */
export function materialWebAll(options?: MaterialWebAllOptions) {
	return {
		name: 'vite-plugin-material-web-all',
		...createPluginHooks(options),
		apply: 'build',
	} satisfies Plugin
}
