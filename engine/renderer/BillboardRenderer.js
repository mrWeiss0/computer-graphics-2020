import {AbstractRenderer} from "./index.js";

export class BillboardRenderer extends AbstractRenderer {
	constructor(globals) {
		super(globals);
		this._vao        = this._globals.glContext.createVertexArray();
		this.sheetWidth  = 0;
		this.frameCount  = 0;
		this.frameWidth  = 0;
		this.frameHeigth = 0;
		this._matArray   = new Float32Array(6);
		this._intArray   = new Int32Array(this._matArray.buffer);
	}

	draw(obj) {
		this._matArray.set(obj.target, 0);
		this._matArray.set(obj.size, 3);
		this._intArray.set(obj.anchor, 3 + 2);
		this.flush();
	}

	flush() {
		const gl = this._globals.glContext;
		const program = this._program;
		program.use();
		gl.bindVertexArray(this._vao);
		gl.bindTexture(gl.TEXTURE_2D, this._tex);
		const target = program.getAttributeLocation("target");
		const size = program.getAttributeLocation("size");
		const anchor = program.getAttributeLocation("anchor");
		gl.vertexAttrib3fv(target, this._matArray.subarray(0, 3));
		gl.vertexAttrib2fv(size, this._matArray.subarray(3, 5));
		gl.vertexAttribI4i(anchor, this._intArray[5], 0, 0, 0);
		gl.uniformMatrix4fv(this._program.getUniformLocation("u_v"), false, this._globals.viewMatrix);
		gl.uniformMatrix4fv(this._program.getUniformLocation("u_pv"), false, this._globals.projMatrix.mul(this._globals.viewMatrix));

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}
