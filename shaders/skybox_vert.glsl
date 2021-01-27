#version 300 es
uniform mat4 u_cameraRot;

in vec4 a_position;

out vec4 v_pos;

void main() {
	v_pos =  a_position;
	gl_Position = a_position;
}
