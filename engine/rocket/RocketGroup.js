import {Vec4} from "../../webgl2-utils/matrix/index.js";

export class RocketGroup {
	constructor(globals) {
		this._globals      = globals;
		this._rocketsList  = null;
		this._renderers    = [];
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

	addRenderer(renderer) {
		this._renderers.push(renderer);
	}

	get renderers() {
		return this._renderers;
	}

	//TODO collisions
	update(dt) {
		let prev = null;
		for(const rocket of this) {
			rocket.update(dt);
			// TODO collisions
			if(rocket._ttl <= 0) {
				if(prev != null)
					prev.next = rocket.next;
				else
					this._rocketsList = rocket.next;
			} else
				prev = rocket;
		}
	}

	draw() {
		if(this._lightsArray)
			this._updateLights();
		for(const rocket of this)
			rocket.draw();
		for(const rend of this._renderers)
			rend.flush();
	}

	[Symbol.iterator] = function* () {
		if(this._rocketsList == null)
			return;
		yield* this._rocketsList;
	}

	_updateLights() {
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
		this._lightsCount[0] = n;

		const glContext = this._globals.glContext;
		glContext.bindBuffer(glContext.UNIFORM_BUFFER, lightsBuffer);
		glContext.bufferSubData(glContext.UNIFORM_BUFFER,  0, this._lightsCount);
		glContext.bufferSubData(glContext.UNIFORM_BUFFER, 16, this._lightsArray);
	}
}
