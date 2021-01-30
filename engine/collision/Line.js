import {utils} from "./index.js";
const Vec3 = utils.matrix.Vec3;

export class Line {
	constructor(point, dir) {
        this._point = point;
        this._dir = dir;
    }
    
    get x0() {
		return this._point.get(0);
	}
	get y0() {
		return this._point.get(1);
	}
	get z0() {
		return this._point.get(2);
    }  
    get point(){
        return this._point
    }

	get a() {
		return this._dir.get(0);
	}
	get b() {
		return this._dir.get(1);
	}
	get c() {
        return this._dir.get(2);
    }
	get dir() {
		return this._dir;
    }
    
    pointFromT(t){
        return new Vec3(
            this._point.get(0)+t*this._dir.get(0),
            this._point.get(1)+t*this._dir.get(1),
            this._point.get(2)+t*this._dir.get(2));
    }
}