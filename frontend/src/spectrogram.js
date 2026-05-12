// import resizeCanvas from "./util.js";
import webgl from "./webgl.js";
//
const fill = getComputedStyle(document.documentElement).getPropertyValue("--fill-color").trim();
const track = getComputedStyle(document.documentElement).getPropertyValue("--track-color").trim();

const dpr = window.devicePixelRatio || 1;

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = width * dpr;
  canvas.height = height * dpr;
}

function updateSlider({ input, display, units, onUpdate }) {
  const max = input.max;
  const min = input.min;
  const pct = ((input.value - min) / (max - min)) * 100;
  display.textContent = input.value + units;
  input.style.background = `linear-gradient(90deg, ${fill} ${pct}%, ${track} ${pct}%)`;

  onUpdate(input.value);
}

// const MAX_DB = -20;
// const MIN_DB = -80;
// const MAX_FREQ = 6e3;

function gradient(t, colorA, colorB) {
  const r = Math.round(colorA[0] + t * (colorB[0] - colorA[0]));
  const g = Math.round(colorA[1] + t * (colorB[1] - colorA[1]));
  const b = Math.round(colorA[2] + t * (colorB[2] - colorA[2]));
  return `rgb(${r}, ${g}, ${b})`;
}

export class Spectrogram {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error("Unable to get spectrogram canvas");
    }

    this.gl = this.canvas.getContext("webgl2");

    // this.observer = new ResizeObserver(() => {
    //   resizeCanvas(this.canvas);
    // });

    this.observer = new ResizeObserver((entries) => {
      const canvas = this.canvas;

      for (const entry of entries) {
        const width =
          entry.devicePixelContentBoxSize?.[0].inlineSize ??
          entry.contentBoxSize[0].inlineSize * dpr;
        const height =
          entry.devicePixelContentBoxSize?.[0].blockSize ??
          entry.contentBoxSize[0].blockSize * dpr;

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);

        // update the WebGL viewport to match
        this.gl.viewport(0, 0, canvas.width, canvas.height);
      }
    });

    this.observer.observe(this.canvas);

    // this.ctx = this.canvas.getContext("2d");

    const { width, height } = this.canvas.getBoundingClientRect();
    this.width = width;
    this.height = height;

    // px per second
    this.scale = 20;

    this.head = 0;

    this.initializeSliders();
  }

  setUniforms() {
    const gl = this.gl;
    const u = this.uniforms;

    gl.uniform1f(u.minDb, this.MIN_DB);
    gl.uniform1f(u.maxDb, this.MAX_DB);

    gl.uniform1f(u.maxFreq, this.MAX_FREQ);

    gl.uniform1f(u.rowHeight, this.rowHeight);
    gl.uniform1f(u.colWidth, this.colWidth);
  }

  async initWebGl() {
    const [testVertSrc, testFragSrc] = await Promise.all([
      webgl.loadShader("shaders/test.vert"),
      webgl.loadShader("shaders/test.frag"),
    ]);

    const gl = this.gl;

    const testProgram = webgl.createProgram(gl, testVertSrc, testFragSrc);
    this.gl.useProgram(testProgram);

    const uniforms = ["minDb", "maxDb", "rowHeight", "colWidth", "numFreqs"];
    var u = {};

    uniforms.forEach((name) => {
      const loc = this.gl.getUniformLocation(testProgram, "u_" + name);

      if (!loc) {
        console.warn("Uniform not found:", name);
        return;
      }

      u[name] = loc;
    });
    // for each (const i in uniforms) {
    // }

    this.uniforms = uniforms;
    this.setUniforms();

    let dataData = [
      [0, 0, 50, 1, 0, 0],
      [0.5, 0, 50, 0, 1, 0],
      [0, 0, 100, 0, 0, 1],
    ];

    // let iSuckAtJS = [];
    //
    // for (data of dataData) {
    //   iSuckAtJS = iSuckAtJS.concat(data);
    // }
    // // console.log(iSuckAtJS);
    // let vertData = new Float32Array(iSuckAtJS);
    //
    const vertBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 1000000, gl.STATIC_DRAW);

    const indexLoc = gl.getAttribLocation(testProgram, "a_index");
    const dbLoc = gl.getAttribLocation(testProgram, "a_db");

    console.log("indexLoc:", indexLoc, "dbLoc:", dbLoc);

    // math is hard
    const STRIDE = 1 * 4 + 1 * 4;

    // wow that I \/  is dumb
    gl.vertexAttribIPointer(indexLoc, 1, gl.INT, false, STRIDE, 0);
    gl.vertexAttribPointer(dbLoc, 1, gl.FLOAT, false, STRIDE, 1 * 4);

    gl.enableVertexAttribArray(indexLoc);
    gl.enableVertexAttribArray(dbLoc);

    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.initialized = true;
    // draw(dataData.length);
    // gl.drawArrays(gl.POINTS, 0, dataData.length);
  }

  initializeSliders() {
    this.MAX_DB = -20;
    this.MIN_DB = -80;
    this.MAX_FREQ = 22e3;

    const sliderNames = [
      {
        id: "max-db",
        display: "val-max-db",
        units: "dB",
        onUpdate: (x) => (this.MAX_DB = x),
      },
      {
        id: "min-db",
        display: "val-min-db",
        units: "dB",
        onUpdate: (x) => (this.MIN_DB = x),
      },
      {
        id: "max-freq",
        display: "val-max-freq",
        units: "kHz",
        onUpdate: (x) => {
          this.MAX_FREQ = x * 1000;
        },
      },
    ];

    const sliders = sliderNames.map(({ id, display, units, onUpdate }) => ({
      input: document.getElementById(id),
      display: document.getElementById(display),
      units: units,
      onUpdate: onUpdate,
    }));

    sliders.forEach((s) => {
      if (!s.input || !s.display) {
        console.warn("undefined slider");
        return;
      }

      s.input.addEventListener("input", () => updateSlider(s));

      updateSlider(s);
    });
  }

  computeRowHeight() {
    if (!this.opts) {
      console.log("no opts?");
      return;
    }

    const theoreticalMax = this.opts.sampleRate / 2;
    // this is not great, i think we should go back
    const maxFreq = Math.min(this.MAX_FREQ, theoreticalMax);
    const analyzedFreqs = this.opts.fftSize * (maxFreq / theoreticalMax);
    this.rowHeight = this.height / analyzedFreqs;
  }

  setAttribArray(data) {
    const gl = this.gl;
    const buf = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    this.attribArray = buf;
  }

  loadSong(data, opts) {
    // this.PCM = song;
    this.data = data;
    this.opts = opts;
    // spacing is seconds between fft
    this.fft_spacing = opts.fftSpacing;

    this.colWidth = opts.fftSpacing * this.scale;

    // let attribArray = data.map((bins) => {
    //   let withIndicies = [];
    //   for (const index in bins) {
    //     withIndicies += [index, bins[index]];
    //   }
    //
    //   return withIndicies;
    // });

    const withIndicies = [];
    console.log("huh", data[0][0]);
    var index = 0;
    for (const bins of data) {
      for (const db of bins) {
        // withIndicies += [index, bins[index]];
        withIndicies.push(Math.round(index));
        withIndicies.push(db);
        index++;
      }
    }

    console.log(withIndicies.length);

    this.setAttribArray(withIndicies);
  }

  colorGradient(t) {
    if (t > 1) {
      t = 1;
    }

    const colors = [
      [0, 0, 0],
      [128, 0, 128],
      [255, 255, 0],
    ];

    const segments = colors.length - 1;
    const scaled = t * segments;
    const i = Math.min(Math.floor(scaled), segments - 1);
    const localT = scaled - i;
    return gradient(localT, colors[i], colors[i + 1]);
  }

  normalizeDb(db) {
    db = Math.min(this.MAX_DB, Math.max(this.MIN_DB, db));

    return (db - this.MIN_DB) / (this.MAX_DB - this.MIN_DB);
  }

  drawColumn(x, freqBins) {
    let index = 0;
    let y = this.height;

    while (y >= 0 && index < freqBins.length) {
      const intensity = freqBins[index];

      const normalized = this.normalizeDb(intensity);

      if (intensity) {
        this.ctx.fillStyle = this.colorGradient(normalized);
        this.ctx.fillRect(x, y, this.colWidth, -this.rowHeight);
      }

      y -= this.rowHeight;
      index++;
    }
  }

  draw() {
    if (!this.data) {
      console.warn("No data?");
    }

    this.computeRowHeight();

    console.log(this.MAX_DB, this.MIN_DB, this.MAX_FREQ);

    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.attribArray);
    gl.drawArrays(gl.POINTS, 0, 10000);
    return;

    const { width, height } = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, width, height);

    let x = 0;
    let index = 0;

    console.log("drawing");
    while (x < this.width && index < this.data.length) {
      this.drawColumn(x, this.data[index]);
      x += this.colWidth;
      index++;
    }

    console.log("drew");

    // this.ctx.clearRect(0, 0, 500, 500);
    //
    // this.ctx.fillStyle = "blue";
    // this.ctx.fillRect(0, 0, 100, 100);
  }
}
