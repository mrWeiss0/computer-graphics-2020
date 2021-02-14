import {AbstractRenderer} from "./index.js";

export class SkyboxRenderer extends AbstractRenderer {
	constructor(globals) {
		super(globals);
		this._matArray   = new Float32Array(16);
	}

	draw() {
		const camMatrix = this.viewMatrix.inverse();
		camMatrix.set(3,0,0);
		camMatrix.set(3,1,0);
		camMatrix.set(3,2,0);
		const skyboxMatrix = camMatrix.mul(this.projMatrix.inverse());
		this._matArray.set(skyboxMatrix.val, 0);
		
		this.flush();
	}

	flush() {
		const gl = this._globals.glContext;
		this._program.use();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._tex);
		gl.uniformMatrix4fv(this._program.getUniformLocation("u_viewDirProjInv"), false, this._matArray);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}
