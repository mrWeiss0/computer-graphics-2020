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
			geometry.planes[i] = planeFromTriangle(...vert);
			const [ax, , az, bx, , bz, cx, , cz] = vert;
			this._addTriangle(ax, az, bx, bz, cx, cz, floor);
		}
		this.geometries.push(geometry);
	}

	_addTriangle(ax, az, bx, bz, cx, cz, floor) {
		const [ fromX, fromZ ] = this._findCell(Math.min(ax, bx, cx), Math.min(az, bz, cz));
		const [   toX,   toZ ] = this._findCell(Math.max(ax, bx, cx), Math.max(az, bz, cz));

		for (let i = fromX; i <= toX; i++)
			for (let j = fromZ; j <= toZ; j++)
				this._getCellList(i, j).push(floor);
	}

	_findCell(x, z) {
		const i = Math.floor((x + this.offset[0]) / this.cellLen[0]);
		const j = Math.floor((z + this.offset[1]) / this.cellLen[1]);
		return [i, j];
	}

	_getCellList(i, j) {
		if(i < 0 || j < 0 || i >= this.nCells[0] || j >= this.nCells[1])
			throw new Error("Cell out of bounds");
		return this.grid[i + j * this.nCells[0]];
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
		const vert     = new Array(9);
		const floorID = this.id * 3;
		for(let j = 0; j < 3; j++)
			for(let i = 0; i < 3; i++)
				vert[i + j * 3] = vertices[indices[floorID + j] * 3 + i];
		return vert;
	}

	get plane() {
		return this.geometry.planes[this.id];
	}
}

function planeFromTriangle(ax, ay, az, bx, by, bz, cx, cy, cz) {
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

export class FloorGrid extends CollisionGrid {
	findFloorHeight(x, y, z) {
		const floorList = this._getCellList(...this._findCell(x, z));
		
		let actualFloor;
		//let maxHeight;
		for (let floor of floorList) {
			const [ax, , az, bx, , bz, cx, , cz] = floor.vertices;
			const plane = floor.plane;

			// Check that the point is within the triangle bounds.
			if ((az - z) * (bx - ax) - (ax - x) * (bz - az) < 0) {
				continue;
			}
			if ((bz - z) * (cx - bx) - (bx - x) * (cz - bz) < 0) {
				continue;
			}
			if ((cz - z) * (ax - cx) - (cx - x) * (az - cz) < 0) {
				continue;
			}

			const floorHeight = (plane[0] * x + plane[2] * z + plane[3]) / plane[1];
			return floor;
			// if(y>floorHeight && (maxHeight==undefined || maxHeight<floorHeight)){
			//	   maxHeight = floorHeight;
			// }
			// if(y<floorHeight && (maxHeight==undefined || maxHeight<floorHeight)){
			//	   maxHeight = floorHeight;
			// }
		}
		//return maxHeight;
		return actualFloor;
	}
}
