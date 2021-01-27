#version 300 es
precision highp float;

uniform samplerCube u_skybox;
uniform mat4 u_cameraRot;

in vec4 v_pos;

out vec4 outColor;

void main() {
	outColor = texture(u_skybox, (u_cameraRot*v_pos).xyz);
}
