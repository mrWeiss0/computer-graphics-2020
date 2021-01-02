import {Surface, utils} from "./index.js";
const Vec3 = utils.matrix.Vec3;

const FLOOR_HITBOX = 78;

export class CollisionGrid {
	constructor(minX, minZ, maxX, maxZ, cellLenX, cellLenZ) {
		this.offset  = [  0 - minX,  0 - minZ ];
		this.cellLen = [ +cellLenX, +cellLenZ ];
		const len    = [ maxX - minX, maxZ - minZ ];
		this.nCells  = [ Math.ceil(len[0] / this.cellLen[0]),
		                 Math.ceil(len[1] / this.cellLen[1]) ];
		this.grid    = Array.from({length : this.nCells[0] * this.nCells[1]}, () => []);
	}

	addGeometry(mesh, transform) {
		for(let s = 0; s < mesh.indices.length - 2; s += 3) {
			const [a, b, c] = _getTriangle(mesh, s);
			const surf = new Surface(a, b, c);
			if(transform != null)
				surf.transform(transform);
			// Check if floor, wall or ceiling
			// (Only floors are considered)
			if(surf.normal.y <= 0)
				continue;
			this._addTriangle(surf);
		}
	}

	/*
	 * Find the first floor under the point p = (x, y, z)
	 * or the floor within FLOOR_HITBOX units above p.
	 * Return an object {
	 *   floor  : floor found,
	 *   height : height of the floor under p
	 * }
	 * If p is out of bounds, either because its outside the grid
	 * or because it below any other floor,
	 * {floor: null, height: -Infinity} is return
	 */
	findFloorHeight(x, y, z) {
		const [i, j] = this._findCell(x, z);
		const found = {floor: null, height: -Infinity};
		if(this._outOfBounds(i, j))
			return found;
		const floorList = this._getCellList(i, j);
		
		for (const floor of floorList) {
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

	_addSurface(s) {
		const [ fromX, fromZ ] = this._findCell(Math.min(s.a.x, s.b.x, s.c.x), Math.min(s.a.z, s.b.z, s.c.z));
		const [   toX,   toZ ] = this._findCell(Math.max(s.a.x, s.b.x, s.c.x), Math.max(s.a.z, s.b.z, s.c.z));

		for (let i = fromX; i <= toX; i++)
			for (let j = fromZ; j <= toZ; j++)
				this._getCellList(i, j).push(s);
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

function _getTriangle(mesh, id) {
	const ver = mesh.vertices;
	const ind = mesh.indices;
	const triang = new Array(3);
	for(let v = 0; v < 3; v++) {
		const t = ind[id + v] * 3;
		vert[j] = new Vec3(ver[t + 0], ver[t + 1], ver[t + 2]);
	}
	return triang;
}
