#version 300 es
#define MAX_LIGHTS 4

uniform mat4 u_projmat;
uniform mat4 u_viewmat;

layout(std140) uniform u_daylight {
	vec3 u_ambient_light;
	vec3 u_directional_light;
	vec3 u_directional_dir;
};

uniform float ON_A;
uniform float ON_B;

//layout(std140) uniform u_lights {
//	uint u_lcount;
//	vec3 u_lpos[MAX_LIGHTS];
//};

in  vec4 a_position;
in  vec3 a_normal;
in  vec2 a_texcoord;
in  mat4 a_objmat;
in  mat3 a_normmat;

out vec2 v_texcoord;
out vec4 v_light;

void main() {
	gl_Position = u_projmat * a_objmat * a_position;

	vec3 normal   = normalize(a_normmat * a_normal);
	vec3 position = vec3(a_objmat * a_position);
	vec3 light    = mat3(u_viewmat) * normalize(u_directional_dir);
	vec3 eye      = normalize(-position);
	float cosLight  = dot(normal, light);
	float cosEye    = dot(normal, eye);
	float cosAlpha  = min(cosLight, cosEye);
	float cosBeta   = max(cosLight, cosEye);
	float ON_G      = max( 0., dot(
		normalize(light - cosLight * normal),
		normalize(  eye -   cosEye * normal)
	));
	
	float ON_light = ON_A + ON_B * ON_G * sqrt(1. - cosAlpha * cosAlpha) * sqrt(1. - cosBeta * cosBeta) / cosBeta;
	v_light = vec4(u_directional_light * ON_light * clamp(cosLight, 0., 1.) + u_ambient_light, 1.);

	v_texcoord  = a_texcoord;
}
