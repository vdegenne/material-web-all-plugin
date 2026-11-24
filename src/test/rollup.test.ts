import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {materialWebAll} from '../plugins/rollup/index.js'

async function createPlugin() {
	const plugin = materialWebAll()

	if (typeof plugin.buildStart !== 'function') {
		throw new Error('buildStart hook is not a function')
	}

	if (typeof plugin.transform !== 'function') {
		throw new Error('transform hook is not a function')
	}

	await plugin.buildStart.call({} as never, {} as never)

	return {
		async transform(source: string, id: string) {
			const hook = plugin.transform

			if (!hook) {
				throw new Error('transform hook is not defined')
			}

			const handler = typeof hook === 'function' ? hook : hook.handler

			return handler.call({} as never, source, id)
		},
	}
}

const source = `
	const template = html\`
		<md-filled-button>Submit</md-filled-button>
	\`
`

describe('materialWebAll', () => {
	it('transforms JavaScript and TypeScript files by default', async () => {
		const plugin = await createPlugin()

		const result = await plugin.transform(source, '/src/example.ts')

		assert.equal(typeof result, 'string')
		assert.match(result as string, /@material\/web\/button\/filled-button\.js/)
	})

	it('ignores files outside the default extensions', async () => {
		const plugin = await createPlugin()

		assert.equal(await plugin.transform(source, '/src/example.css'), null)
		assert.equal(await plugin.transform(source, '/src/example.html'), null)
	})

	it('ignores node_modules by default', async () => {
		const plugin = await createPlugin()

		assert.equal(
			await plugin.transform(source, '/project/node_modules/example/index.js'),
			null,
		)
	})

	it('respects the include option', async () => {
		const plugin = materialWebAll({
			include: '**/allowed/**',
		})

		const hook = plugin.buildStart

		if (hook) {
			const handler = typeof hook === 'function' ? hook : hook.handler
			await handler.call({} as never, {} as never)
		}

		if (typeof plugin.transform !== 'function') {
			throw new Error('transform hook is not a function')
		}

		assert.equal(
			await plugin.transform.call(
				{} as never,
				source,
				'/src/ignored/example.ts',
			),
			null,
		)

		const result = await plugin.transform.call(
			{} as never,
			source,
			'/src/allowed/example.ts',
		)

		assert.equal(typeof result, 'string')
	})

	it('respects the exclude option', async () => {
		const plugin = materialWebAll({
			exclude: '**/excluded/**',
		})

		const hook = plugin.buildStart

		if (hook) {
			const handler = typeof hook === 'function' ? hook : hook.handler
			await handler.call({} as never, {} as never)
		}

		if (typeof plugin.transform !== 'function') {
			throw new Error('transform hook is not a function')
		}

		assert.equal(
			await plugin.transform.call(
				{} as never,
				source,
				'/src/excluded/example.ts',
			),
			null,
		)

		const result = await plugin.transform.call(
			{} as never,
			source,
			'/src/allowed/example.ts',
		)

		assert.equal(typeof result, 'string')
	})

	it('ignores comments by default', async () => {
		const plugin = await createPlugin()

		const commentedSource = `
			const template = html\`
				<!-- <md-filled-button>Submit</md-filled-button> -->
			\`
		`

		assert.equal(
			await plugin.transform(commentedSource, '/src/example.ts'),
			commentedSource,
		)
	})

	it('detects components in comments when ignoreComments is false', async () => {
		const plugin = materialWebAll({
			ignoreComments: false,
		})

		const hook = plugin.buildStart

		if (hook) {
			const handler = typeof hook === 'function' ? hook : hook.handler
			await handler.call({} as never, {} as never)
		}

		if (typeof plugin.transform !== 'function') {
			throw new Error('transform hook is not a function')
		}

		const commentedSource = `
			const template = html\`
				<!-- <md-filled-button>Submit</md-filled-button> -->
			\`
		`

		const result = await plugin.transform.call(
			{} as never,
			commentedSource,
			'/src/example.ts',
		)

		assert.match(result as string, /@material\/web\/button\/filled-button\.js/)
	})
})
