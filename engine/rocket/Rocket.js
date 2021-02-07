import {utils} from "./index.js";
const LinkedList = utils.LinkedList;
const matrix = utils.matrix;

const PITCH_ANI = .05;
const TERM_VEL  = -2.5;

/*
 * Rocket class
 *
 * Stores the current position, velocity and acceleration
 * and implements movement update logic and world matrix evaluation.
 *
 * Rockets have a given trajectory to follow
 * from a starting position to a target.
 * When launched, the rocket will start accelerating
 * for a period of time, then it will follow a parabolic trajectory.
 * The vertical accelleration and the maximum height reached
 * are specified with the trajectory.
 * The time to live until target is reached is stored internally,
 * but the rocket may collide before or after this time reaches zero.
 */
export class Rocket extends LinkedList {
	/*
	 * Create a rocket
	 */
	constructor(globals, renderer) {
		super();
		this._globals  = globals;
		this._renderer = renderer;
		this._pos      = new matrix.Vec3(0);
		// Rotation around its axis
		this._roll     = 0;
		this._rspe     = 0;
		// Vec2 direction on XZ plane for decomposing velocity and acceleration 
		this._hdir     = new matrix.Vec2(0, 0);
		// Propulsion timeout
		this._timeout  = 0;
		// Time to live before reaching target
		this._ttl      = 0;
		// Acceleration and velocity XZ and Y components
		this._hvacc    = new matrix.Vec2(0, 0);
		this._hvvel    = new matrix.Vec2(0, 0);
		this._pitch    = - Math.PI / 2;
		// Horizontal and vertical scale
		this._hvscale  = [1, 1];
		this._wrldMat  = null;
		this._launched = false;
		this._deleted  = false;
	}

	/* Set the rocket current position, return this */
	position(x, y, z) {
		this._pos.x = +x;
		this._pos.y = +y;
		this._pos.z = +z;
		return this;
	}

	/*
	 * Set the trajectory that starts with `vacc` vertical acceleration,
	 * goes from current position to `target` and reaches `hmax` height in flight.
	 * Return this.
	 * 
	 * `target`   : target position Vec3 or Array
	 * `hmax`     : maximum height of trajectory.
	 *              Must hold `hmax >=   target.y`
	 *              and       `hmax >  position.y`
	 * `vacc`     : vertical acceleration of propulsion
	 *              determines the time of flight
	 */
	trajectory(target, hmax, vacc) {
		const g = this._globals.gravity;
		if(Array.isArray(target))
			target = new matrix.Vec3(target);
		target = target.sub(this._pos);
		hmax -= this._pos.y;
		if(hmax <= 0 || hmax < target.y)
			throw new Error("Invalid trajectory height");
		const htg      = new matrix.Vec2(target.z, target.x);
		this._hdir     = htg.normalized();
		const aag      = vacc * (vacc + g);
		this._timeout  = Math.sqrt(2 * g * hmax / aag);
		const aag1yh   = aag * (1 - target.y / hmax);
		const r_aag1yh = Math.sqrt(aag1yh);
		this._ttl      = this._timeout * (vacc + g + r_aag1yh) / g ;
		const a2g      = vacc * 2 + g;
		const ifzero   = a2g - 2 * r_aag1yh;
		const accx     = ifzero ? ifzero / (a2g**2 - 4 * aag1yh) : 1 / (2 * a2g);
		this._hvacc.x  = htg.modulo / hmax * aag * accx;
		this._hvacc.y  = vacc + g;
		return this;
	}

	/* Set the rocket size scale, return this */
	scale(hs, vs=hs) {
		hs = +hs;
		vs = +vs;
		if(isNaN(hs) || isNaN(vs))
			throw new Error("Invalid scale factor");
		this._hvscale = [+hs, +vs];
		return this;
	}
	
	/* Start movement update */
	launch() {
		this._launched = true;
	}
	
	/* Get if the rocket is flagged for deletion */
	get deleted() {
		return this._deleted;
	}
	
	/* Get the status of the rocket propulsion light */
	get lightOn() {
		return this._launched && this._timeout > 0;
	}
	
	/* Get the world transform matrix */
	get worldMatrix() {
		if(this._wrldMat == null)
			this._wrldMat = matrix.Mat4.transl(...this._pos)
			           .mul(this._pitchyaw)
			           .mul(matrix.Mat4.rotZ(this._roll))
			           .mul(matrix.Mat4.scale(this._hvscale[0], this._hvscale[0], this._hvscale[1]));
		return this._wrldMat;
	}

	/* Update movement */
	update(dt) {
		if(!this._launched)
			return;
		const pos_old = [...this._pos];
		const {floor: floor0} = this._globals.collision.findFloorHeight(...pos_old);
		// If out of bounds
		if(floor0 == null) {
			this._deleted = true;
			return;
		}
		// Invalid previous matrix
		this._wrldMat = null;
		this._roll += this._rspe * dt;
		this._ttl  -= dt;
		// If timeout elapsed in this delta
		// update first for timeout with propulsion an
		// then turn off propulsion and update for the remaining time
		if(this._timeout && this._timeout < dt) {
			this._updateAccel(this._timeout);
			dt -= this._timeout;
			this._timeout = 0;
			this._hvacc.x = this._hvacc.y = 0;
		}
		else
			this._timeout -= dt;
		this._updateAccel(dt);
		const {floor, height} = this._globals.collision.findFloorHeight(...this._pos);
		// If out of bounds
		if(floor == null) {
			this.position(...pos_old);
			this._hvvel.x = 0;
			this._hvacc.x = 0;
			this._hvacc.y = 0;
		}
		// If floor collision warp up
		if(this._pos.y < height) {
			this._pos.y = height;
			this._deleted = true;
		}
		const pitchTarget = - Math.PI / 2 - Math.atan2(...this._hvvel);
			if(Math.abs(pitchTarget - this._pitch) > PITCH_ANI)
				this._pitch += PITCH_ANI * Math.sign(pitchTarget - this._pitch);
			else
				this._pitch = pitchTarget;
	}

	draw() {
		this._renderer.draw(this);
	}
	
	/* Update the accelerating components */
	_updateAccel(dt) {
		const g = this._globals.gravity;
		this._hvvel.x += (this._hvacc.x    ) * dt;
		this._hvvel.y += (this._hvacc.y - g) * dt;
		if(this._hvvel.y < TERM_VEL)
			this._hvvel.y = TERM_VEL;
		const dh = this._hvvel.x * dt - (this._hvacc.x    ) / 2 * dt**2;
		const dv = this._hvvel.y * dt - (this._hvacc.y - g) / 2 * dt**2;
		this._pos.x += dh * this._hdir.y;
		this._pos.z += dh * this._hdir.x;
		this._pos.y += dv;
	}
	
	/*
	 * Get the rotation matrix for pitch and yaw
	 * looking in the direction of the trajectory
	 */
	get _pitchyaw() {
		return matrix.Mat4.rotY([-this._hdir.x, -this._hdir.y]).mul(matrix.Mat4.rotX(this._pitch));
	}
}
