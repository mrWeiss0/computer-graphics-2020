import {utils} from "./index.js";
const ProgramWrapper = utils.program.ProgramWrapper;

export class SkyboxRenderer {
	constructor(globals) {
		this._globals    = globals;
		this._program    = null;
		this._tex        = null;
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

	draw() {
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
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._tex);
		gl.uniformMatrix4fv(this._program.getUniformLocation("u_viewDirProjInv"), false, this._matArray);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}
