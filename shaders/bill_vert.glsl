#version 300 es

vec2[] position = vec2[](
	vec2(-.5, .5),
	vec2(  0, .5),
	vec2( .5, .5),
	vec2(-.5,  0),
	vec2(  0,  0),
	vec2( .5,  0),
	vec2(-.5,-.5),
	vec2(  0,-.5),
	vec2( .5,-.5)
);

int[] index = int[](
	0, 6, 2,
	2, 6, 8
);

uniform mat4 u_v;
uniform mat4 u_pv;

in  vec3 target;
in  vec2 size;
in  int  anchor;

out vec2 v_texcoord;

void main() {
	vec2 vertex = position[index[gl_VertexID]];
	v_texcoord = vertex + .5;

	vertex -= position[anchor];
	vec3 camRight = vec3(u_v[0][0], u_v[1][0], u_v[2][0]);
	vec3 camUp    = vec3(u_v[0][1], u_v[1][1], u_v[2][1]);
	
    gl_Position = u_pv * vec4(
		target +
		camRight * vertex.x * size.x +
    	camUp    * vertex.y * size.y,
	1.);
}
