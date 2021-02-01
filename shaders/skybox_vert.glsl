#version 300 es
uniform mat4 u_viewDirProjInv;

vec4[] position = vec4[](
	vec4(-1,-1, 1, 1),
	vec4( 1,-1, 1, 1),
	vec4( 1, 1, 1, 1),
	vec4(-1, 1, 1, 1),
	vec4(-1,-1,-1, 1),
	vec4( 1,-1,-1, 1),
	vec4( 1, 1,-1, 1),
	vec4(-1, 1,-1, 1)
);

int[] index = int[](
	1, 3, 2,
	1, 4, 3,
	5, 6, 7,
	5, 7, 8,
	6, 3, 7,
	6, 2, 3,
	5, 8, 4,
	5, 4, 1,
	8, 7, 3,
	8, 3, 4,
	2, 6, 5,
	2, 5, 1
);

out vec4 v_pos;

void main() {
	vec4 pos = position[index[gl_VertexID]];
	v_pos = u_viewDirProjInv * pos;
	gl_Position = pos;
}
