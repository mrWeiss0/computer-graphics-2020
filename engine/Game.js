import {utils, Globals, ModelLoader} from "./index.js";
import {InstancedRenderer, InstancedBillboardRenderer, Renderer, ClipBillboardRenderer} from "./renderer/index.js";
import {Rocket} from "./rocket/index.js";
import {Line} from "./collision/index.js";
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
		this.keyboard.register(this);

		const glContext = this.glContext;
		this.globals = new Globals(this.glContext);
		this.globals.addBuffer(   "mat", INSTANCED_BUFSIZE, 16 + 9, 4, glContext.ARRAY_BUFFER);
		this.globals.addBuffer( "billb", BILLBOARD_BUFSIZE,      7, 4, glContext.ARRAY_BUFFER);
		this.globals.addBuffer("lights",  2*MAX_LIGHTS + 1,      4, 4, glContext.UNIFORM_BUFFER);
		this.globals.addBuffer("daylight",               3,      4, 4, glContext.UNIFORM_BUFFER);
		const lightsBuf = this.globals.buffers.lights;
		lightsBuf.bindingPoint = 0;
		glContext.bindBufferBase(glContext.UNIFORM_BUFFER, lightsBuf.bindingPoint, this.globals.buffers.lights);
		const daylightBuf = this.globals.buffers.daylight;
		daylightBuf.bindingPoint = 1;
		glContext.bindBufferBase(glContext.UNIFORM_BUFFER, daylightBuf.bindingPoint, daylightBuf);
		this.dayLightArray = new Float32Array(daylightBuf.itemSize * daylightBuf.numItems);
		this.globals.rockets.lightOffset(0, 0, -6);
		this.globals.rockets.initLights();

		this.globals.mouse = this.mouse;
		this.globals.keyboard = this.keyboard;
		this.mouse.register(this.globals.camera);

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
		this.currentRocket = 0;
		this.rocketQueue = [];
		this.skyboxes = new Map();
		this.activeSkybox = null;
		this.scope = {target : [0, 0, 0], size : [.08, .08], frameN : 1};

		this.autoResize();

		glContext.clearColor(0, 0, 0, 0);
		glContext.enable(glContext.CULL_FACE);
		glContext.blendFunc(glContext.SRC_ALPHA, glContext.ONE_MINUS_SRC_ALPHA);
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
		this.dayLightArray.set(this.globals.ambientLight, 0);
		this.dayLightArray.set(this.globals.sunLight, 4);
		this.dayLightArray.set(this.globals.sunDir, 8);
		gl.bindBuffer(gl.UNIFORM_BUFFER, this.globals.buffers.daylight);
		gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.dayLightArray);

		this.globals.rockets.updateLights();
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
		if(e.button == 0) {
			const point = this.ray(0, 0);
			if(point) {
				point.y += 180;
				const rocket = new Rocket(this.globals, this.currentRocketRend, game.getRendererList("explosions")).position(...point).scale(50);
				this.rocketQueue.push(rocket);
				this.globals.rockets.addRocket(rocket);
			}
		}
		if(e.button == 2) {
			const point = this.ray(0, 0);
			if(point) {
				for(const rocket of this.rocketQueue)
					rocket.trajectory(point, randHeight(2500), randAcc(this.globals.gravity)).launch();
				this.rocketQueue.length = 0;
			}
		}
	}

	keydown(e) {
		const digitPress = e.code.match(/Digit(\d)/);
		if(digitPress) {
			const rocketSel = +digitPress[1] - 1;
			if(rocketSel >= 0 && rocketSel < game.getRendererList("rockets").length)
				this.currentRocket = rocketSel;
		}
		if(this.keyboard.key("KeyZ"))
			this.globals.toggleView();
		if(this.keyboard.key("Enter"))
			launchMany(this, 20);
	}

	update(dt) {
		this.globals.update(dt);
	}
	
	ray(x, y) {
		const ray = Line.fromScreen(x, y, this.globals);
		return this.globals.collision.rayCollision(ray);
	}

	get currentRocketRend() {
		return this.getRendererList("rockets")[this.currentRocket];
	}
}

function createRendObject(...entries) {
	const o = {};
	for(const [name, clazz] of entries)
		o[name] = { clazz : clazz, list : [] };
	return o;
}

function randAcc(g) {
	return 2 ** (Math.random() * 2 - 2) * g;
}

function randHeight(havg) {
	return 1000 * (Math.random() * 2 - 1) + havg
}

function launchMany(game, count) {
	for(let i = 0; i < count; i++) {
		const x0 = 1000 * (Math.random() * 6 - 3);
		const z0 = 1000 * (Math.random() * 4);
		const {height : y0} = game.globals.collision.findFloorHeight(x0, Infinity, z0);

		const x1 = 1000 * (Math.random() * 6 - 3);
		const z1 = 1000 * (Math.random() * 4 - 4);
		let {height : y1} = game.globals.collision.findFloorHeight(x1, Infinity, z1);
		if(y1 == -Infinity) y1 = 0;

		const rocket = new Rocket(game.globals, game.currentRocketRend, game.getRendererList("explosions"))
		.position(x0, y0 + 180, z0).scale(50)
		.trajectory([x1, y1, z1], randHeight(2500), randAcc(game.globals.gravity));
		game.globals.rockets.addRocket(rocket);
		rocket.launch();
	}
}
