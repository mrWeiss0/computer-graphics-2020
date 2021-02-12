#version 300 es
precision highp float;

in  vec2 v_texcoord;
in  vec4 v_light;

uniform sampler2D tex;

out vec4 outColor;

void main() {
	outColor = clamp(v_light * texture(tex, v_texcoord), 0., 1.);
}
