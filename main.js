import {loadFile} from "./webgl2-utils/index.js";
import {Game, InstancedRenderer} from "./engine/index.js";
import {rocket} from "./engine/index.js";

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

function test(game) {
	// Test
	const renderers = game.globals.rockets.renderers;
	let rockets = [
		new rocket.Rocket(game.globals, renderers[0]).position(-80, -20,  0).trajectory([40,  0, 0], 10, 10),
		new rocket.Rocket(game.globals, renderers[0]).position(-20, -10, 10).trajectory([10, 10, 5], 10, 15),
		new rocket.Rocket(game.globals, renderers[1]).position(-20, -10, 10).trajectory([20, 10, 0], 15,  5)
	];
	for(const rocket of rockets) {
		game.globals.rockets.addRocket(rocket);
		rocket._rspe = 3;
		rocket.launch();
	}
	game.globals.camera.position(30, 20, 5);
}

async function main() {
	const canvas = createCanvas(document.body);
	canvas.focus();

	const config = await loadFile("config.json");
	const game = new Game(canvas, config);
	addEventListener("resize", () => game.autoResize());

	const pl = game.getProgramLoader();
	const programs = pl.loadFromJSON("programs.json");

	const rf = game.getRendererFactory();
	rf.setColor([255, 0, 0]);
	const models = rf.loadFromJSON("models.json", {rockets : InstancedRenderer}).then(models => {
		for(const r of models.rockets) {
			game.globals.rockets.addRenderer(r);
		}
	});

	if(DEBUG) {
		pl.checkShaders();
		pl.checkPrograms();
		const err = await pl.validatePrograms();
		if(err)
			throw new Error(err + " programs failed to validate");
	}
	pl.deleteShaders();

	await programs;
	const program = game.getProgram("main");
	program.queryAttributes();
	program.queryUniforms();
	program.queryUniformBlocks();
	await models;
	await rf.initMeshBuffers();
	for(const rend of game.globals.rockets.renderers) {
		rend.program = program;
		rend.initVAO();
	}
	program.uniformBlockBinding("u_lights", game.globals.buffers.lights.bindingPoint);

	game.run();

	// TEST
	test(game);
	
	globalThis.game = game;
}

addEventListener("load", () => {
	main().catch(console.error);
});
