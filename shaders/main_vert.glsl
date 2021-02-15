#version 300 es
#define MAX_POINT_LIGHTS 50

uniform mat4 u_projmat;
uniform mat4 u_viewmat;

uniform float u_ON_A;
uniform float u_ON_B;
uniform vec3  u_reflect;
float decay_base = 100.;

struct dir_light {
	vec3 color;
	vec3 direction;
};

layout(std140) uniform u_daylight {
	vec3 u_ambient_light;
	dir_light u_sun_light;
};

struct point_light {
	vec3 color;
	vec4 position;
};

layout(std140) uniform u_lights {
	uint u_point_light_count;
	point_light u_point_light[MAX_POINT_LIGHTS];
};

in  vec4 a_position;
in  vec3 a_normal;
in  vec2 a_texcoord;
in  mat4 a_objmat;
in  mat3 a_normmat;

out vec2 v_texcoord;
out vec4 v_light;
out vec4 v_light_spe;

void main() {
	gl_Position = u_projmat * a_objmat * a_position;

	vec3 light    = u_ambient_light;
	vec3 position = vec3(a_objmat * a_position);
	vec3 normal   = normalize(a_normmat * a_normal);

	vec3 lightDir = normalize(mat3(u_viewmat) * u_sun_light.direction);
	vec3 eyeDir = normalize(-position);
	
	/* Sun light Oren Nayar */
	{
		float cosLight = dot(normal, lightDir);
		float ON_coeff = u_ON_A;
		if(u_ON_B != 0.) {
			float cosEye = dot(normal, eyeDir);
			float ON_G   = max( 0., dot(
				normalize(lightDir - cosLight * normal),
				normalize(  eyeDir -   cosEye * normal)
			));
			if(ON_G != 0.) {
				float cosAlpha = min(cosLight, cosEye);
				float cosBeta  = max(cosLight, cosEye);
				ON_coeff += u_ON_B * ON_G * sqrt(1. - cosAlpha * cosAlpha) * sqrt(1. - cosBeta * cosBeta) / cosBeta;
			}
		}
		light += u_sun_light.color * ON_coeff * clamp(cosLight, 0., 1.);
	}

	/* Sun light reflects */
	v_light_spe = vec4(0, 0, 0, 1.);
	if(length(u_reflect) > 0.) {
		vec3 refl = -reflect(lightDir, normal);
		v_light_spe.rgb = u_sun_light.color * pow(clamp(dot(eyeDir, refl), 0., 1.), 64.);
	}

	/* Point lights Lambert */
	for(uint i = 0u; i < u_point_light_count; i++) {
		point_light point_light_i = u_point_light[i];
		vec3  lx        = vec3(u_viewmat * point_light_i.position) - position;
		float cosLight  = dot(normal, normalize(lx));
		float lightDist = length(lx);
		//if(lightDist < decay_base * 2.)
			light += point_light_i.color * (decay_base * decay_base) / (lightDist * lightDist) * clamp(cosLight, 0., 1.);
	}

	v_light.rgb = light;
	v_light.a   = 1.;

	v_texcoord  = a_texcoord;
}
