import {utils} from "./index.js";
const LinkedList = utils.LinkedList;

const FRAMES_PER_MS = .02;

export class Explosion extends LinkedList {
	constructor(renderer, target, width) {
		super();
		this._renderer = renderer;
		this._target = [ ...target ];
		this._size = [ width, width * this._renderer.frameH / this._renderer.frameW ];
		this._target[1] += this._size[1] / 2;
		this._frameN = 0;
		this._deleted = false;
	}

	get lightColor() {
		return [1, 1, 1];
	}

	get target() {
		return this._target;
	}

	get size() {
		return this._size;
	}

	get frameN() {
		return Math.floor(this._frameN);
	}

	get deleted() {
		return this._deleted;
	}

	draw() {
		this._renderer.draw(this);
	}

	update(dt) {
		this._frameN += dt * FRAMES_PER_MS;
		if(this.frameN >= this._renderer.frameCount)
			this._deleted = true;
	}
}
