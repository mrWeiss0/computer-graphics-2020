import {utils} from "./index.js";
const Vec3 = utils.matrix.Vec3;
const Vec4 = utils.matrix.Vec4;
const Mat3 = utils.matrix.Mat3;

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

    static fromScreen(xNormScreen, yNormScreen, globals){
        const viewMatrixInv = globals.viewMatrix.inverse();
        const projMatrixInv = globals.projMatrix.inverse();
    
        const cameraPosWorld = new Vec3(globals.camera._pos);
        const cameraDirView = projMatrixInv.mul(new Vec4(xNormScreen, yNormScreen, 1, 1));
        const cameraDirWorld = new Mat3(viewMatrixInv).mul(new Vec3(cameraDirView.x,cameraDirView.y,cameraDirView.z));

        return new this(cameraPosWorld, cameraDirWorld);
    }
    
    pointFromT(t){
        return new Vec3(
            this._point.get(0)+t*this._dir.get(0),
            this._point.get(1)+t*this._dir.get(1),
            this._point.get(2)+t*this._dir.get(2));
    }

}