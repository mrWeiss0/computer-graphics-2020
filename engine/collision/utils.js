export function minMax(mesh) {
	const vertices = mesh.vertices;

	const min = [ Infinity,  Infinity,  Infinity];
	const max = [-Infinity, -Infinity, -Infinity];

	for (let i = 0; i < vertices.length; i++) {
		const c = vertices[i];
		if (max[i % 3] < c) max[i % 3] = c;
		if (min[i % 3] > c) min[i % 3] = c;
	}

	return [min, max];
}
