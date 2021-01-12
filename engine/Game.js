import {utils, Globals, ModelLoader} from "./index.js";
import {InstancedRenderer, Renderer} from "./renderer/index.js";
import {Rocket} from "./rocket/index.js";
const Mat4 = utils.matrix.Mat4;

export class Game extends utils.App {
	constructor(canvas, {
		INSTANCED_BUFSIZE = 1,
		MAX_LIGHTS = 1
	} = {}) {
		super(canvas);
		
		this.initMouse();
		this.mouse.hideMenu = true;
		this.mouse.register(this);
		this.initKeyboard();

		const glContext = this.glContext;
		this.globals = new Globals(this.glContext);
		this.globals.addBuffer("mat", INSTANCED_BUFSIZE, 16 + 9, 4, glContext.ARRAY_BUFFER);
		this.globals.addBuffer("lights", MAX_LIGHTS + 1,      4, 4, glContext.UNIFORM_BUFFER);
		const lightsBuf = this.globals.buffers.lights;
		lightsBuf.bindingPoint = 0;
		glContext.bindBufferBase(glContext.UNIFORM_BUFFER, lightsBuf.bindingPoint, this.globals.buffers.lights);

		this.terrains = [];
		this._modelLoader = null;
		this.rends = createRendObject(
			[  "rockets", InstancedRenderer ],
			[ "terrains",          Renderer ]
		);

		this.autoResize();

		glContext.clearColor(0, 0, 0, 0);
		glContext.enable(glContext.DEPTH_TEST);

		this._test = true;
	}

	get modelLoader() {
		if(this._modelLoader == null)
			this._modelLoader = new ModelLoader(this);
		return this._modelLoader;
	}

	getRendererList(name) {
		return this.rends[name].list;
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
		for(const r of this.getRendererList("rockets"))
			r.flush();
		for(const t of this.terrains)
			t.draw();
	}

	click(e) {
		test(this);
	}
	
	update(dt) {
		if(this.keyboard.key("Space")) {
			if(this._test) {
				test(this);
				this._test = false;
			}
		}
		else
			this._test = true;
		this.globals.camera.update(dt);
		this.globals.rockets.update(dt);
	}
}

function createRendObject(...entries) {
	const o = {};
	for(const [name, clazz] of entries)
		o[name] = { clazz : clazz, list : [] };
	return o;
}

function test(game) {
	const renderers = game.getRendererList("rockets");
	const {height: height0} = game.globals.collision.findFloorHeight(-30, 10, 20);
	const {height: height1} = game.globals.collision.findFloorHeight(-30, 10,-20);
	const {height: height2} = game.globals.collision.findFloorHeight(-30, 10,  0);
	const {height: height5} = game.globals.collision.findFloorHeight( 20,  0,  0);
	let rockets = [
		new Rocket(game.globals, renderers[0]).position(-30, height0, 20).trajectory([20,  height5,  0], 40,  10),
		new Rocket(game.globals, renderers[0]).position(-30, height1,-20).trajectory([20,  height5,  0], 40,  10),
		new Rocket(game.globals, renderers[1]).position(-30, height2,  0).trajectory([20,  height5,  0], 40,  10),
		new Rocket(game.globals, renderers[1]).position(-30, height2,  0).trajectory([20,  height5,  0], 35,  10),
		new Rocket(game.globals, renderers[1]).position(-30, height2,  0).trajectory([20,  height5,  0], 30,  10)
	];
	for(const rocket of rockets) {
		game.globals.rockets.addRocket(rocket);
		rocket._rspe = 3;
		rocket.launch();
	}
}
