import {utils} from "./index.js";
const ProgramWrapper = utils.program.ProgramWrapper;

export class Renderer {
	constructor(globals, frenchMesh) {
		this._globals    = globals;
		this._frenchMesh = frenchMesh;
		this._program    = null;
		this._tex        = null;
		this._vao        = this._globals.glContext.createVertexArray();
	}

	/* Get the program in use */
	get program() {
		return this._program;
	}
	
	/* Set the program in use */
	set program(program) {
		if(program instanceof ProgramWrapper && program.glContext == this._globals.glContext)
			this._program = program;
		else
			throw new Error("Invalid Program");
	}

	get texture() {
		return this._tex;
	}

	set texture(tex) {
		if(tex instanceof WebGLTexture)
			this._tex = tex;
		else
			throw new Error("Invalid Texture");
	}

	/* Initialize the Vertex Array Object */
	initVAO() {
		const program = this._program;
		if(program == null)
			throw new Error("Can't init VAO without a program");
		const gl = this._globals.glContext;
		const frenchMesh = this._frenchMesh;
		gl.bindVertexArray(this._vao);

		const a_position = program.getAttributeLocation("a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, frenchMesh.vertexBuffer);
		gl.enableVertexAttribArray(a_position);
		gl.vertexAttribPointer(a_position, frenchMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		const a_texcoord = program.getAttributeLocation("a_texcoord");
		gl.bindBuffer(gl.ARRAY_BUFFER, frenchMesh.textureBuffer);
		gl.enableVertexAttribArray(a_texcoord);
		gl.vertexAttribPointer(a_texcoord, frenchMesh.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		const a_normal = program.getAttributeLocation("a_normal");
		gl.bindBuffer(gl.ARRAY_BUFFER, frenchMesh.normalBuffer);
		gl.enableVertexAttribArray(a_normal);
		gl.vertexAttribPointer(a_normal, frenchMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, frenchMesh.indexBuffer);
	}

	draw(obj) {}

	flush() {
		const gl = this._globals.glContext;
		this._program.use();
		gl.bindVertexArray(this._vao);
		gl.bindTexture(gl.TEXTURE_2D, this._tex);
	}
}
