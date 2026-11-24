export function detectComponents(
	source: string,
	{ignoreComments = true}: {ignoreComments?: boolean} = {},
): Set<string> {
	if (ignoreComments) {
		source = source
			.replace(/<!--[\s\S]*?-->/g, '')
			.replace(/\/\/.*$/gm, '')
			.replace(/\/\*[\s\S]*?\*\//g, '')
	}

	const components = new Set<string>()
	const pattern = /<((?:md|md-gb)-[a-z0-9-]+)(?=[\s/>])/g

	for (const match of source.matchAll(pattern)) {
		if (match[1]) {
			components.add(match[1])
		}
	}

	return components
}
