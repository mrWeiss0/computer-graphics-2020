export class CollisionGrid {
	constructor(minX, maxX, minZ, maxZ, cellLenX, cellLenZ) {
		this.offset  = [  0 - minX,  0 - minZ ];
		this.cellLen = [ +cellLenX, +cellLenZ ];
		const len    = [ maxX - minX, maxZ - minZ ];
		this.nCells  = [ Math.ceil(len[0] / this.cellLen[0]),
		                 Math.ceil(len[1] / this.cellLen[1]) ];
		this.grid = [];
		this.geometries = new Map();
	}

	addGeometry(frenchMeshInited, facePlanes, geometryName) {
		this.geometries.set(geometryName, { mesh: frenchMeshInited, planes: facePlanes });

		const vertices = frenchMeshInited.vertices;
		const indices = frenchMeshInited.indices;
		const nIndices = frenchMeshInited.indices.length;

		for (let i = 0; i < nIndices; i += 3) {
			this._addTriangle(
				vertices[indices[i] * 3],
				vertices[indices[i] * 3 + 2],
				vertices[indices[i + 1] * 3],
				vertices[indices[i + 1] * 3 + 2],
				vertices[indices[i + 2] * 3],
				vertices[indices[i + 2] * 3 + 2],
				i / 3,
				geometryName
			);
		}
	}

	_addTriangle(ax, az, bx, bz, cx, cz, floorID, geometryName) {
		const [ fromX, fromZ ] = this._findCell(Math.min(ax, bx, cx), Math.min(az, bz, cz));
		const [   toX,   toZ ] = this._findCell(Math.max(ax, bx, cx), Math.max(az, bz, cz));

		for (let i = fromX; i <= toX; i++) {
			if (this.grid[i] == undefined) {
				this.grid[i] = [];
			}
			for (let j = fromZ; j <= toZ; j++) {
				if (this.grid[i][j] == undefined) {
					this.grid[i][j] = [];
				}
				this.grid[i][j].push([floorID, geometryName]);
			}
		}
	}

	_findCell(x, z) {
		const i = Math.floor((x + this.offset[0]) / this.cellLen[0]);
		const j = Math.floor((z + this.offset[1]) / this.cellLen[1]);
		return [i, j];
	}

	_getCellList(i, j) {
		if (this.grid[i] == undefined) {
			return undefined;
		}
		return this.grid[i][j];
	}
}

export class FloorGrid extends CollisionGrid {
	findFloorHeight(x, y, z) {
		const floorList = this._getCellList(...this._findCell(x, z));

		if (!floorList) {
			return undefined;
		}
		let actualFloor;
		//let maxHeight;
		for (let floor of floorList) {
			const geometry = this.geometries.get(floor[1]);
			const plane = geometry.planes[floor[0]];
			const vertices = geometry.mesh.vertices;
			const indices = geometry.mesh.indices;
			const i = floor[0] * 3;

			const ax = vertices[indices[i] * 3];
			const az = vertices[indices[i] * 3 + 2];
			const bx = vertices[indices[i + 1] * 3];
			const bz = vertices[indices[i + 1] * 3 + 2];
			const cx = vertices[indices[i + 2] * 3];
			const cz = vertices[indices[i + 2] * 3 + 2];

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
