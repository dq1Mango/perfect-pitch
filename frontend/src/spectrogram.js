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
  const ctx = canvas.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
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

    this.gl = this.canvas.getContext("webgl");

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

    this.ctx = this.canvas.getContext("2d");

    const { width, height } = this.canvas.getBoundingClientRect();
    this.width = width;
    this.height = height;

    // px per second
    this.scale = 20;

    this.head = 0;

    this.initializeSliders();
  }

  async initWebGl() {
    const [testVertSrc, testFragSrc] = await Promise.all([
      webgl.loadShader("shaders/test.vert"),
      webgl.loadShader("shaders/test.frag"),
    ]);
    //
    // const simulationProgram = gl.createProgram();
    //
    // const simVert = compileShader(gl, gl.VERTEX_SHADER, simVertSrc);
    // gl.attachShader(simulationProgram, simVert);

    //const renderProgram = createProgram(gl, renderVertSrc, renderFragSrc);
    //

    // testing

    const testProgram = createProgram(gl, testVertSrc, testFragSrc);
    gl.useProgram(testProgram);

    const aPosition = 0;
    const aSize = 1;
    const aColor = 2;

    let dataData = [
      [0, 0, 50, 1, 0, 0],
      [0.5, 0, 50, 0, 1, 0],
      [0, 0, 100, 0, 0, 1],
    ];

    let iSuckAtJS = [];

    for (data of dataData) {
      iSuckAtJS = iSuckAtJS.concat(data);
    }
    // console.log(iSuckAtJS);
    let vertData = new Float32Array(iSuckAtJS);

    const vertBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.STATIC_DRAW);

    const STRIDE = 2 * 4 + 1 * 4 + 3 * 4;

    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, STRIDE, 0);
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, STRIDE, 2 * 4);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, STRIDE, 2 * 4 + 4);

    gl.enableVertexAttribArray(aPosition);
    gl.enableVertexAttribArray(aColor);
    gl.enableVertexAttribArray(aSize);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    initialized = true;
    draw(dataData.length);
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

  loadSong(data, opts) {
    // this.PCM = song;
    this.data = data;
    this.opts = opts;
    // spacing is seconds between fft
    this.fft_spacing = opts.fftSpacing;

    this.colWidth = opts.fftSpacing * this.scale;
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
