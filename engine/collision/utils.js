export function minMaxXZ(mesh) {
	const vertices = mesh.vertices;
	const vertexLen = mesh.vertices.length;

	let maxX = vertices[0];
	let minX = vertices[0 + 2];
	let maxZ = vertices[0];
	let minZ = vertices[0 + 2];

	for (let i = 0; i < vertexLen; i += 3) {
		const currX = vertices[i];
		const currZ = vertices[i + 2];

		if (maxX < currX) { maxX = currX };
		if (minX > currX) { minX = currX };
		if (maxZ < currZ) { maxZ = currZ };
		if (minZ > currZ) { minZ = currZ };
	}

	return [minX, maxX, minZ, maxZ];
}

export function meshTransform(mesh, transformation) {
	//2 things need be transformed: vertices and normals

	//vertices
	const nVertices = mesh.vertices.length;
	const vertices = mesh.vertices;
	for (let i = 0; i < nVertices; i += 3) {
		//   let oldVertex = new Vec4([...mesh.vertices.slice(i, i+3), 1]);
		//   newVertices.push(...(transformation.mul(oldVertex).val.slice(0,3)));
		const currVertex = new Vec4(vertices[i], vertices[i + 1], vertices[i + 2], 1);
		[vertices[i], vertices[i + 1], vertices[i + 2]] = transformation.mul(currVertex).val;
	}

	//normals
	const normalTransf = new Mat3(transformation).trasposed().invert();
	const nNormals = mesh.indices.length;
	const normals = mesh.normals;
	for (let i = 0; i < nNormals; i += 3) {
		const currNormal = new Vec3(normals[i], normals[i + 1], normals[i + 2]);
		[normals[i], normals[i + 1], normals[i + 2]] = normalTransf.mul(currNormal).val;
	}
}
