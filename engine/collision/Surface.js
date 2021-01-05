export class Surface {
	constructor(a, b, c) {
		this._vert = [a, b, c];
		this._n  = b.sub(a).cross(c.sub(a)).normalized();
		this._oo = -this._n.mul(this.a);
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
}
