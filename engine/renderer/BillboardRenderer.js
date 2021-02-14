import {AbstractRenderer} from "./index.js";

export class BillboardRenderer extends AbstractRenderer {
	constructor(globals) {
		super(globals);
		this._vao        = this._globals.glContext.createVertexArray();
		this.sheetW_i = 0;
		this.sheetH_i = 0;
		this.frameCount  = 0;
		this.anchor = 0;
		this._matArray   = new Float32Array(7);
	}

	get frameW() {
		if(!this.texture.width)
			return 0;
		return this.texture.width * this.sheetW_i;
	}

	get frameH() {
		if(!this.texture.height)
			return 0;
		return this.texture.height * this.sheetH_i;
	}

	draw(obj) {
		this._matArray.set(obj.target, 0);
		this._matArray.set(obj.size, 3);
		const n = obj.frameN % this.frameCount;
		this._matArray[3 + 2 + 0] = n * this.sheetW_i % 1;
		this._matArray[3 + 2 + 1] = Math.floor(n * this.sheetW_i) * this.sheetH_i;
		this.flush();
	}

	flush() {
		const gl = this._globals.glContext;
		const program = this._program;
		this._prepareDrawCall();
		const target = program.getAttributeLocation("target");
		const size = program.getAttributeLocation("size");
		const foffs = program.getAttributeLocation("frameoffset");
		gl.vertexAttrib3fv(target, this._matArray.subarray(0, 0 + 3));
		gl.vertexAttrib2fv(size,   this._matArray.subarray(3, 3 + 2));
		gl.vertexAttrib2fv(foffs,  this._matArray.subarray(5, 5 + 2));

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	_prepareDrawCall() {
		const gl = this._globals.glContext;
		const program = this._program;
		program.use();
		gl.bindVertexArray(this._vao);
		gl.bindTexture(gl.TEXTURE_2D, this._tex);
		gl.uniform1i(this._program.getUniformLocation("anchor"), this.anchor);
		gl.uniform2f(program.getUniformLocation("framesize"), this.sheetW_i, this.sheetH_i);
		const vMat = this.viewMatrix;
		gl.uniform3f(program.getUniformLocation("u_camRight"), vMat.get(0, 0), vMat.get(1, 0), vMat.get(2, 0));
		gl.uniform3f(program.getUniformLocation("u_camUp"), vMat.get(0, 1), vMat.get(1, 1), vMat.get(2, 1));
		gl.uniformMatrix4fv(program.getUniformLocation("u_pv"), false, this.projMatrix.mul(this.viewMatrix));
	}
}
