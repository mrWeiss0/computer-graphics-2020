import { Explosion } from "./Explosion.js";
import {utils} from "./index.js";
const Vec4 = utils.matrix.Vec4;

export class RocketGroup {
	constructor(globals) {
		this._globals      = globals;
		this._rocketsList  = null;
		this._explsList    = null;
		const lightsBuffer = this._globals.buffers.lights;
		if(lightsBuffer) {
			this._lightsArray = new Float32Array(lightsBuffer.itemSize * (lightsBuffer.numItems - 1));
			this._lightsCount = new Uint32Array(1);
		}
		else
			this._lightsArray = null;
		this._lightOffset  = new Vec4(0, 0, 0, 1);
	}

	/* Set the offset for the rocket light relative to the rocket origin, return this */
	lightOffset(x, y, z) {
		this._lightOffset.x = +x;
		this._lightOffset.y = +y;
		this._lightOffset.z = +z;
		return this;
	}

	addRocket(rocket) {
		rocket.next = this._rocketsList;
		this._rocketsList = rocket;
	}

	addExplosion(explosion) {
		explosion.next = this._explsList;
		this._explsList = explosion;
	}

	update(dt) {
		this._rocketsList = this._updateList(this._rocketsList, dt);
		this._explsList = this._updateList(this._explsList, dt);
	}

	_updateList(l, dt) {
		if(l == null)
			return null;
		let newList = l;
		let prev = null;
		for(const e of l) {
			e.update(dt);
			if(e._deleted) {
				if(prev != null)
					prev.next = e.next;
				else
					newList = e.next;
			}
			else
				prev = e;
		}
		return newList;
	}

	draw() {
		for(const rocket of this)
			rocket.draw();
	}

	drawExplosions() {
		if(this._explsList != null)
			for(const expls of this._explsList)
				expls.draw();
	}

	[Symbol.iterator] = function* () {
		if(this._rocketsList == null)
			return;
		yield* this._rocketsList;
	}

	updateLights() {
		if(!this._lightsArray)
			return;
		const lightsBuffer = this._globals.buffers.lights;
		
		let n = 0;
		for(const rocket of this) {
			if(n >= lightsBuffer.numItems - 1)
				break;
			if(!rocket.lightOn)
				continue;
			const pos = rocket.worldMatrix.mul(this._lightOffset).val;
			this._lightsArray.set(pos, lightsBuffer.itemSize * n++);
		}
		for(const expl of this._explsList) {
			if(n >= lightsBuffer.numItems - 1)
				break;
			this._lightsArray.set(expl.target, lightsBuffer.itemSize * n++);
		}
		this._lightsCount[0] = n;

		const glContext = this._globals.glContext;
		glContext.bindBuffer(glContext.UNIFORM_BUFFER, lightsBuffer);
		glContext.bufferSubData(glContext.UNIFORM_BUFFER,  0, this._lightsCount);
		glContext.bufferSubData(glContext.UNIFORM_BUFFER, 16, this._lightsArray);
	}
}

