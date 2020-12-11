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

export function planesArray(mesh) {
	const normalPlanes = [];

	const vertices = mesh.vertices;
	const indices = mesh.indices;
	const indexLen = mesh.indices.length;

	for (let i = 0; i < indexLen; i += 3) {
		const ax = vertices[indices[i] * 3];
		const ay = vertices[indices[i] * 3 + 1];
		const az = vertices[indices[i] * 3 + 2];
		const bx = vertices[indices[i + 1] * 3];
		const by = vertices[indices[i + 1] * 3 + 1];
		const bz = vertices[indices[i + 1] * 3 + 2];
		const cx = vertices[indices[i + 2] * 3];
		const cy = vertices[indices[i + 2] * 3 + 1];
		const cz = vertices[indices[i + 2] * 3 + 2];

		normalPlanes.push(planeFromTriangle(ax, ay, az, bx, by, bz, cx, cy, cz));
	}
	return normalPlanes;
}

export function planeFromTriangle(ax, ay, az, bx, by, bz, cx, cy, cz) {
	const rx = bx - ax;
	const ry = by - ay;
	const rz = bz - az;

	const sx = cx - ax;
	const sy = cy - ay;
	const sz = cz - az;

	const nx = ry * sz - rz * sy;
	const ny = rz * sx - rx * sz;
	const nz = rx * sy - ry * sx;

	const d = -(nx * ax + ny * ay + nz * az);

	return [nx, ny, nz, d];
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
