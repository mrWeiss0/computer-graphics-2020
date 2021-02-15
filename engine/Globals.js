
import {utils, Camera, hsbToRgb} from "./index.js";
import {RocketGroup} from "./rocket/index.js";
const Mat4 = utils.matrix.Mat4;
const Vec4 = utils.matrix.Vec4;

const DAYSPE = .0005;

export class Globals {
	constructor(glContext) {
		this.glContext = glContext;
		this.gravity = .001; // cm * ms^-2 [ g = 0.001]
		this.buffers = {};
		this.projMatrix = Mat4.identity;
		this.ar = 1;
		this.collision = null;
		this.mouse = null;
		this.keyboard = null;
		this.camera = new Camera(this);
		this.followedRocket = null;
		this.rockets = new RocketGroup(this);
		
		this.sunAngle = 0;
		this.dayCycle = .5;
	}

	get sunLight() {
		const b = 1 - 4 * (this.dayCycle - .5) ** 2;
		const s = 4 * (this.dayCycle - .5) ** 2;
		return hsbToRgb(.08, s, Math.max(0, 0.8 * b));
	}

	get ambientLight() {
		return hsbToRgb(.61, .3, .15);
	}

	get sunHeight() {
		return (this.dayCycle - .5) * Math.PI;
	}

	get sunDir() {
		const y = Math.cos(this.sunHeight);
		const x = Math.sin(this.sunHeight) * Math.cos(this.sunAngle);
		const z = Math.sin(this.sunHeight) * Math.sin(this.sunAngle);
		return [x, y, z];
	}

	get viewMatrix() {
		const rocket = this.followedRocket;
		if(rocket){
			const rocketCamera = rocket.followMatrix.mul(new Vec4(4, -10, -6, 1));
			return Mat4.lookAt([rocketCamera.x, rocketCamera.y, rocketCamera.z], rocket._pos).inverse();
		}
		if(!this.camera)
			return null;
		return this.camera.viewMatrix;
	}

	toggleView() {
		if(this.followedRocket)
			this.followedRocket = null;
		else
			this.followedRocket = this.rockets._rocketsList;
	}

	update(dt) {
		const kb = this.keyboard;

		let h = 0;
		if(kb.key("ArrowRight"))
			++h;
		if(kb.key("ArrowLeft"))
			--h;
		if(h)
			this.dayCycle = Math.max(0, Math.min(this.dayCycle + h * DAYSPE * dt, 1));
		this.camera.update(dt);
		this.rockets.update(dt);
	}

	addBuffer(name, numItems, itemSize, byteSize, target) {
		const glContext = this.glContext;
		const buffer = glContext.createBuffer();
		this.buffers[name] = buffer;
		buffer.numItems = numItems;
		buffer.itemSize = itemSize;
		glContext.bindBuffer(target, buffer);
		glContext.bufferData(target, byteSize * buffer.itemSize * buffer.numItems, glContext.DYNAMIC_DRAW);
	}
}
