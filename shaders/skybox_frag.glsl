#version 300 es
precision highp float;

uniform samplerCube u_skybox;

struct dir_light {
	vec3 color;
	vec3 direction;
};

layout(std140) uniform u_daylight {
	vec3 u_ambient_light;
	dir_light u_sun_light;
};

in vec4 v_pos;

out vec4 outColor;

void main() {
	vec4 light = vec4((u_ambient_light + u_sun_light.color), 1.);
	outColor = clamp(light * texture(u_skybox, v_pos.xyz), 0., 1.);
}
