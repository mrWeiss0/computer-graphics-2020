import {CollisionGrid} from "./collision/index.js";
import {utils, Terrain, renderer} from "./index.js";
import "./webgl-obj-loader.min.js";
const Mat4 = utils.matrix.Mat4;
const SkyboxRenderer = renderer.SkyboxRenderer;

export class ModelLoader {
	constructor(game) {
		this.game     = game;
		this.meshes   = new Map();
		this.textures = new Map();
		this.color    = new Uint8Array([0, 0, 0, 1]);
	}

	async createRenderer(rendererClass, meshFile, textureFile, path="", color=null) {
		const mesh = await this._getMesh(path + meshFile);
		// init buffers once
		if(mesh.vertexBuffer == null)
			OBJ.initMeshBuffers(this.game.glContext, mesh);
		const rend = new rendererClass(this.game.globals, mesh);
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

	createSkybox(url, faces) {
		const rend = new SkyboxRenderer(this.game.globals);
		rend.texture = this._getCubemap(url, faces);
		return rend;
	}

	createBillboard(rendererClass, textureFile, sheetWidth, frameCount, frameWidth, frameHeigth) {
		const rend = new rendererClass(this.game.globals);
		rend.texture = this._getTexture(textureFile);
		rend.sheetWidth  = sheetWidth;
		rend.frameCount  = frameCount;
		rend.frameWidth  = frameWidth;
		rend.frameHeigth = frameHeigth;
		return rend;
	}

	setColor(color) {
		try { this.color.set(color); }
		catch(e) { throw new Error("Invalid color " + color); }
	}

	/*
	 * Load a json from url and uses it to load the models.
	 * calling loadFromObject method
	 */
	async loadModelsJSON(url) {
		const response = await utils.loadFile(url);
		const json = await response.json();
		const p = this.loadModels(json);
		await this.loadBillboards(json);
		await p;
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
	 */
	async loadModels(obj) {
		const rends = this.game.rends;
		const loaded = {};
		for(const key in rends) {
			const type = obj[key];
			loaded[key] = type.models.map(
				({ mesh, texture, color }) =>
					this.createRenderer(rends[key].clazz, mesh, texture, type.path, color || type.color));
		}
		for(const key in rends) {
			rends[key].list.push(...(await Promise.all(loaded[key])));
		}
	}

	async loadBillboards(obj) {
		const rends = this.game.billboardRends;
		const loaded = {};
		for(const key in rends) {
			const type = obj[key];
			loaded[key] = type.models.map(
				({ texture, sheetWidth, frameCount, frameWidth, frameHeigth }) =>
					this.createBillboard(rends[key].clazz, type.path + texture, sheetWidth, frameCount, frameWidth, frameHeigth))
		}
		for(const key in rends) {
			rends[key].list.push(...(await Promise.all(loaded[key])));
		}
	}

	async loadMapDataJSON(url) {
		const response = await utils.loadFile(url);
		const json = await response.json();
		return await this.loadMapData(json);
	}

	async loadMapData({cellsize, bounds, list, skybox}) {
		const collis = new CollisionGrid(bounds, cellsize);
		for(const {
			modelName, modelIndex,
			collidable, collisMesh,
			position, rotation, order, scale,
		} of list) {
			let transform = Mat4.identity;
			// transform matrix
			if(position != null)
				transform = transform.mul(Mat4.transl(...position));
			if(rotation != null)
				transform = transform.mul(Mat4.euler(rotation, order));
			if(scale != null)
				transform = transform.mul(Mat4.scale(...scale));
			let rend;
			// visible elements
			if(modelName != null) {
				const rendl = this.game.getRendererList(modelName);
				if(rendl == null)
					throw new Error("invalid renderer name " + modelName);
				const rendp = rendl[modelIndex];
				if(rendp == null)
					throw new Error("invalid renderer index " + modelName + "[" + modelIndex + "]");
				rend = rendp;
				this.game.terrains.push(new Terrain(rend, transform));
			}
			// colidable elements
			if(collidable == true) {
				let mesh;
				if(collisMesh != null)
					mesh = await this._getMesh(collisMesh);
				else if(rend != null)
					mesh = rend.mesh;
				else
					throw new Error("No collision mesh given for collidable element");
				collis.addGeometry(mesh, transform);
			}
		}
		this.game.globals.collision = collis;
		this.game.activeSkybox = this.game.skyboxes.get(skybox);
		return;
	}

	async loadSkyboxesJSON(url) {
		const response = await utils.loadFile(url);
		const json = await response.json();
		return await this.loadSkyboxes(json);
	}

	async loadSkyboxes({path, cubemaps}) {
		for(const {name, faces} of cubemaps) {
			const rend = this.createSkybox(path + name, faces);
			this.game.skyboxes.set(name, rend);
		}
	}

	/*
	 * Creates a frenchtoast Mesh from the obj url if not already present
	 * and returns a promise that resolves to the new Mesh
	 */
	async _getMesh(url) {
		url = new URL(url, document.baseURI).pathname;
		if(this.meshes.has(url))
			return this.meshes.get(url);
		const pr = _loadMesh(url);
		this.meshes.set(url, pr);
		return await pr;
	}

	/*
	 * Creates a texture from the image url
	 * if not already present and returns
	 * the texture while the image loads asynchronously
	 */
	_getTexture(url) {
		url = new URL(url, document.baseURI).pathname;
		if(this.textures.has(url))
			return this.textures.get(url);
		const gl = this.game.glContext;
		const tex = gl.createTexture();
		this.textures.set(url, tex);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(
			gl.TEXTURE_2D, 0, gl.RGBA,
			1, 1, 0,
			gl.RGBA, gl.UNSIGNED_BYTE,
			this.color);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this._loadTexture(tex, url);
		return tex;
	}

	async _loadTexture(tex, url) {
		const response = await utils.loadFile(url);
		const blob = await response.blob();
		const img = await createImageBitmap(blob, { imageOrientation: "flipY" });
		const gl = this.game.glContext;
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA,
				gl.RGBA, gl.UNSIGNED_BYTE,
				img);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	_getCubemap(url, faces) {
		url = new URL(url, document.baseURI).pathname;
		if(this.textures.has(url))
			return this.textures.get(url);

		const gl = this.game.glContext;
		const tex = gl.createTexture();
		this.textures.set(url, tex);

		Promise.all(faces.map((face)=>{
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
			gl.texImage2D(
				gl[face.target], 0, gl.RGB,
				1, 1, 0,
				gl.RGB, gl.UNSIGNED_BYTE,
				null); //this.color); 
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
			return this._loadCubeface(tex, url+face.texture, face.target);
		})).then(()=>{
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
		});
		return tex;
	}

	async _loadCubeface(tex, url, target) {
		const response = await utils.loadFile(url);
		const blob = await response.blob();
		const img = await createImageBitmap(blob);
		const gl = this.game.glContext;
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
		gl.texImage2D(
				gl[target], 0, gl.RGB,
				gl.RGB, gl.UNSIGNED_BYTE,
				img);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	}
}

async function _loadMesh(url) {
	const response = await utils.loadFile(url);
	const text = await response.text();
	const mesh = new OBJ.Mesh(text);
	return mesh;
}
