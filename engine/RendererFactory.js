import {utils} from "./index.js";
import "./webgl-obj-loader.min.js";

export class RendererFactory {
	constructor(globals) {
		this.globals  = globals;
		this.meshes   = new Map();
		this.textures = new Map();
		this.color    = new Uint8Array(3);
	}

	async createRenderer(rendererClass, meshFile, textureFile, path="", color) {
		const mesh = await this._getMesh(path + meshFile);
		const rend = new rendererClass(this.globals, mesh);
		if(textureFile != null) {
			let oldColor;
			if(color != null) {
				oldColor = [...this.color];
				this.setColor(color);
			}
			rend.texture = this._getTexture(path + textureFile, color);
			if(color != null)
				this.setColor(oldColor);
		}
		return rend;
	}

	/* Calls OBJ.initMeshBuffers on every loaded mesh */
	async initMeshBuffers() {
		for(const mesh of await Promise.all(this.meshes.values()))
			OBJ.initMeshBuffers(this.globals.glContext, mesh);
	}

	setColor(color) {
		try { this.color.set(color); }
		catch(e) { throw new Error("Invalid color " + color); }
	}

	/*
	 * Load a json from url and uses it to load the models.
	 * calling loadFromObject method
	 */
	async loadFromJSON(url, classMap) {
		const response = await utils.loadFile(url);
		const json = await response.json();
		return await this.loadFromObject(json, classMap);
	}

	/*
	 * Load meshes and textures from an object with the following structure:
	 * {
	 *   class1 : {
	 *     path   : "path/to/models",
	 *     color  : [ 255, 255, 0 ], // optional default color
	 *     models : [ { mesh : "rocket1/mesh.obj", texture : "rocket1/texture.png" }, ... ]
	 *   },
	 *   class2 : {
	 *     ...
	 *   },
	 *   ...
	 * }
	 * classMap maps the models classes to a javascript class
	 * { "class1" : RendererType1, "class2" : ..., ... }
	 *
	 * Returns a promise that resolves to an object with the following structure:
	 * {
	 *   class1 : [ RendererType1, ... ],
	 *   class2 : [ ... ],
	 *   ...
	 * }
	 */
	async loadFromObject(obj, classMap) {
		const loaded = {};
		for(const key in classMap) {
			const type = obj[key];
			loaded[key] = Promise.all(type.models.map(
				({ mesh, texture, color }) =>
					this.createRenderer(classMap[key], mesh, texture, type.path, color || type.color)
			));
		}
		for(const key in classMap)
			loaded[key] = await loaded[key];
		return loaded;
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
			this.color);
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
