import {utils} from "./index.js";
const Mat4 = utils.matrix.Mat4;
const Vec3 = utils.matrix.Vec3;

const RSPE = .001;
const MSPE = 2.25;

export class Camera {
	constructor(globals) {
		this._globals = globals;
		this._pos = new Vec3(0, 0, 0);
		this._yaw = 0;
		this._pitch = - Math.PI / 12;
		this._viewMat = null;
	}

	position(x, y, z) {
		this._pos.x = +x;
		this._pos.y = +y;
		this._pos.z = +z;
		this._viewMat = null;
	}

	move(x, y, z) {
		this._pos.x += x;
		this._pos.y += y;
		this._pos.z += z;
		this._viewMat = null;
	}

	get yaw() {
		return this._yaw;
	}

	set yaw(a) {
		this._yaw = a;
		this._viewMat = null;
	}

	get pitch() {
		return this._pitch;
	}

	set pitch(a) {
		this._pitch = a;
		this._viewMat = null;
	}

	get viewMatrix() {
		if(this._viewMat == null)
			this._viewMat = Mat4.transl(...this._pos)
			                    .mul(Mat4.rotY(this._yaw))
			                    .mul(Mat4.rotX(this._pitch))
			                    .inverse();
		return this._viewMat;
	}

	mousemove(e) {
		if(!this._globals.mouse.pointerLock)
			return;
		this.yaw += RSPE * -e.movementX;
		this.yaw %= 2 * Math.PI;
		this.pitch += RSPE * -e.movementY;
		this.pitch = Math.max(-Math.PI / 2, Math.min(this.pitch, Math.PI / 2));
	}

	update(dt) {
		const kb = this._globals.keyboard;

		let [f, l, h] = [0, 0, 0];
		if(kb.key("Space"))
			++h;
		if(kb.key("ShiftLeft"))
			--h;
		if(kb.key("KeyW"))
			++f;
		if(kb.key("KeyA"))
			--l;
		if(kb.key("KeyS"))
			--f;
		if(kb.key("KeyD"))
			++l;

		const dx = ( Math.cos(this.yaw) * l - Math.sin(this.yaw) * f ) * MSPE * dt;
		const dz = (-Math.sin(this.yaw) * l - Math.cos(this.yaw) * f ) * MSPE * dt;
		const dy =   h * MSPE * dt;
		this.move(dx, dy, dz);
	}
}
