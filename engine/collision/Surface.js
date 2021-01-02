export class Surface {
	constructor(a, b, c) {
		this._vert = [a, b, c];
		this._update();
	}

	get a() {
		return this._vert[0];
	}

	get b() {
		return this._vert[1];
	}

	get c() {
		return this._vert[2];
	}

	get vertices() {
		return this._vert;
	}

	get normal() {
		return this._n
	}

	get offset() {
		return this._oo;
	}

	transform(matrix) {
		for(let i = 0; i < 3; i++) {
			const v = matrix.mul(new Vec4(this._vert[i], 1));
			this._vert[i].x = v.x;
			this._vert[i].y = v.y;
			this._vert[i].z = v.z;
		}
		this._update();
	}

	_update() {
		this._n  =  this.b.sub(this.a).cross(this.c.sub(this.a));
		this._oo = -this._n.mul(this.a);
	}
}
