import {utils, AbstractRenderer} from "./index.js";
const Mat3 = utils.matrix.Mat3;

export class Renderer extends AbstractRenderer {
	constructor(globals, frenchMesh) {
		super(globals);
		this._frenchMesh = frenchMesh;
		this._vao        = this._globals.glContext.createVertexArray();
		this._matArray   = new Float32Array(16 + 9);
		this.roughness   = 0;
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

	set roughness(r) {
		this._roughness = Math.max(0, Math.min(r, 1)) * Math.PI / 2;
		const s = this.roughness ** 2;
		this._ON_A = 1 - .50 * s / (s + .33);
		this._ON_B =     .45 * s / (s + .09);
	}

	get roughness() {
		return this._roughness;
	}

	draw(obj) {
		const wc = this.viewMatrix.mul(obj.worldMatrix);
		this._matArray.set(wc.val, 0);
		this._matArray.set(new Mat3(wc).transposed().inverse().val, 16);
		this.flush();
	}

	flush() {
		const gl = this._globals.glContext;
		this._prepareDrawCall();
		const objloc = this._program.getAttributeLocation("a_objmat");
		const normloc = this._program.getAttributeLocation("a_normmat");
		for(let i = 0; i < 4; i++)
			gl.vertexAttrib4fv(objloc  + i, this._matArray.subarray(     i * 4,      i * 4 + 4));
		for(let i = 0; i < 3; i++)
			gl.vertexAttrib3fv(normloc + i, this._matArray.subarray(16 + i * 3, 16 + i * 3 + 3));

		gl.drawElements(
			gl.TRIANGLES,
			this._frenchMesh.indexBuffer.numItems,
			gl.UNSIGNED_SHORT,
			0
		);
	}

	_prepareDrawCall() {
		const gl = this._globals.glContext;
		this._program.use();
		gl.bindVertexArray(this._vao);
		gl.bindTexture(gl.TEXTURE_2D, this._tex);
		gl.uniformMatrix4fv(this._program.getUniformLocation("u_viewmat"), false, this.viewMatrix);
		gl.uniformMatrix4fv(this._program.getUniformLocation("u_projmat"), false, this.projMatrix);
	}
}
