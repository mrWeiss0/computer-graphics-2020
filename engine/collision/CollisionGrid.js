import {utils} from "./index.js";
const Vec3 = utils.matrix.Vec3;

export class CollisionGrid {
	constructor(minX, maxX, minZ, maxZ, cellLenX, cellLenZ) {
		this.offset  = [  0 - minX,  0 - minZ ];
		this.cellLen = [ +cellLenX, +cellLenZ ];
		const len    = [ maxX - minX, maxZ - minZ ];
		this.nCells  = [ Math.ceil(len[0] / this.cellLen[0]),
		                 Math.ceil(len[1] / this.cellLen[1]) ];
		this.grid       = Array.from({length : this.nCells[0] * this.nCells[1]}, () => []);
		this.geometries = [];
	}

	addGeometry(frenchMesh) {
		const geometry = {
			mesh   : frenchMesh,
			planes : new Array(Math.floor(this.mesh.indices.length / 3))
		};
		for(let i = 0; i < planes.length; i++) {
			const floor = new Floor(geometry, i);
			const vert = floor.vertices;
			geometry.planes[i] = _planeFromTriangle(vert);
			this._addTriangle(vert, floor);
		}
		this.geometries.push(geometry);
	}

	_addTriangle([a, b, c], floor) {
		const [ fromX, fromZ ] = this._findCell(Math.min(a.x, b.x, c.x), Math.min(a.z, b.z, c.z));
		const [   toX,   toZ ] = this._findCell(Math.max(a.x, b.x, c.x), Math.max(a.z, b.z, c.z));

		for (let i = fromX; i <= toX; i++)
			for (let j = fromZ; j <= toZ; j++)
				this._getCellList(i, j).push(floor);
	}

	_findCell(x, z) {
		const i = Math.floor((x + this.offset[0]) / this.cellLen[0]);
		const j = Math.floor((z + this.offset[1]) / this.cellLen[1]);
		return [i, j];
	}

	_getCellList(j, i) {
		return this.grid[i + j * this.nCells[0]];
	}

	_outOfBounds(i, j) {
		return i < 0 || j < 0 || i >= this.nCells[0] || j >= this.nCells[1];
	}
}

class Floor {
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

function _planeFromTriangle([a, b, c]) {
	const n = b.sub(a).cross(c.sub(a));
	const d = -n.mul(a);
	return [n, d];
}

const FLOOR_HITBOX = 78;

export class FloorGrid extends CollisionGrid {
	findFloorHeight(x, y, z) {
		const [i, j] = this._findCell(x, z);
		const found = {floor: null, height: -Infinity};
		if(this._outOfBounds(i, j))
			return found;
		const floorList = this._getCellList(i, j);
		
		for (let floor of floorList) {
			const [a, b, c] = floor.vertices;
			// Check that the point is within the triangle bounds.
			if ((a.z - z) * (b.x - a.x) - (a.x - x) * (b.z - a.z) < 0)
				continue;
			if ((b.z - z) * (c.x - b.x) - (b.x - x) * (c.z - b.z) < 0)
				continue;
			if ((c.z - z) * (a.x - c.x) - (c.x - x) * (a.z - c.z) < 0)
				continue;

			const n  = floor.normal;
			const oo = floor.offset;
			const height = (n.x * x + n.z * z + oo) / n.y;
			if (y - height + FLOOR_HITBOX < 0)
				continue;

			found.floor  = floor;
			found.height = height;
			break;
		}
		return found;
	}
}
