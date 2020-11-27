import {App} from "./webgl2-utils/App.js";
import {Mat3, Mat4, Vec3, Quat} from "./webgl2-utils/matrix/index.js";

class Game extends App {
	init() {
		let gl = this.glContext;
		
		this.initMouse();
		this.mouse.hideMenu = true;
		
		this.initKeyboard();
		
  		gl.clearColor(0, 0, 0, 0);
  		gl.enable(gl.DEPTH_TEST);
  		
		addEventListener("resize", () => {
			this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
			this.ar = this.canvas.clientWidth / this.canvas.clientHeight;
		});
		
		this.angle = 0;
		this.langle = Math.PI / -6;
		this.speed = Math.PI / 5000; // rad per ms
		this.lspeed = 0;//Math.PI / -10000; // rad per ms
		
		this.position_buffer = gl.createBuffer();
		this.normal_buffer = gl.createBuffer();
		this.color_buffer = gl.createBuffer();
		this.indexBuffer = gl.createBuffer();
		
		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);
		
		// positions
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			Math.cos(0), Math.sin(0), 0,
			Math.cos(Math.PI/3*1), Math.sin(Math.PI/3*1), 0,
			Math.cos(Math.PI/3*2), Math.sin(Math.PI/3*2), 0,
			Math.cos(Math.PI/3*3), Math.sin(Math.PI/3*3), 0,
			Math.cos(Math.PI/3*4), Math.sin(Math.PI/3*4), 0,
			Math.cos(Math.PI/3*5), Math.sin(Math.PI/3*5), 0,
			
			Math.cos(0), Math.sin(0), 0,
			Math.cos(Math.PI/3*1), Math.sin(Math.PI/3*1), 0,
			Math.cos(Math.PI/3*2), Math.sin(Math.PI/3*2), 0,
			Math.cos(Math.PI/3*3), Math.sin(Math.PI/3*3), 0,
			Math.cos(Math.PI/3*4), Math.sin(Math.PI/3*4), 0,
			Math.cos(Math.PI/3*5), Math.sin(Math.PI/3*5), 0,
			
			Math.cos(Math.PI/3*1), Math.sin(Math.PI/3*1), 0,
			Math.cos(Math.PI/3*2), Math.sin(Math.PI/3*2), 0,
			Math.cos(Math.PI/3*3), Math.sin(Math.PI/3*3), 0,
			Math.cos(Math.PI/3*4), Math.sin(Math.PI/3*4), 0,
			Math.cos(Math.PI/3*5), Math.sin(Math.PI/3*5), 0,
			Math.cos(0), Math.sin(0), 0,
			
			0, 0, 2,
			0, 0, 2,
			0, 0, 2,
			0, 0, 2,
			0, 0, 2,
			0, 0, 2 ]), gl.STATIC_DRAW);
		
		// normals
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			
			Math.cos(Math.PI/3*0.5), Math.sin(Math.PI/3*0.5), .5,
			Math.cos(Math.PI/3*1.5), Math.sin(Math.PI/3*1.5), .5,
			Math.cos(Math.PI/3*2.5), Math.sin(Math.PI/3*2.5), .5,
			Math.cos(Math.PI/3*3.5), Math.sin(Math.PI/3*3.5), .5,
			Math.cos(Math.PI/3*4.5), Math.sin(Math.PI/3*4.5), .5,
			Math.cos(Math.PI/3*5.5), Math.sin(Math.PI/3*5.5), .5,
			
			Math.cos(Math.PI/3*0.5), Math.sin(Math.PI/3*0.5), .5,
			Math.cos(Math.PI/3*1.5), Math.sin(Math.PI/3*1.5), .5,
			Math.cos(Math.PI/3*2.5), Math.sin(Math.PI/3*2.5), .5,
			Math.cos(Math.PI/3*3.5), Math.sin(Math.PI/3*3.5), .5,
			Math.cos(Math.PI/3*4.5), Math.sin(Math.PI/3*4.5), .5,
			Math.cos(Math.PI/3*5.5), Math.sin(Math.PI/3*5.5), .5,
			
			Math.cos(Math.PI/3*0.5), Math.sin(Math.PI/3*0.5), .5,
			Math.cos(Math.PI/3*1.5), Math.sin(Math.PI/3*1.5), .5,
			Math.cos(Math.PI/3*2.5), Math.sin(Math.PI/3*2.5), .5,
			Math.cos(Math.PI/3*3.5), Math.sin(Math.PI/3*3.5), .5,
			Math.cos(Math.PI/3*4.5), Math.sin(Math.PI/3*4.5), .5,
			Math.cos(Math.PI/3*5.5), Math.sin(Math.PI/3*5.5), .5
			]), gl.STATIC_DRAW);
		
		
		// colors
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array([
			  0,   0,   0,
			  0,   0,   0,
			  0,   0,   0,
			  0,   0,   0,
			  0,   0,   0,
			  0,   0,   0,
			
			255,   0,   0,
			255, 255,   0,
			  0, 255,   0,
			  0, 255, 255,
			  0,   0, 255,
			255,   0, 255,
			
			255, 255,   0,
			  0, 255,   0,
			  0, 255, 255,
			  0,   0, 255,
			255,   0, 255,
			255,   0,   0,
			
			255, 255, 255,
			255, 255, 255,
			255, 255, 255,
			255, 255, 255,
			255, 255, 255,
			255, 255, 255 ]), gl.STATIC_DRAW);
		
		/* Indices */
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		let indices = [
			 0,  2,  1,
			 0,  3,  2,
			 0,  4,  3,
			 0,  5,  4,
			
			18,  6, 12,
			19,  7, 13,
			20,  8, 14,
			21,  9, 15,
			22, 10, 16,
			23, 11, 17
		];
		gl.bufferData(
			gl.ELEMENT_ARRAY_BUFFER,
			new Uint8Array(indices),
			gl.STATIC_DRAW
		);
		
		this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
		this.ar = this.canvas.clientWidth / this.canvas.clientHeight;
	}

	draw() {
		let gl = this.glContext;
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		let u_ldir_loc = this.getProgram("myProg").getUniform("u_ldir").location;
		let u_wti_loc = this.getProgram("myProg").getUniform("u_wti").location;
		let u_wvp_loc = this.getProgram("myProg").getUniform("u_wvp").location;
		
		gl.uniform3fv(u_ldir_loc, Quat.fromAngleAxis(this.langle + this.lspeed * this.lag, [0,1,0]).toMat3().mul(new Vec3(2,1,0).normalize()).val);
		
		let h = 2;
		let d = 5;
		
		let world = Mat4.rotX(-Math.PI/2)
			.mul(Mat4.rotZ(this.angle + this.speed * this.lag))
			//.mul(Mat4.scale(1,1,.5))
			;
		
		gl.uniformMatrix3fv(u_wti_loc, false,
			new Mat3(world).transposed().inverse()
			.val);
		
		//let view = Mat4.lookAt([0, 2, d], [0, 1, 0]).inverse();
		
		gl.uniformMatrix4fv(u_wvp_loc, false,
			Mat4.persp(h * this.ar, h, .1, 100, d)
			.mul(Mat4.lookAt([0, 2, d], [0, 1, 0]).inverse())
			.mul(world)
			.val);
		
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.drawElements(gl.TRIANGLES, 3 * 10, gl.UNSIGNED_BYTE, 0);
		
		gl.uniformMatrix4fv(u_wvp_loc, false,
			Mat4.ortho(h, h, .1, 100, d)
			.mul(Mat4.lookAt([0, d, 0], [0, 0, 0]).inverse())
			.mul(world)
			.val);
		
		gl.viewport(gl.canvas.width - gl.canvas.height / 3, gl.canvas.height * 2 / 3, gl.canvas.height / 3, gl.canvas.height / 3);
		//gl.drawArrays(gl.TRIANGLES, 0, 3 * 10);
		gl.drawElements(gl.TRIANGLES, 3 * 10, gl.UNSIGNED_BYTE, 0);
	}
	
	update(dt) {
		this.angle += this.speed * dt;
		this.langle += this.lspeed * dt;
		
	}

	resize(width, height, hdpi=true) {
		let pixr = hdpi && window.devicePixelRatio || 1;
		
		this.canvas.width  = Math.floor(width  * pixr);
		this.canvas.height = Math.floor(height * pixr);
	}
}

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

async function init() {
	let canvas = createCanvas(document.body);
	canvas.focus();
	globalThis.game = new Game(canvas);
	
	let programLoader = game.getProgramLoader();
	
	await programLoader.loadFromObject({
		"shaders" : [
			{
				"type" : "VERTEX_SHADER",
				"url"  : "vert.glsl"
			},
			{
				"type" : "FRAGMENT_SHADER",
				"url"  : "frag.glsl"
			}
		],
		"programs" : [
			{
				"name"    : "myProg",
				"shaders" : [ "vert.glsl", "frag.glsl" ]
			}
		]
	});
	
	game.glContext.flush();
	
	/*
	 * 
	 */
	
	game.init();
	
	/*
	 * 
	 */
	
	programLoader.checkShaders();
	programLoader.deleteShaders();
	
	programLoader.checkPrograms();
	if(programLoader.validatePrograms())
		throw new Error("Error compiling programs");
	
	let program = game.getProgram("myProg");
	program.queryAttributes();
	program.queryUniforms();
	
	let a_position_loc = program.getAttribute("a_position").location;
	let a_color_loc = program.getAttribute("a_color").location;
	let a_normal_loc = program.getAttribute("a_normal").location;
	
	let gl = game.glContext;
	
	game.useProgram("myProg");
	
	gl.bindBuffer(gl.ARRAY_BUFFER, game.position_buffer);
	gl.enableVertexAttribArray(a_position_loc);
	gl.vertexAttribPointer(a_position_loc, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, game.normal_buffer);
	gl.enableVertexAttribArray(a_normal_loc);
	gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, game.color_buffer);
	gl.enableVertexAttribArray(a_color_loc);
	gl.vertexAttribPointer(a_color_loc, 3, gl.UNSIGNED_BYTE, true, 0, 0);
	gl.vertexAttrib3f(a_color_loc, .6, .4, .2);
	
	game.run();
}

function main() {
	init().catch(console.error);
}

addEventListener("load", main);
