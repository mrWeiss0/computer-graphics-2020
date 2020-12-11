export class CollisionGrid {
	static DENSITY = 1;
	constructor(minX, maxX, minZ, maxZ) {
		this.lenX = maxX - minX;
		this.lenZ = maxZ - minZ;
		this.offsetX = 0 - minX;
		this.offsetZ = 0 - minZ;

		this.nCells;
		this.cellLenX;
		this.cellLenZ;

		this.grid = [];
		this.geometries = new Map();
	}

	addGeometry(frenchMeshInited, facePlanes, geometryName) {
		//if first geometry, set parameters
		if (!(this.geometries.size)) {
			const nTriangles = frenchMeshInited.indices.length / 3;
			this.nCells = Math.floor(nTriangles / this.constructor.DENSITY) + 1;
			this.cellLenX = this.lenX / Math.sqrt(this.nCells);
			this.cellLenZ = this.lenZ / Math.sqrt(this.nCells);
		}

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
		const maxX = Math.max(ax, bx, cx);
		const minX = Math.min(ax, bx, cx);
		const maxZ = Math.max(az, bz, cz);
		const minZ = Math.min(az, bz, cz);

		const fromX = Math.floor((minX + this.offsetX) / this.cellLenX);
		const toX = Math.floor((maxX + this.offsetX) / this.cellLenX);
		const fromZ = Math.floor((minZ + this.offsetZ) / this.cellLenZ);
		const toZ = Math.floor((maxZ + this.offsetZ) / this.cellLenZ);

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
		const i = Math.floor((x + this.offsetX) / this.cellLenX);
		const j = Math.floor((z + this.offsetZ) / this.cellLenZ);

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
