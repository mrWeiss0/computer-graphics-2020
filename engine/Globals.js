
import {Mat4} from "../webgl2-utils/matrix/index.js";
import {Camera} from "./Camera.js";

export class Globals {
	constructor(glContext) {
		this.glContext = glContext;
		this.gravity = 10;
		this.buffers = {};
		this.projMatrix = Mat4.identity;

		this.camera = new Camera();
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
}
