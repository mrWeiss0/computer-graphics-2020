
import {utils, Camera} from "./index.js";
import {RocketGroup} from "./rocket/index.js";
const Mat4 = utils.matrix.Mat4;

export class Globals {
	constructor(glContext) {
		this.glContext = glContext;
		this.gravity = 10;
		this.buffers = {};
		this.projMatrix = Mat4.identity;
		this.collision = null;
		this.camera  = new Camera();
		this.rockets = new RocketGroup(this);
	}

	get viewMatrix() {
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

	addCollisionGeo() {

	}
}
