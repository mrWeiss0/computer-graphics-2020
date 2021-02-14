import {utils, BillboardRenderer} from "./index.js";
const identity = utils.matrix.Mat4.identity;

export class ClipBillboardRenderer extends BillboardRenderer {
	get viewMatrix() {
		return identity;
	}

	get projMatrix() {
		return identity;
	}
}
