#version 300 es
precision highp float;

in  vec3 v_pos;
in  vec3 v_norm;

out vec4 outColor;

void main() {
	outColor = vec4(normalize(v_norm) / 2. + .5, 1);
}
