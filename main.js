import {loadFile} from "./webgl2-utils/index.js";
import {Game} from "./engine/index.js";

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

async function main() {
	const canvas = createCanvas(document.body);
	canvas.focus();

	const config = await loadFile("config/config.json").then(r => r.json());
	const game = new Game(canvas, config);
	addEventListener("resize", () => game.autoResize());

	const pl = game.getProgramLoader();
	const programs = pl.loadFromJSON("config/programs.json");
	await game.modelLoader.loadModelsJSON("config/models.json");
	await game.modelLoader.loadSkyboxesJSON("config/skyboxes.json");
	await game.modelLoader.loadMapDataJSON("config/terrains.json");
	await programs;

	if(DEBUG) {
		await pl.checkShaders();
		await pl.checkPrograms();
		const err = await pl.validatePrograms();
		if(err)
			throw new Error(err + " programs failed to validate");
	}
	pl.deleteShaders();

	const program = game.getProgram("main");
	program.queryAttributes();
	program.queryUniforms();
	program.queryUniformBlocks();
	program.uniformBlockBinding("u_lights", game.globals.buffers.lights.bindingPoint);
	program.uniformBlockBinding("u_daylight", game.globals.buffers.daylight.bindingPoint);
	for(const rend of game.getRendererList("rockets")) {
		rend.program = program;
		rend._reflect = [.6, .8, 1];
		rend.initVAO();
	}
	for(const rend of game.getRendererList("terrains")) {
		rend.program = program;
		rend.initVAO();
	}

	const skyboxProg = game.getProgram("skybox");
	skyboxProg.queryUniforms();
	skyboxProg.queryUniformBlocks();
	skyboxProg.uniformBlockBinding("u_daylight", game.globals.buffers.daylight.bindingPoint);
	for(const skybox of game.skyboxes.values()) {
		skybox.program = skyboxProg;
	}

	const billboardProg = game.getProgram("bill");
	billboardProg.queryAttributes();
	billboardProg.queryUniforms();
	for(const rend of game.getRendererList("explosions")) {
		rend.program = billboardProg;
		rend.initVAO();
	}
	for(const rend of game.getRendererList("scopes")) {
		rend.program = billboardProg;
		rend.initVAO();
	}

	game.globals.camera.position(0, 2000, 8000);
	game.run();
	
	globalThis.game = game;
}

addEventListener("load", () => {
	main().catch(console.error);
});
