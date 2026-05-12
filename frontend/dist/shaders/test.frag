#version 300 es

precision mediump float;

uniform vec3 u_colorStart;
uniform vec3 u_colorMid;
uniform vec3 u_colorEnd;

// in v_position;
in v_intensity;

out fragColor;

vec3 gradient(t float, colorA vec3, colorB vec3) {
    float r = colorA[0] + t * (colorB[0] - colorA[0]);
    float g = colorA[1] + t * (colorB[1] - colorA[1]);
    float b = colorA[2] + t * (colorB[2] - colorA[2]);

    return vec3(r, g, b)
}

vec3 multiGradient(t float) {
    // hardcoded gradient for now, might fix later
    mat3x3 colors;
    colors[0] = u_colorStart;
    colors[1] = u_colorMid;
    colors[2] = u_colorEnd;

    // int segments = colors.length - 1;
    float segments = 2.0;
    float scaled = t * segments;

    float i = min(floor(scaled), segments - 1);
    float localT = scaled - i;

    return gradient(localT, colors[i], colors[i + 1]);
}

void main() {
    fragColor = multiGradient(v_intensity)
}
