#version 300 es

vec2[] position = vec2[](
	vec2( 0, 1),
	vec2(.5, 1),
	vec2( 1, 1),
	vec2( 0,.5),
	vec2(.5,.5),
	vec2( 1,.5),
	vec2( 0, 0),
	vec2(.5, 0),
	vec2( 1, 0)
);

int[] index = int[](
	0, 6, 2,
	2, 6, 8
);

uniform vec3 u_camRight;
uniform vec3 u_camUp;
uniform mat4 u_pv;
uniform vec2 framesize;
uniform int anchor;

in  vec3 target;
in  vec2 size;
in  vec2 frameoffset;

out vec2 v_texcoord;

void main() {
	vec2 vertex = position[index[gl_VertexID]];
	v_texcoord = vertex * framesize + frameoffset;

	vertex -= position[anchor];
	
    gl_Position = u_pv * vec4(
		target +
		u_camRight * vertex.x * size.x +
    	u_camUp    * vertex.y * size.y,
	1.);
}
