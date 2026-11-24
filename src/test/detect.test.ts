import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {detectComponents} from '../core/detect.js'

describe('detectComponents', () => {
	it('detects standard components', () => {
		const source = '<md-filled-button>Standard</md-filled-button>'

		assert.deepEqual(detectComponents(source), new Set(['md-filled-button']))
	})

	it('detects GB components', () => {
		const source = '<md-gb-button>Expressive</md-gb-button>'

		assert.deepEqual(detectComponents(source), new Set(['md-gb-button']))
	})

	it('detects multiple components', () => {
		const source = `
			<md-filled-button>Standard</md-filled-button>
			<md-gb-button>Expressive</md-gb-button>
			<md-dialog></md-dialog>
		`

		assert.deepEqual(
			detectComponents(source),
			new Set(['md-filled-button', 'md-gb-button', 'md-dialog']),
		)
	})

	it('does not return duplicates', () => {
		const source = `
			<md-filled-button>One</md-filled-button>
			<md-filled-button>Two</md-filled-button>
		`

		assert.deepEqual(detectComponents(source), new Set(['md-filled-button']))
	})

	it('returns an empty set when no components are found', () => {
		assert.deepEqual(detectComponents('<div>Hello</div>'), new Set())
	})

	it('detects self-closing components', () => {
		assert.deepEqual(
			detectComponents('<md-gb-icon-button />'),
			new Set(['md-gb-icon-button']),
		)
	})

	it('detects components with attributes', () => {
		const source = `
		<md-filled-button disabled class="primary">
			Submit
		</md-filled-button>
		<md-gb-button variant="filled" />
	`

		assert.deepEqual(
			detectComponents(source),
			new Set(['md-filled-button', 'md-gb-button']),
		)
	})

	it('detects broken tags', () => {
		const source = `
		<md-filled-button disabled class="primary">
			Submit
		<div></div>
	`

		assert.deepEqual(detectComponents(source), new Set(['md-filled-button']))
	})

	it('detects components with multiline attributes', () => {
		const source = `
		<md-filled-button
			variant="filled"
			disabled
			class="primary"
		>
			Submit
		</md-filled-button>
	`

		assert.deepEqual(detectComponents(source), new Set(['md-filled-button']))
	})

	it('detects nested components', () => {
		const source = `
		<md-gb-card>
			<md-gb-button>
				<md-icon>check</md-icon>
			</md-gb-button>
		</md-gb-card>
	`

		assert.deepEqual(
			detectComponents(source),
			new Set(['md-gb-card', 'md-gb-button', 'md-icon']),
		)
	})

	it('ignores comments by default', () => {
		const source = `
    <!-- <md-dialog></md-dialog> -->
    <md-filled-button>Submit</md-filled-button>
  `

		assert.deepEqual(detectComponents(source), new Set(['md-filled-button']))
	})

	it('detects components in HTML comments when ignoreComments is false', () => {
		const source = `
		<!-- <md-dialog></md-dialog> -->
		<md-filled-button>Submit</md-filled-button>
	`

		assert.deepEqual(
			detectComponents(source, {ignoreComments: false}),
			new Set(['md-dialog', 'md-filled-button']),
		)
	})

	it('ignores single-line comments', () => {
		const source = `
		// <md-dialog></md-dialog>
		<md-filled-button>Submit</md-filled-button>
	`

		assert.deepEqual(detectComponents(source), new Set(['md-filled-button']))
	})

	it('ignores multiline comments', () => {
		const source = `
		/*
			<md-dialog></md-dialog>
			<md-gb-card></md-gb-card>
		*/
		<md-filled-button>Submit</md-filled-button>
	`

		assert.deepEqual(detectComponents(source), new Set(['md-filled-button']))
	})
})
