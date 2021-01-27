import {utils} from "./index.js";
const Mat4 = utils.matrix.Mat4;

export class Skybox {
	constructor(renderer) {
		this._renderer = renderer;
		this._wrldMat  = Mat4.identity();
	}

	get worldMatrix() {
		return this._wrldMat;
	}

	update(dt) {
	}

	draw() {
		this._renderer.draw(this);
	}
}
