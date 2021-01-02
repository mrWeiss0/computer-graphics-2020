import {utils, Globals, renderer} from "./index.js";
const Mat4 = utils.matrix.Mat4;

export class Game extends utils.App {
	constructor(canvas, {INSTANCED_BUFSIZE = 1, MAX_LIGHTS = 1} = {}) {
		super(canvas);
		
		this.initMouse();
		this.mouse.hideMenu = true;
		this.initKeyboard();

		const glContext = this.glContext;
		this.globals = new Globals(this.glContext);
		this.globals.addBuffer("mat", INSTANCED_BUFSIZE, 16 + 9, 4, glContext.ARRAY_BUFFER);
		this.globals.addBuffer("lights", MAX_LIGHTS + 1,      4, 4, glContext.UNIFORM_BUFFER);
		const lightsBuf = this.globals.buffers.lights;
		lightsBuf.bindingPoint = 0;
		glContext.bindBufferBase(glContext.UNIFORM_BUFFER, lightsBuf.bindingPoint, this.globals.buffers.lights);

		this.autoResize();

		glContext.clearColor(0, 0, 0, 0);
		glContext.enable(glContext.DEPTH_TEST);
	}

	getRendererFactory() {
		return new renderer.RendererFactory(this.globals);
	}

	autoResize() {
		const [w, h] = [this.canvas.clientWidth, this.canvas.clientHeight];
		this.resize(w, h);
		this.globals.projMatrix = Mat4.perspFOV(Math.PI / 4, w / h, 1, 200);
		this.glContext.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	draw() {
		let gl = this.glContext;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		this.globals.rockets.draw();
	}
	
	update(dt) {
		this.globals.camera.update(dt);
		this.globals.rockets.update(dt);
	}
}
