import type {Plugin} from 'vite'
import {
	materialWebAll as materialWebAllRollup,
	type MaterialWebAllOptions,
} from '../rollup/index.js'

/**
 * Vite adapter for the Material Web All plugin.
 *
 * Applies the transformation only during production builds.
 *
 * Accepts the same options as the Rollup plugin.
 */
export function materialWebAll(options?: MaterialWebAllOptions): Plugin {
	return {
		...materialWebAllRollup(options),
		apply: 'build',
	} as unknown as Plugin
}
