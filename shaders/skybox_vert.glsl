#version 300 es
uniform mat4 u_viewDirProjInv;

in vec4 a_position;

out vec4 v_pos;

void main() {
	v_pos = u_viewDirProjInv * a_position;
	gl_Position = a_position;
}
