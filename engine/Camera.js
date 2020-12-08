import {Mat4, Vec3} from "../webgl2-utils/matrix/index.js";

export class Camera {
	constructor() {
		this._pos = new Vec3(0);
		this._viewMat = null;
	}

	position(x, y, z) {
		this._pos.x = +x;
		this._pos.y = +y;
		this._pos.z = +z;
	}

	get viewMatrix() {
		if(this._viewMat == null)
			this._viewMat = Mat4.lookAt(this._pos, [0, 0, 0]).inverse();
		return this._viewMat;
	}

	update(dt) {
	}
}
