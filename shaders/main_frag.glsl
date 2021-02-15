#version 300 es
precision highp float;

in  vec2 v_texcoord;
in  vec4 v_light;
in  vec4 v_light_spe;

uniform sampler2D tex;
uniform vec3  u_reflect;

out vec4 outColor;

void main() {
	outColor = v_light * texture(tex, v_texcoord) + v_light_spe * vec4(u_reflect, 1);
}
