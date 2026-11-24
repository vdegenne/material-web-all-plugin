import {readFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'

export type Mapping = Record<string, string>

const mappingPath = fileURLToPath(
	new URL('../../mapping.json', import.meta.url),
)

export async function loadMapping(): Promise<Mapping> {
	const source = await readFile(mappingPath, 'utf8')

	return JSON.parse(source) as Mapping
}
