import wasm from "./main.go";

import { Spectrogram } from "./spectrogram.js";
// import resizeCanvas from "./util.js";

console.log(await wasm.testString());

// const sliders = [
//   { input: document.getElementById("s1"), display: document.getElementById("val1") },
//   { input: document.getElementById("s2"), display: document.getElementById("val2") },
//   { input: document.getElementById("s3"), display: document.getElementById("val3") },
// ];

// const observer = new ResizeObserver(() => {
//   const ctx = resizeCanvas(canvas);
//   // redraw here
// });

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
    this.playButton = document.getElementById("playButton");
    this.pauseButton = document.getElementById("pauseButton");
    this.analyzeButton = document.getElementById("analyzeButton");
    this.audioInfo = document.getElementById("audioInfo");
    this.audioDetails = document.getElementById("audioDetails");
    this.frequencyCanvas = document.getElementById("frequencyCanvas");
    this.frequencyCtx = this.frequencyCanvas.getContext("2d");

    this.spectrogram = new Spectrogram("spectrogram");
    this.spectrogram.initWebGl();
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
      this.opts = songOpts;

      let analyzed = await wasm.analyzeSong(PCM, songOpts);
      const spectrogramData = analyzed.theGram.data;

      this.spectrogram.loadSong(spectrogramData, songOpts);

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
    // this.visualizeFrequency();

    // Play for analysis
    source.start();
    source.onended = () => {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    };
  }
}

// Initialize the analyzer when the page loads
// document.addEventListener("DOMContentLoaded", () => {
//   new AudioAnalyzer();
// });
//

let analyzer = new AudioAnalyzer();

const button = document.getElementById("redraw");

button.addEventListener("click", () => {
  analyzer.spectrogram.draw();
});
