import {init, parse} from 'es-module-lexer'
import {readFile, readdir, writeFile} from 'node:fs/promises'
import {basename, dirname, join, relative, sep} from 'node:path'
import {fileURLToPath} from 'node:url'

await init()

const allPath = fileURLToPath(import.meta.resolve('@material/web/all.js'))
const packageRoot = dirname(allPath)
const labsPath = join(packageRoot, 'labs')
const gbComponentsPath = join(labsPath, 'gb/components')

const mapping: Record<string, string> = {}

async function getJavaScriptFiles(directory: string): Promise<string[]> {
	const entries = await readdir(directory, {withFileTypes: true})
	const files: string[] = []

	for (const entry of entries) {
		const path = join(directory, entry.name)

		if (entry.isDirectory()) {
			files.push(...(await getJavaScriptFiles(path)))
		} else if (entry.isFile() && entry.name.endsWith('.js')) {
			files.push(path)
		}
	}

	return files
}

async function addModule(modulePath: string): Promise<void> {
	const moduleSource = await readFile(modulePath, 'utf8')
	const match = moduleSource.match(
		/(?:customElement|customElements\.define)\(['"]([^'"]+)['"]/,
	)

	if (!match?.[1]) return

	const moduleSpecifier = relative(packageRoot, modulePath).split(sep).join('/')

	mapping[match[1]] = `@material/web/${moduleSpecifier}`
}

// 1. Standard components from all.js
const source = await readFile(allPath, 'utf8')
const [imports] = parse(source)

for (const entry of imports) {
	if (entry.type !== 'static' || !entry.specifier.startsWith('./')) continue

	const modulePath = fileURLToPath(
		new URL(entry.specifier, import.meta.resolve('@material/web/all.js')),
	)

	await addModule(modulePath)
}

// 2. Classic Labs components (excluding GB)
const labsFiles = await getJavaScriptFiles(labsPath)

for (const file of labsFiles) {
	if (relative(labsPath, file).split(sep)[0] === 'gb') continue

	await addModule(file)
}

// 3. GB components
const gbFiles = await getJavaScriptFiles(join(labsPath, 'gb'))

for (const file of gbFiles) {
	const name = basename(file, '.js')

	if (!name.startsWith('md-gb-')) continue

	const moduleSpecifier = relative(packageRoot, file).split(sep).join('/')

	mapping[name] = `@material/web/${moduleSpecifier}`
}

const mappingPath = fileURLToPath(
	new URL('../../mapping.json', import.meta.url),
)

await writeFile(mappingPath, JSON.stringify(mapping, null, '\t') + '\n')
