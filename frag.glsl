#version 300 es

precision highp float;

//uniform sampler2D u_image;
uniform vec3 u_ldir;

in vec3 v_color;
in vec3 v_normal;
//in vec2 v_texCoord;

out vec4 outColor;

void main() {
	//vec2 text = v_texCoord * vec2(1, -1) + vec2(0, 1);
	//vec4 blur = texture(u_image, text);
	//outColor = vec4(v_color, 1);
	vec3 light = clamp(dot(u_ldir, normalize(v_normal)), 0., 1.) * vec3(1, 1, 1);
	outColor = vec4(clamp(v_color * light, 0., 1.), 1);
}
