import {BillboardRenderer} from "./index.js";

export class InstancedBillboardRenderer extends BillboardRenderer {
	constructor(globals) {
		super(globals);
		this._count      = 0;
		const dataBuffer = this._globals.buffers.billb;
		if(!dataBuffer)
			throw new Error("mat buffer not defined");
		this._matArray   = new Float32Array(dataBuffer.itemSize * dataBuffer.numItems);
		this._intArray   = new Int32Array(this._matArray.buffer);
	}

	/* Initialize the Vertex Array Object */
	initVAO() {
		const program = this._program;
		if(program == null)
			throw new Error("Can't init VAO without a program");
		const gl = this._globals.glContext;

		gl.bindVertexArray(this._vao);
		const dataBuffer  = this._globals.buffers.billb;
		const target = program.getAttributeLocation("target");
		const size = program.getAttributeLocation("size");
		const anchor = program.getAttributeLocation("anchor");
		gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);

		gl.enableVertexAttribArray(target);
		gl.vertexAttribPointer(
			target,
			3,
			gl.FLOAT,
			false,
			this._matArray.BYTES_PER_ELEMENT * dataBuffer.itemSize,
			0,
		);
		gl.vertexAttribDivisor(target, 1);

		gl.enableVertexAttribArray(size);
		gl.vertexAttribPointer(
			size,
			2,
			gl.FLOAT,
			false,
			this._matArray.BYTES_PER_ELEMENT * dataBuffer.itemSize,
			this._matArray.BYTES_PER_ELEMENT * 3,
		);
		gl.vertexAttribDivisor(size, 1);

		gl.enableVertexAttribArray(anchor);
		gl.vertexAttribIPointer(
			anchor,
			1,
			gl.INT,
			false,
			this._matArray.BYTES_PER_ELEMENT * dataBuffer.itemSize,
			this._matArray.BYTES_PER_ELEMENT * (3 + 2),
		);
		gl.vertexAttribDivisor(anchor, 1);

		gl.bindVertexArray(null);
	}

	draw(obj) {
		const dataBuffer = this._globals.buffers.billb;
		this._matArray.set(obj.target, dataBuffer.itemSize * this._count);
		this._matArray.set(obj.size, dataBuffer.itemSize * this._count + 3);
		this._intArray.set(obj.anchor, dataBuffer.itemSize * this._count + 3 + 2);
		if(++this._count >= dataBuffer.numItems)
			this.flush();
	}

	/* Render all pending objects */
	flush() {
		if(this._count == 0)
			return;
		
		const gl = this._globals.glContext;
		this._program.use();
		gl.bindVertexArray(this._vao);
		gl.bindTexture(gl.TEXTURE_2D, this._tex);
		gl.uniformMatrix4fv(this._program.getUniformLocation("u_v"), false, this._globals.viewMatrix);
		gl.uniformMatrix4fv(this._program.getUniformLocation("u_pv"), false, this._globals.projMatrix.mul(this._globals.viewMatrix));
		gl.bindBuffer(gl.ARRAY_BUFFER, this._globals.buffers.billb);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._matArray);

		gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this._count);

		this._count = 0;
	}
}
