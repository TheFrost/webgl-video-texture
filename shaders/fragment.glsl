precision mediump float;

uniform sampler2D u_Sampler;
uniform vec2 u_UserCoords;

varying vec2 v_TexCoord;

void main() {
	vec4 color = texture2D(u_Sampler, v_TexCoord);
	float avg = color.r*0.3 + color.g*0.6 + color.b*0.1;
	
	if (avg > 0.019) {
		color = color * vec4(u_UserCoords, u_UserCoords.x / u_UserCoords.y, 1.0);
	}

	gl_FragColor = color;
}