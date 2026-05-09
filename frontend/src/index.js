import wasm from "./main.go";

console.log(await wasm.testString());

// const go = new Go();
// WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then((result) => {
//   go.run(result.instance);
//
//   testing();
//   //result.instance.exports.Init()
// });
//
let spectrogram;
let index = 0;

function gradient(t, colorA, colorB) {
  const r = Math.round(colorA[0] + t * (colorB[0] - colorA[0]));
  const g = Math.round(colorA[1] + t * (colorB[1] - colorA[1]));
  const b = Math.round(colorA[2] + t * (colorB[2] - colorA[2]));
  return `rgb(${r}, ${g}, ${b})`;
}

function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

// const observer = new ResizeObserver(() => {
//   const ctx = resizeCanvas(canvas);
//   // redraw here
// });

class Spectrogram {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error("Unable to get spectrogram canvas");
    }

    this.observer = new ResizeObserver(() => {
      resizeCanvas(this.canvas);
    });

    this.observer.observe(this.canvas);

    this.ctx = this.canvas.getContext("2d");

    const { width, height } = this.canvas.getBoundingClientRect();
    this.width = width;
    this.height = height;

    // px per second
    this.scale = 20;

    this.head = 0;
  }

  loadSong(data, fft_spacing) {
    // this.PCM = song;
    this.data = data;
    // this.opts = opts;
    // spacing is seconds between fft
    this.fft_spacing = fft_spacing;

    this.colWidth = fft_spacing * this.scale;
    this.rowHeight = 500 / data[0].length;
    console.log(data[0].length);
  }

  colorGradient(t) {
    if (t > 1) {
      t = 1;
    }

    const colors = [
      [0, 0, 0],
      [128, 0, 128],
      [255, 0, 0],
    ];

    const segments = colors.length - 1;
    const scaled = t * segments;
    const i = Math.min(Math.floor(scaled), segments - 1);
    const localT = scaled - i;
    return gradient(localT, colors[i], colors[i + 1]);
  }

  drawColumn(x, freqBins) {
    let index = 0;
    let y = this.height;

    while (y >= 0 && index < freqBins.length) {
      const intensity = freqBins[index];

      if (x > 10 && x < 15) {
        console.log(y, intensity);
      }
      // console.log(y, index);
      // console.log(intensity);

      if (intensity) {
        this.ctx.fillStyle = this.colorGradient(intensity);
        this.ctx.fillRect(x, y, this.colWidth, -this.rowHeight);
      }

      y -= this.rowHeight;
      index++;
    }
  }

  draw() {
    let x = 0;
    let index = 0;

    while (x < this.width && index < this.data.length) {
      this.drawColumn(x, this.data[index]);
      x += this.colWidth;
      index++;
      console.log("drawing");
    }

    // this.ctx.clearRect(0, 0, 500, 500);
    //
    // this.ctx.fillStyle = "blue";
    // this.ctx.fillRect(0, 0, 100, 100);
  }
}

class AudioAnalyzer {
  constructor() {
    this.audioContext = null;
    this.audioBuffer = null;
    this.source = null;
    this.analyser = null;
    this.isPlaying = false;
    this.animationId = null;

    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.fileInput = document.getElementById("audioFile");
    console.log(this.fileInput);
    this.playButton = document.getElementById("playButton");
    this.pauseButton = document.getElementById("pauseButton");
    this.analyzeButton = document.getElementById("analyzeButton");
    this.audioInfo = document.getElementById("audioInfo");
    this.audioDetails = document.getElementById("audioDetails");
    this.frequencyCanvas = document.getElementById("frequencyCanvas");
    this.frequencyCtx = this.frequencyCanvas.getContext("2d");

    this.spectrogram = new Spectrogram("spectrogram");
  }

  setupEventListeners() {
    this.fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
    this.playButton.addEventListener("click", () => this.playAudio());
    this.pauseButton.addEventListener("click", () => this.pauseAudio());
    this.analyzeButton.addEventListener("click", () => this.startAnalysis());
  }

  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Initialize audio context if not already done
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();

      // Decode audio data
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // rawPCM = this.audioBuffer.getChannelData(0);

      // let song = newSong(this.audioBuffer.getChannelData(0));
      // song.test();
      // let fft = song.analyze();
      // spectrogram = await wasm.makeSpectrogram(Array.from(this.audioBuffer.getChannelData(0)));
      //

      const PCM = Array.from(this.audioBuffer.getChannelData(0));
      let songOpts = await wasm.newAnalysisOpts();
      console.log(songOpts);

      let analyzed = await wasm.analyzeSong(PCM, songOpts);
      spectrogram = analyzed.theGram.Data;

      console.log(spectrogram);
      this.spectrogram.loadSong(spectrogram, 144 / 44100);

      this.spectrogram.draw();

      // Display audio information
      this.displayAudioInfo(file, this.audioBuffer);

      // Enable controls
      this.playButton.disabled = false;
      this.analyzeButton.disabled = false;
    } catch (error) {
      alert("Error loading audio file: " + error.message);
    }
  }

  displayAudioInfo(file, buffer) {
    const duration = buffer.duration.toFixed(2);
    const sampleRate = buffer.sampleRate;
    const channels = buffer.numberOfChannels;
    const size = (file.size / 1024 / 1024).toFixed(2);

    this.audioDetails.innerHTML = `
                    <p><strong>File:</strong> ${file.name}</p>
                    <p><strong>Duration:</strong> ${duration} seconds</p>
                    <p><strong>Sample Rate:</strong> ${sampleRate} Hz</p>
                    <p><strong>Channels:</strong> ${channels}</p>
                    <p><strong>File Size:</strong> ${size} MB</p>
                `;

    this.audioInfo.classList.remove("hidden");
  }

  playAudio() {
    if (this.isPlaying) return;

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.audioContext.destination);

    this.source.start();
    this.isPlaying = true;
    this.playButton.disabled = true;
    this.pauseButton.disabled = false;

    this.source.onended = () => {
      this.isPlaying = false;
      this.playButton.disabled = false;
      this.pauseButton.disabled = true;
    };
  }

  pauseAudio() {
    if (this.source && this.isPlaying) {
      this.source.stop();
      this.isPlaying = false;
      this.playButton.disabled = false;
      this.pauseButton.disabled = true;
    }
  }

  startAnalysis() {
    if (!this.audioBuffer) return;

    // Create analyser node
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    // Create a new source for analysis
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    // Start analysis visualization
    this.visualizeFrequency();

    // Play for analysis
    source.start();
    source.onended = () => {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    };
  }

  visualizeFrequency() {
    // const bufferLength = this.analyser.frequencyBinCount;
    const bufferLength = 1024;
    // const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.animationId = requestAnimationFrame(draw);

      // this.analyser.getByteFrequencyData(dataArray);
      let dataArray = spectrogram[index];

      const canvas = this.frequencyCanvas;
      const ctx = this.frequencyCtx;

      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const r = barHeight + 25 * (i / bufferLength);
        const g = 250 * (i / bufferLength);
        const b = 50;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      index++;
    };

    draw();
  }
}

// Initialize the analyzer when the page loads
// document.addEventListener("DOMContentLoaded", () => {
//   console.log("ah");
//   new AudioAnalyzer();
// });
//

new AudioAnalyzer();
