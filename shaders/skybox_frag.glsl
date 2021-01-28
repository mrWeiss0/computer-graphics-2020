#version 300 es
precision highp float;

uniform samplerCube u_skybox;

in vec4 v_pos;

out vec4 outColor;

void main() {
	outColor = texture(u_skybox, v_pos.xyz);
}
