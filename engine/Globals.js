
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
		this.camera = null;
		this.rockets = new RocketGroup(this);
	}

	get viewMatrix() {
		if(!this.camera)
			return null;
		return this.camera.viewMatrix;
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
