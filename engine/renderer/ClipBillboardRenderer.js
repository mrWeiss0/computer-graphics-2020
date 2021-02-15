import {utils, BillboardRenderer} from "./index.js";
const Mat4 = utils.matrix.Mat4;

export class ClipBillboardRenderer extends BillboardRenderer {
	get viewMatrix() {
		return Mat4.identity;
	}

	get projMatrix() {
		return Mat4.ortho(this._globals.ar, 1, -1, 1);
	}
}
