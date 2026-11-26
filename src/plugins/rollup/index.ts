import type {Plugin} from 'rollup'
import {createPluginHooks, type PluginOptions} from '../../core/plugin.js'

export interface MaterialWebAllOptions extends PluginOptions {}

/**
 * Rollup plugin for Material Web All.
 *
 * Accepts options to configure component detection and generated imports.
 */
export function materialWebAll(options?: MaterialWebAllOptions): Plugin {
	return {
		name: 'rollup-plugin-material-web-all',
		...createPluginHooks(options),
	}
}
