import {utils} from "./index.js";
import "./webgl-obj-loader.min.js";

export class RendererFactory {
	constructor(globals) {
		this.globals  = globals;
		this.meshes   = new Map();
		this.textures = new Map();
		this.defColor = new Uint8Array(3);
	}

	async createRenderer(rendererClass, meshFile, textureFile, path="") {
		const mesh = await this._getMesh(path + meshFile);
		const rend = new rendererClass(this.globals, mesh);
		if(textureFile != null)
			rend.texture = this._getTexture(path + textureFile);
		return rend;
	}

	/* Calls OBJ.initMeshBuffers on every loaded mesh */
	async initMeshBuffers() {
		for(const mesh of await Promise.all(this.meshes.values()))
			OBJ.initMeshBuffers(this.globals.glContext, mesh);
	}

	setDefaultColor(color) {
		this.defColor.set(color);
	}

	/*
	 * Creates a frenchtoast Mesh from the obj url
	 * if not already present, calls initMeshBuffers
	 * and returns a promise that resolves to the new Mesh
	 */
	_getMesh(url) {
		if(this.meshes.has(url))
			return this.meshes.get(url);
		const pr = utils.loadFile(url)
			.then(response => response.text())
			.then(text => new OBJ.Mesh(text));
		this.meshes.set(url, pr);
		return pr;
	}

	/*
	 * Creates a texture from the image url
	 * if not already present and returns
	 * the texture while the image loads asynchronously
	 */
	_getTexture(url) {
		if(this.textures.has(url))
			return this.textures.get(url);
		const gl = this.globals.glContext;
		const tex = gl.createTexture();
		this.textures.set(url, tex);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGB,
			1, 1, 0,
			gl.RGB, gl.UNSIGNED_BYTE,
			this.defColor);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
		utils.loadFile(url)
			.then(response => response.blob())
			.then(blob => createImageBitmap(blob, {imageOrientation:"flipY"}))
			.then(img => this._uploadTexImage(tex, img))
			.catch(e => console.error(e));
		return tex;
	}

	_uploadTexImage(tex, img) {
		const gl = this.globals.glContext;
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGB,
				gl.RGB, gl.UNSIGNED_BYTE,
				img);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
}
