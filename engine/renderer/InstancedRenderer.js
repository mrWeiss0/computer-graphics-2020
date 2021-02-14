import {utils, Renderer} from "./index.js";
const Mat3 = utils.matrix.Mat3;

/*
 * Instanced renderer class
 *
 * This class draws objects with an instanced call
 * after enough objects are queued or when flush() method is called.
 * Objects need to have a worldMatrix property of type Mat4.
 */
export class InstancedRenderer extends Renderer {
	constructor(globals, frenchMesh) {
		super(globals, frenchMesh);
		this._count      = 0;
		const matBuffer  = this._globals.buffers.mat;
		if(!matBuffer)
			throw new Error("mat buffer not defined");
		this._matArray   = new Float32Array(matBuffer.itemSize * matBuffer.numItems);
	}

	/* Initialize the Vertex Array Object */
	initVAO() {
		super.initVAO();
		const program = this._program;
		const gl = this._globals.glContext;
		
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

		gl.bindVertexArray(null);
	}

	/* Queue an object for instanced rendering */
	draw(obj) {
		const matBuffer = this._globals.buffers.mat;
		const viewMatrix = this.viewMatrix;
		this._matArray.set(viewMatrix.mul(obj.worldMatrix).val, matBuffer.itemSize * this._count);
		this._matArray.set(new Mat3(viewMatrix.mul(obj.worldMatrix)).transposed().inverse().val, matBuffer.itemSize * this._count + 16);
		if(++this._count >= matBuffer.numItems)
			this.flush();
	}

	/* Render all pending objects */
	flush() {
		if(this._count == 0)
			return;
		
		const gl = this._globals.glContext;
		this._prepareDrawCall();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._globals.buffers.mat);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._matArray);

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
