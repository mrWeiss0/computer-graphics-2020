
import {utils, Camera} from "./index.js";
import {RocketGroup} from "./rocket/index.js";
const Mat4 = utils.matrix.Mat4;

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
		this.rockets = new RocketGroup(this);
		
		this.sunHeight = Math.PI / 6;
		this.sunAngle = 0;
		this.sunLight = [1, 1, 1];
		this.ambientLight = [0.2, 0.2, 0.2];
	}

	get sunDir() {
		const y = Math.cos(this.sunHeight);
		const x = Math.sin(this.sunHeight) * Math.cos(this.sunAngle);
		const z = Math.sin(this.sunHeight) * Math.sin(this.sunAngle);
		return [x, y, z];
	}

	get viewMatrix() {
		if(!this.camera)
			return null;
		return this.camera.viewMatrix;
	}

	update(dt) {
		//this.sunHeight += 0.02;
		//this.sunHeight %= 2 * Math.PI;
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
