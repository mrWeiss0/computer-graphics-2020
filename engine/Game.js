import { Camera } from "./Camera.js";
import {utils, Globals, ModelLoader} from "./index.js";
import {InstancedRenderer, InstancedBillboardRenderer, Renderer, ClipBillboardRenderer} from "./renderer/index.js";
import {Rocket} from "./rocket/index.js";
const Mat4 = utils.matrix.Mat4;
const [NEAR, FAR] = [50, 20000];


export class Game extends utils.App {
	constructor(canvas, {
		INSTANCED_BUFSIZE = 20,
		BILLBOARD_BUFSIZE = 20,
		MAX_LIGHTS = 10,
		TIMESTEP = 0
	} = {}) {
		super(canvas, TIMESTEP);
		
		this.initMouse();
		this.mouse.hideMenu = true;
		this.mouse.register(this);
		this.mouse.enablePointerLock();
		this.initKeyboard();

		const glContext = this.glContext;
		this.globals = new Globals(this.glContext);
		this.globals.addBuffer(   "mat", INSTANCED_BUFSIZE, 16 + 9, 4, glContext.ARRAY_BUFFER);
		this.globals.addBuffer( "billb", BILLBOARD_BUFSIZE,      7, 4, glContext.ARRAY_BUFFER);
		this.globals.addBuffer("lights",    MAX_LIGHTS + 1,      4, 4, glContext.UNIFORM_BUFFER);
		const lightsBuf = this.globals.buffers.lights;
		lightsBuf.bindingPoint = 0;
		glContext.bindBufferBase(glContext.UNIFORM_BUFFER, lightsBuf.bindingPoint, this.globals.buffers.lights);

		this.globals.mouse = this.mouse;
		this.globals.keyboard = this.keyboard;
		this.globals.camera = new Camera(this.globals);

		this.terrains = [];
		this._modelLoader = null;
		this.rends = createRendObject(
			[  "rockets", InstancedRenderer ],
			[ "terrains",          Renderer ]
		);
		this.billboardRends = createRendObject(
			[  "explosions", InstancedBillboardRenderer ],
			[      "scopes",      ClipBillboardRenderer ]
		);
		this.skyboxes = new Map();
		this.activeSkybox = null;
		this.scope = {target : [0, 0, 0], size : [.08, .08], frameN : 1};

		this.autoResize();

		glContext.clearColor(0, 0, 0, 0);
		glContext.enable(glContext.CULL_FACE);
		glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE_MINUS_SRC_ALPHA);

		this._test = true;
	}

	get modelLoader() {
		if(this._modelLoader == null)
			this._modelLoader = new ModelLoader(this);
		return this._modelLoader;
	}

	getRendererList(name) {
		let t = this.rends[name] || this.billboardRends[name];
		if(!t)
			return null;
		return t.list;
	}

	autoResize() {
		const [w, h] = [this.canvas.clientWidth, this.canvas.clientHeight];
		this.resize(w, h);
		this.globals.projMatrix = Mat4.perspFOV(Math.PI / 4, w / h, NEAR, FAR);
		this.globals.ar = w / h;
		this.glContext.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	draw() {
		let gl = this.glContext;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		this.globals.rockets.draw();
		for(const r of this.getRendererList("rockets"))
			r.flush();
		for(const t of this.terrains)
			t.draw();
		gl.depthFunc(gl.LEQUAL);
		this.activeSkybox.draw();
		gl.depthFunc(gl.LESS);
		gl.enable(gl.BLEND);
		this.globals.rockets.drawExplosions();
		for(const r of this.getRendererList("explosions"))
			r.flush();
		this.getRendererList("scopes")[0].draw(this.scope);
		gl.disable(gl.BLEND);
		gl.disable(gl.DEPTH_TEST);
	}

	click(e) {
		if(!this.mouse.pointerLock)
			return;
		test(this, 1);
	}
	
	update(dt) {
		if(this.keyboard.key("Enter")) {
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

function randRocket(game, havg = 3000) {
	const acc = 2 ** (Math.random() * 2 - .5) * game.globals.gravity;
	const h   = 1000 * (Math.random() * 2 - 1) + havg;

	const renderers = game.getRendererList("rockets");
	const r = Math.random();
	let rend;
	if(r < .8)
		rend = renderers[1];
	else
		rend = renderers[0];
	
	const x0 = 1000 * (Math.random() * 6 - 3);
	const z0 = 1000 * (Math.random() * 8 - 4);
	const {height : y0} = game.globals.collision.findFloorHeight(x0, Infinity, z0);

	const x1 = 1000 * (Math.random() * 8 - 4);
	const z1 = 1000 * (Math.random() * 10 - 5);
	let {height : y1} = game.globals.collision.findFloorHeight(x1, Infinity, z1);
	if(y1 == -Infinity) y1 = 0;

	return new Rocket(game.globals, rend, game.getRendererList("explosions")).position(x0, y0, z0).trajectory([x1, y1, z1], h, acc);
}

function test(game, count = 50) {
	let rockets = [];
	for(let i = 0; i < count; i++)
		rockets.push(randRocket(game));
	for(const rocket of rockets) {
		game.globals.rockets.addRocket(rocket.scale(50));
		rocket.launch();
	}
}
