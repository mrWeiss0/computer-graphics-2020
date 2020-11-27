#version 300 es

uniform mat4 u_wvp;
uniform mat3 u_wti;

in vec4 a_position;
in vec3 a_color;
in vec3 a_normal;

out vec3 v_color;
out vec3 v_normal;

void main() {
	gl_Position = u_wvp * a_position;
	v_color = a_color;
	v_normal = u_wti * normalize(a_normal);
}
