import {utils} from "./index.js";
const ProgramWrapper = utils.program.ProgramWrapper;

export class AbstractRenderer {
	constructor(globals) {
		this._globals    = globals;
		this._program    = null;
		this._tex        = null;
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
}
