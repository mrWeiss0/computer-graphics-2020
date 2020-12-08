#version 300 es
#define MAX_LIGHTS 4

uniform mat4 u_projmat;

//layout(std140) uniform u_lights {
//	uint u_lcount;
//	vec3 u_lpos[MAX_LIGHTS];
//};

in  vec4 a_position;
in  vec3 a_normal;
in  vec2 a_texcoord;
in  mat4 a_objmat;
in  mat3 a_normmat;

out vec3 v_pos;
out vec3 v_norm;

void main() {
	v_norm = a_normmat * a_normal;
	v_pos  = vec3(a_objmat * a_position);
	gl_Position = u_projmat * a_objmat * a_position;
}
