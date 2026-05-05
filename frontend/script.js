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
    this.waveformCanvas = document.getElementById("waveformCanvas");
    this.frequencyCtx = this.frequencyCanvas.getContext("2d");
    this.waveformCtx = this.waveformCanvas.getContext("2d");
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

      spectrogram = makeSpectrogram(this.audioBuffer.getChannelData(0));

      // Display audio information
      this.displayAudioInfo(file, this.audioBuffer);

      // Enable controls
      this.playButton.disabled = false;
      this.analyzeButton.disabled = false;

      // Draw initial waveform
      this.drawWaveform();
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
      console.log(dataArray);

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

  drawWaveform() {
    if (!this.audioBuffer) return;

    const canvas = this.waveformCanvas;
    const ctx = this.waveformCtx;
    const data = this.audioBuffer.getChannelData(0); // Get first channel

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(0, 255, 0)";
    ctx.beginPath();

    const sliceWidth = canvas.width / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] * 0.5;
      const y = ((v + 1) * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();
  }
}

// Initialize the analyzer when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new AudioAnalyzer();
});
