import {utils} from "./index.js";
const matrix = utils.matrix;

export class Camera {
	constructor() {
		this._pos = new matrix.Vec3(0);
		this._viewMat = null;
	}

	position(x, y, z) {
		this._pos.x = +x;
		this._pos.y = +y;
		this._pos.z = +z;
	}

	get viewMatrix() {
		if(this._viewMat == null)
			this._viewMat = matrix.Mat4.lookAt(this._pos, [0, 0, 0]).inverse();
		return this._viewMat;
	}

	update(dt) {
	}
}
