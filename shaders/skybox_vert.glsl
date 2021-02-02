#version 300 es
uniform mat4 u_viewDirProjInv;

vec4[] position = vec4[](
	vec4(-1,-1, 0, 1),
	vec4( 1,-1, 0, 1),
	vec4( 1, 1, 0, 1),
	vec4(-1,-1, 0, 1),
	vec4( 1, 1, 0, 1),
	vec4(-1, 1, 0, 1)
);

out vec4 v_pos;

void main() {
	vec4 pos = position[gl_VertexID];
	v_pos = u_viewDirProjInv * pos;
	gl_Position = pos;
}
