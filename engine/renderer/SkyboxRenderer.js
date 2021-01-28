import {utils} from "./index.js";
const ProgramWrapper = utils.program.ProgramWrapper;

export class SkyboxRenderer {
	constructor(globals, frenchMesh) {
		this._globals    = globals;
		this._frenchMesh = frenchMesh;
		this._program    = null;
		this._tex        = null;
		this._vao        = this._globals.glContext.createVertexArray();
		this._matArray   = new Float32Array(16);
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

	get mesh() {
		return this._frenchMesh;
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
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, frenchMesh.indexBuffer);
	}

	draw(obj) {
		const camMatrix = this._globals.viewMatrix.inverse();
		camMatrix.set(3,0,0);
		camMatrix.set(3,1,0);
		camMatrix.set(3,2,0);
		const skyboxMatrix = camMatrix.mul(this._globals.projMatrix.inverse());
		this._matArray.set(skyboxMatrix.val, 0);
		
		this.flush();
	}

	flush() {
		const gl = this._globals.glContext;
		this._program.use();
		gl.bindVertexArray(this._vao);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._tex);
		gl.uniformMatrix4fv(this._program.getUniformLocation("u_viewDirProjInv"), false, this._matArray);

		gl.drawElements(
			gl.TRIANGLES,
			this._frenchMesh.indexBuffer.numItems,
			gl.UNSIGNED_SHORT,
			0
		);
	}
}
