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

uniform float u_rowHeight;
uniform float u_colWidth;

uniform int u_numFreqs;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

in float a_db;
in int a_index;

out float v_intensity;

float normalizeDb(float db) {
  // float  = min(u_maxDb, max(u_minDb, db));
  float clamped = clamp(db, u_minDb, u_maxDb);

  return (clamped - u_minDb) / (u_maxDb - u_minDb);
}

void main() {
  int col = a_index / u_numFreqs;
  // int row = a_index % u_numFreqs;
  int row = a_index; // % u_numFreqs;

  float x = float(col) * u_colWidth;
  float y = float(row) * u_rowHeight;

  vec2 position = vec2(x, y);

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  // gl_Position = vec4(x, y, 0, 0);
  gl_PointSize = 100.0;

  v_intensity = normalizeDb(a_db);
}
