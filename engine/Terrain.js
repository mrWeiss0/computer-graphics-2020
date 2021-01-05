import {utils} from "./index.js";
const Mat4 = utils.matrix.Mat4;

export class Terrain {
	constructor(renderer, transform) {
		this._renderer = renderer;
		this.worldMatrix = transform || Mat4.identity;
	}

	draw() {
		this._renderer.draw(this);
	}
}
