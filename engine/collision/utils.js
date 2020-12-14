import {utils} from "./index.js";
const [Mat3, Vec3, Vec4] = [utils.matrix.Mat3, utils.matrix.Vec3, utils.matrix.Vec4];

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

export function meshTransform(mesh, transformation) {
	//2 things need be transformed: vertices and normals

	//vertices
	const vertices = mesh.vertices;
	for (let i = 0; i < vertices.length; i += 3) {
		const currVertex = new Vec4(vertices[i], vertices[i + 1], vertices[i + 2], 1);
		[vertices[i], vertices[i + 1], vertices[i + 2]] = transformation.mul(currVertex).val;
	}

	//normals
	const normalTransf = new Mat3(transformation).trasposed().inverse();
	const normals = mesh.normals;
	for (let i = 0; i < normals.length; i += 3) {
		const currNormal = new Vec3(normals[i], normals[i + 1], normals[i + 2]);
		[normals[i], normals[i + 1], normals[i + 2]] = normalTransf.mul(currNormal).val;
	}
}
