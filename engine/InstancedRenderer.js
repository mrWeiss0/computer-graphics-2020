import {ProgramWrapper} from "../webgl2-utils/program/index.js";
import {Mat3} from "../webgl2-utils/matrix/index.js";

/*
 * Instanced renderer class
 *
 * This class draws objects with an instanced call
 * after enough objects are queued or when flush() method is called.
 * Objects need to have a worldMatrix property of type Mat4.
 */
export class InstancedRenderer {
	constructor(globals, frenchMesh) {
		this._globals    = globals;
		this._frenchMesh = frenchMesh;
		this._program    = null;
		this._count      = 0;
		const matBuffer  = this._globals.buffers.mat;
		if(!matBuffer)
			throw new Error("mat buffer not defined");
		this._matArray   = new Float32Array(matBuffer.itemSize * matBuffer.numItems);
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
		
		const matBuffer  = this._globals.buffers.mat;
		const a_objmat = program.getAttributeLocation("a_objmat");
		const a_normmat = program.getAttributeLocation("a_normmat");
		gl.bindBuffer(gl.ARRAY_BUFFER, matBuffer);
		if(a_objmat >= 0) for (let i = 0; i < 4; ++i) {
			const columnLocation = a_objmat + i;
			gl.enableVertexAttribArray(columnLocation);
			gl.vertexAttribPointer(
				columnLocation,
				4,
				gl.FLOAT,
				false,
				this._matArray.BYTES_PER_ELEMENT * matBuffer.itemSize,
				this._matArray.BYTES_PER_ELEMENT * 4 * i,
			);
			gl.vertexAttribDivisor(columnLocation, 1);
		}
		if(a_normmat >= 0) for (let i = 0; i < 3; ++i) {
			const columnLocation = a_normmat + i;
			gl.enableVertexAttribArray(columnLocation);
			gl.vertexAttribPointer(
				columnLocation,
				3,
				gl.FLOAT,
				false,
				this._matArray.BYTES_PER_ELEMENT * matBuffer.itemSize,
				this._matArray.BYTES_PER_ELEMENT * (3 * i + 16),
			);
			gl.vertexAttribDivisor(columnLocation, 1);
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, frenchMesh.indexBuffer);

		gl.bindVertexArray(null);
	}

	/* Queue an object for instanced rendering */
	draw(obj) {
		const matBuffer = this._globals.buffers.mat;
		const viewMatrix = this._globals.viewMatrix;
		this._matArray.set(viewMatrix.mul(obj.worldMatrix).val, matBuffer.itemSize * this._count);
		this._matArray.set(new Mat3(viewMatrix.mul(obj.worldMatrix).transposed().inverse()).val, matBuffer.itemSize * this._count + 16);
		if(++this._count >= matBuffer.numItems)
			this.flush();
	}

	/* Render all pending objects */
	flush() {
		const gl = this._globals.glContext;

		gl.bindVertexArray(this._vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, this._globals.buffers.mat);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._matArray);
		this._program.use();
		gl.uniformMatrix4fv(this._program.getUniformLocation("u_projmat"), false, this._globals.projMatrix.val)

		gl.drawElementsInstanced(
			gl.TRIANGLES,
			this._frenchMesh.indexBuffer.numItems,
			gl.UNSIGNED_SHORT,
			0,
			this._count
		);

		this._count = 0;
	}
}
