import {utils} from "./index.js";
const Vec3 = utils.matrix.Vec3;

export class Floor {
	constructor(geometry, id) {
		if(id >= geometry.planes.length)
			throw new Error("Invalid floor ID");
		this.geometry = geometry;
		this.id       = id;
	}

	get vertices() {
		const vertices = this.geometry.mesh.vertices;
		const indices  = this.geometry.mesh.indices;
		const vert     = Array.from({length : 3}, () => new Vec3(0));
		const floorID = this.id * 3;
		for(let j = 0; j < 3; j++)
			for(let i = 0; i < 3; i++)
				vert[j * 3].set(i, vertices[indices[floorID + j] * 3 + i]);
		return vert;
	}

	get normal() {
		return this.geometry.planes[this.id][0];
	}

	get offset() {
		return this.geometry.planes[this.id][1];
	}
}
