import {loadFile} from "./webgl2-utils/index.js";
import {Game} from "./engine/Game.js";
import {InstancedRenderer} from "./engine/InstancedRenderer.js";
import {Rocket} from "./engine/rocket/index.js";
import "./engine/webgl-obj-loader.min.js";

const DEBUG = true;

function createCanvas(parentElement) {
	let canvas = document.createElement("canvas");
	canvas.style.width   = "100%";
	canvas.style.height  = "100%";
	canvas.style.display = "block";
	canvas.style.outline = "none";
	canvas.tabIndex = 0;
	parentElement.appendChild(canvas);
	return canvas;
}

async function init(game) {
	const programLoader = game.getProgramLoader();
	await programLoader.loadFromJSON("programs.json");
	game.glContext.flush();
	// TODO move meshes in json
	const meshes = await Promise.all(["assets/models/R27-Ready.obj", "assets/models/R73-Ready.obj"].map(name => loadFile(name)
		.then(response => response.text())
		.then(text => new OBJ.Mesh(text))));
	for(const mesh of meshes) {
		OBJ.initMeshBuffers(game.glContext, mesh);
		game.rockets.addRenderer(new InstancedRenderer(game.globals, mesh));
	}
	// Test
	const renderers = game.rockets.renderers;
	let rockets = [
		new Rocket(game.globals, renderers[0]).position(-80, -20,  0).trajectory([40,  0, 0], 10, 10),
		new Rocket(game.globals, renderers[0]).position(-20, -10, 10).trajectory([10, 10, 5], 10, 15),
		new Rocket(game.globals, renderers[1]).position(-20, -10, 10).trajectory([20, 10, 0], 15,  5)
	];
	for(const rocket of rockets) {
		game.rockets.addRocket(rocket);
		rocket._rspe = 3;
		rocket.launch();
	}
	
	game.globals.camera.position(30, 20, 5);
	
	if(DEBUG) {
		programLoader.checkShaders();
		programLoader.checkPrograms();
		const err = programLoader.validatePrograms();
		if(err)
			throw new Error(err + " programs failed to validate");
	}
	programLoader.deleteShaders();
	
	const program = game.getProgram("main");
	program.queryAttributes();
	program.queryUniforms();
	program.queryUniformBlocks();
	for(const rend of renderers) {
		rend.program = program;
		rend.initVAO();
	}
	program.uniformBlockBinding("u_lights", game.globals.buffers.lights.bindingPoint);
}

function main() {
	const canvas = createCanvas(document.body);
	canvas.focus();
	// TODO from json
	globalThis.game = new Game(canvas, {INSTANCED_BUFSIZE: 2, MAX_LIGHTS: 4});
	init(game).then(() => game.run()).catch(console.error);
}

addEventListener("load", main);