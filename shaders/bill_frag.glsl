#version 300 es
precision highp float;

in  vec2 v_texcoord;
flat in int v_anchor;

uniform sampler2D tex;

out vec4 outColor;

void main() {
	outColor = texture(tex, v_texcoord);
}
