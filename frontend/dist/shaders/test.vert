#version 300 es

// layout(location = 0) uniform float u_minDb;
// layout(location = 1) uniform float u_maxDb;
//
// layout(location = 2) uniform int u_rowHeight;
// layout(location = 3) uniform int u_colWidth;
//
// layout(location = 4) uniform u_numFreqs;
//
// layout(location = 5) attribute float a_db;
// layout(location = 6) attribute int a_index;
//
// layout(location = 7) varying float v_intensity;

uniform float u_minDb;
uniform float u_maxDb;

uniform int u_rowHeight;
uniform int u_colWidth;

uniform int u_numFreqs;

attribute float a_db;
attribute int a_index;

layout varying float v_intensity;

float normalizeDb(db float) {
    // float  = min(u_maxDb, max(u_minDb, db));
    float clamed = clamp(db, u_minDb, u_maxDb);

    return (clamped - u_minDb) / (u_maxDb - u_minDb);
}

void main() {
    int col = a_index / u_numFreqs;
    int row = a_index % u_numFreqs;

    float x = col * u_colWidth;
    float y = row * u_rowHeight;

    gl_Position = vec4(x, y, 0, 0)

    v_intensity = normalizeDb(a_ab)
}
