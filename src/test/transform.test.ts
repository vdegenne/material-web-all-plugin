import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {transformSource} from '../core/transform.js'

describe('transformSource', () => {
	it('injects imports for detected components', async () => {
		const source = `
	const template = html\`
		<md-filled-button>Submit</md-filled-button>
		<md-dialog></md-dialog>
	\`
`

		const mapping = {
			'md-filled-button': '@material/web/button/filled-button.js',
			'md-dialog': '@material/web/dialog/dialog.js',
		}

		const result = await transformSource(source, mapping)

		assert.match(result, /import '@material\/web\/button\/filled-button\.js'/)
		assert.match(result, /import '@material\/web\/dialog\/dialog\.js'/)
	})

	it('returns the source unchanged when no components are detected', async () => {
		const source = 'const value = 42'

		assert.equal(await transformSource(source, {}), source)
	})

	it('ignores components missing from the mapping', async () => {
		const source = `
		const template = html\`
			<md-unknown></md-unknown>
		\`
	`

		assert.equal(await transformSource(source, {}), source)
	})

	it('injects only one import for repeated components', async () => {
		const source = `
		const template = html\`
			<md-dialog></md-dialog>
			<md-dialog></md-dialog>
		\`
	`

		const mapping = {
			'md-dialog': '@material/web/dialog/dialog.js',
		}

		const result = await transformSource(source, mapping)

		assert.equal(
			result.match(/import '@material\/web\/dialog\/dialog\.js'/g)?.length,
			1,
		)
	})

	it('does not inject imports that already exist', async () => {
		const source = `
		import '@material/web/dialog/dialog.js'

		const template = html\`
			<md-dialog></md-dialog>
			<md-filled-button>Submit</md-filled-button>
		\`
	`

		const mapping = {
			'md-dialog': '@material/web/dialog/dialog.js',
			'md-filled-button': '@material/web/button/filled-button.js',
		}

		const result = await transformSource(source, mapping)

		assert.equal(
			result.match(/import '@material\/web\/dialog\/dialog\.js'/g)?.length,
			1,
		)

		assert.ok(result.includes("import '@material/web/button/filled-button.js'"))
	})

	it('does not inject imports that already exist as dynamic imports', async () => {
		const source = `
		const loadDialog = () => import('@material/web/dialog/dialog.js')
		const template = html\`<md-dialog></md-dialog>\`
	`

		const mapping = {
			'md-dialog': '@material/web/dialog/dialog.js',
		}

		assert.equal(await transformSource(source, mapping), source)
	})

	it('does not inject imports that already exist as re-exports', async () => {
		const source = `
		export {Dialog} from '@material/web/dialog/dialog.js'
		const template = html\`<md-dialog></md-dialog>\`
	`

		const mapping = {
			'md-dialog': '@material/web/dialog/dialog.js',
		}

		assert.equal(await transformSource(source, mapping), source)
	})

	it('ignores commented imports and injects a real import at the beginning', async () => {
		const source = `
		// import '@material/web/dialog/dialog.js'
		const template = html\`<md-dialog></md-dialog>\`
	`

		const mapping = {
			'md-dialog': '@material/web/dialog/dialog.js',
		}

		const result = await transformSource(source, mapping)

		assert.match(result, /^import '@material\/web\/dialog\/dialog\.js'/)

		assert.match(result, /\/\/ import '@material\/web\/dialog\/dialog\.js'/)
	})

	it('uses a custom package prefix for generated imports', async () => {
		const source = 'const template = html`<md-dialog></md-dialog>`'

		const mapping = {
			'md-dialog': '@material/web/dialog/dialog.js',
		}

		const result = await transformSource(source, mapping, {
			prefix: '@mahmood/material-web',
		})

		assert.ok(
			result.includes("import '@mahmood/material-web/dialog/dialog.js'"),
		)
		assert.ok(!result.includes('@material/web/'))
	})

	it('uses @material/web as the default package prefix', async () => {
		const source = 'const template = html`<md-dialog></md-dialog>`'

		const mapping = {
			'md-dialog': '@material/web/dialog/dialog.js',
		}

		const result = await transformSource(source, mapping)

		assert.ok(result.includes("import '@material/web/dialog/dialog.js'"))
	})

	it('removes both global imports when using a custom prefix', async () => {
		const source = `
		import '@mahmoodkhalil/material-web-3-demo/all.js'
		import '@mahmoodkhalil/material-web-3-demo/labs/gb/components/all.js'

		const template = html\`
			<md-dialog></md-dialog>
		\`
	`

		const mapping = {
			'md-dialog': '@material/web/dialog/dialog.js',
		}

		const result = await transformSource(source, mapping, {
			prefix: '@mahmoodkhalil/material-web-3-demo',
		})

		assert.doesNotMatch(result, /@mahmoodkhalil\/material-web-3-demo\/all\.js/)
		assert.doesNotMatch(
			result,
			/@mahmoodkhalil\/material-web-3-demo\/labs\/gb\/components\/all\.js/,
		)
		assert.match(
			result,
			/import '@mahmoodkhalil\/material-web-3-demo\/dialog\/dialog\.js'/,
		)
	})
})
