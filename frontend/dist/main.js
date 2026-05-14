/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main.go"
/*!*********************!*\
  !*** ./src/main.go ***!
  \*********************/
() {

eval("{throw new Error(\"Module build failed (from ./node_modules/golang-wasm/src/index.js):\\nError: Could not find GOROOT in environment.\\nPlease try adding this to your script:\\nGOROOT=`go env GOROOT` npm run ...\\n    at module.exports (/home/dq1mango/Coding/Go/perfect-pitch/frontend/node_modules/golang-wasm/src/index.js:16:19)\");\n\n//# sourceURL=webpack:///./src/main.go?\n}");

/***/ },

/***/ "./src/index.js"
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _main_go__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main.go */ \"./src/main.go\");\n/* harmony import */ var _main_go__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_main_go__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _spectrogram_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./spectrogram.js */ \"./src/spectrogram.js\");\n\n\n\n// import resizeCanvas from \"./util.js\";\n\nconsole.log(await _main_go__WEBPACK_IMPORTED_MODULE_0___default().testString());\n\n// const sliders = [\n//   { input: document.getElementById(\"s1\"), display: document.getElementById(\"val1\") },\n//   { input: document.getElementById(\"s2\"), display: document.getElementById(\"val2\") },\n//   { input: document.getElementById(\"s3\"), display: document.getElementById(\"val3\") },\n// ];\n\n// const observer = new ResizeObserver(() => {\n//   const ctx = resizeCanvas(canvas);\n//   // redraw here\n// });\n\nclass AudioAnalyzer {\n  constructor() {\n    this.audioContext = null;\n    this.audioBuffer = null;\n    this.source = null;\n    this.analyser = null;\n    this.isPlaying = false;\n    this.animationId = null;\n\n    this.initializeElements();\n    this.setupEventListeners();\n  }\n\n  initializeElements() {\n    this.fileInput = document.getElementById(\"audioFile\");\n    this.playButton = document.getElementById(\"playButton\");\n    this.pauseButton = document.getElementById(\"pauseButton\");\n    this.analyzeButton = document.getElementById(\"analyzeButton\");\n    this.audioInfo = document.getElementById(\"audioInfo\");\n    this.audioDetails = document.getElementById(\"audioDetails\");\n    this.frequencyCanvas = document.getElementById(\"frequencyCanvas\");\n    this.frequencyCtx = this.frequencyCanvas.getContext(\"2d\");\n\n    this.spectrogram = new _spectrogram_js__WEBPACK_IMPORTED_MODULE_1__.Spectrogram(\"spectrogram\");\n    this.spectrogram.initWebGl();\n  }\n\n  setupEventListeners() {\n    this.fileInput.addEventListener(\"change\", (e) => this.handleFileSelect(e));\n    this.playButton.addEventListener(\"click\", () => this.playAudio());\n    this.pauseButton.addEventListener(\"click\", () => this.pauseAudio());\n    this.analyzeButton.addEventListener(\"click\", () => this.startAnalysis());\n  }\n\n  async handleFileSelect(event) {\n    const file = event.target.files[0];\n    if (!file) return;\n\n    try {\n      // Initialize audio context if not already done\n      if (!this.audioContext) {\n        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();\n      }\n\n      // Read file as array buffer\n      const arrayBuffer = await file.arrayBuffer();\n\n      // Decode audio data\n      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);\n\n      // rawPCM = this.audioBuffer.getChannelData(0);\n\n      // let song = newSong(this.audioBuffer.getChannelData(0));\n      // song.test();\n      // let fft = song.analyze();\n      // spectrogram = await wasm.makeSpectrogram(Array.from(this.audioBuffer.getChannelData(0)));\n      //\n\n      const PCM = Array.from(this.audioBuffer.getChannelData(0));\n      let songOpts = await _main_go__WEBPACK_IMPORTED_MODULE_0___default().newAnalysisOpts();\n      this.opts = songOpts;\n\n      let analyzed = await _main_go__WEBPACK_IMPORTED_MODULE_0___default().analyzeSong(PCM, songOpts);\n      const spectrogramData = analyzed.theGram.data;\n\n      this.spectrogram.loadSong(spectrogramData, songOpts);\n\n      this.spectrogram.draw();\n\n      // Display audio information\n      this.displayAudioInfo(file, this.audioBuffer);\n\n      // Enable controls\n      this.playButton.disabled = false;\n      this.analyzeButton.disabled = false;\n    } catch (error) {\n      alert(\"Error loading audio file: \" + error.message);\n    }\n  }\n\n  displayAudioInfo(file, buffer) {\n    const duration = buffer.duration.toFixed(2);\n    const sampleRate = buffer.sampleRate;\n    const channels = buffer.numberOfChannels;\n    const size = (file.size / 1024 / 1024).toFixed(2);\n\n    this.audioDetails.innerHTML = `\n                    <p><strong>File:</strong> ${file.name}</p>\n                    <p><strong>Duration:</strong> ${duration} seconds</p>\n                    <p><strong>Sample Rate:</strong> ${sampleRate} Hz</p>\n                    <p><strong>Channels:</strong> ${channels}</p>\n                    <p><strong>File Size:</strong> ${size} MB</p>\n                `;\n\n    this.audioInfo.classList.remove(\"hidden\");\n  }\n\n  playAudio() {\n    if (this.isPlaying) return;\n\n    this.source = this.audioContext.createBufferSource();\n    this.source.buffer = this.audioBuffer;\n    this.source.connect(this.audioContext.destination);\n\n    this.source.start();\n    this.isPlaying = true;\n    this.playButton.disabled = true;\n    this.pauseButton.disabled = false;\n\n    this.source.onended = () => {\n      this.isPlaying = false;\n      this.playButton.disabled = false;\n      this.pauseButton.disabled = true;\n    };\n  }\n\n  pauseAudio() {\n    if (this.source && this.isPlaying) {\n      this.source.stop();\n      this.isPlaying = false;\n      this.playButton.disabled = false;\n      this.pauseButton.disabled = true;\n    }\n  }\n\n  startAnalysis() {\n    if (!this.audioBuffer) return;\n\n    // Create analyser node\n    this.analyser = this.audioContext.createAnalyser();\n    this.analyser.fftSize = 2048;\n\n    // Create a new source for analysis\n    const source = this.audioContext.createBufferSource();\n    source.buffer = this.audioBuffer;\n    source.connect(this.analyser);\n    this.analyser.connect(this.audioContext.destination);\n\n    // Start analysis visualization\n    // this.visualizeFrequency();\n\n    // Play for analysis\n    source.start();\n    source.onended = () => {\n      if (this.animationId) {\n        cancelAnimationFrame(this.animationId);\n      }\n    };\n  }\n}\n\n// Initialize the analyzer when the page loads\n// document.addEventListener(\"DOMContentLoaded\", () => {\n//   new AudioAnalyzer();\n// });\n//\n\nlet analyzer = new AudioAnalyzer();\n\nconst button = document.getElementById(\"redraw\");\n\nbutton.addEventListener(\"click\", () => {\n  analyzer.spectrogram.draw();\n});\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } }, 1);\n\n//# sourceURL=webpack:///./src/index.js?\n}");

/***/ },

/***/ "./src/spectrogram.js"
/*!****************************!*\
  !*** ./src/spectrogram.js ***!
  \****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Spectrogram: () => (/* binding */ Spectrogram)\n/* harmony export */ });\n/* harmony import */ var _webgl_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./webgl.js */ \"./src/webgl.js\");\n// import resizeCanvas from \"./util.js\";\n\n//\nconst fill = getComputedStyle(document.documentElement).getPropertyValue(\"--fill-color\").trim();\nconst track = getComputedStyle(document.documentElement).getPropertyValue(\"--track-color\").trim();\n\nconst dpr = window.devicePixelRatio || 1;\n\nfunction resizeCanvas(canvas) {\n  const dpr = window.devicePixelRatio || 1;\n  const { width, height } = canvas.getBoundingClientRect();\n  canvas.width = width * dpr;\n  canvas.height = height * dpr;\n}\n\nfunction updateSlider({ input, display, units, onUpdate }) {\n  const max = input.max;\n  const min = input.min;\n  const pct = ((input.value - min) / (max - min)) * 100;\n  display.textContent = input.value + units;\n  input.style.background = `linear-gradient(90deg, ${fill} ${pct}%, ${track} ${pct}%)`;\n\n  onUpdate(input.value);\n}\n\n// const MAX_DB = -20;\n// const MIN_DB = -80;\n// const MAX_FREQ = 6e3;\n\nfunction gradient(t, colorA, colorB) {\n  const r = Math.round(colorA[0] + t * (colorB[0] - colorA[0]));\n  const g = Math.round(colorA[1] + t * (colorB[1] - colorA[1]));\n  const b = Math.round(colorA[2] + t * (colorB[2] - colorA[2]));\n  return `rgb(${r}, ${g}, ${b})`;\n}\n\nclass Spectrogram {\n  constructor(canvasId) {\n    this.canvas = document.getElementById(canvasId);\n    if (!this.canvas) {\n      console.error(\"Unable to get spectrogram canvas\");\n    }\n\n    this.gl = this.canvas.getContext(\"webgl2\");\n\n    // this.observer = new ResizeObserver(() => {\n    //   resizeCanvas(this.canvas);\n    // });\n\n    this.observer = new ResizeObserver((entries) => {\n      const canvas = this.canvas;\n\n      for (const entry of entries) {\n        const width = entry.devicePixelContentBoxSize?.[0].inlineSize ?? entry.contentBoxSize[0].inlineSize * dpr;\n        const height = entry.devicePixelContentBoxSize?.[0].blockSize ?? entry.contentBoxSize[0].blockSize * dpr;\n\n        canvas.width = Math.round(width);\n        canvas.height = Math.round(height);\n\n        // update the WebGL viewport to match\n        this.gl.viewport(0, 0, canvas.width, canvas.height);\n      }\n    });\n\n    this.observer.observe(this.canvas);\n\n    // this.ctx = this.canvas.getContext(\"2d\");\n\n    const { width, height } = this.canvas.getBoundingClientRect();\n    this.width = width;\n    this.height = height;\n\n    // px per second\n    this.scale = 20;\n\n    this.head = 0;\n\n    this.colorStart = [0, 0, 0];\n    this.colorMid = [128, 0, 128];\n    this.colorEnd = [255, 255, 0];\n\n    this.initializeSliders();\n  }\n\n  setUniforms() {\n    const gl = this.gl;\n    const u = this.uniforms;\n\n    gl.uniform1f(u.minDb, this.MIN_DB);\n    gl.uniform1f(u.maxDb, this.MAX_DB);\n\n    gl.uniform1f(u.maxFreq, this.MAX_FREQ);\n\n    gl.uniform1f(u.rowHeight, this.rowHeight);\n    gl.uniform1f(u.colWidth, this.colWidth);\n\n    gl.uniform3f(u.colorStart, this.colorStart);\n    gl.uniform3f(u.colorMid, this.colorMid);\n    gl.uniform3f(u.colorEnd, this.colorEnd);\n  }\n\n  async initWebGl() {\n    const [testVertSrc, testFragSrc] = await Promise.all([\n      _webgl_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].loadShader(\"shaders/test.vert\"),\n      _webgl_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].loadShader(\"shaders/test.frag\"),\n    ]);\n\n    const gl = this.gl;\n\n    const testProgram = _webgl_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"].createProgram(gl, testVertSrc, testFragSrc);\n    this.gl.useProgram(testProgram);\n\n    const uniforms = [\"minDb\", \"maxDb\", \"rowHeight\", \"colWidth\", \"numFreqs\"];\n    var u = {};\n\n    uniforms.forEach((name) => {\n      const loc = this.gl.getUniformLocation(testProgram, \"u_\" + name);\n\n      if (!loc) {\n        console.warn(\"Uniform not found:\", name);\n        return;\n      }\n\n      u[name] = loc;\n    });\n    // for each (const i in uniforms) {\n    // }\n\n    this.uniforms = uniforms;\n    this.setUniforms();\n\n    let dataData = [\n      [0, 0, 50, 1, 0, 0],\n      [0.5, 0, 50, 0, 1, 0],\n      [0, 0, 100, 0, 0, 1],\n    ];\n\n    // let iSuckAtJS = [];\n    //\n    // for (data of dataData) {\n    //   iSuckAtJS = iSuckAtJS.concat(data);\n    // }\n    // // console.log(iSuckAtJS);\n    // let vertData = new Float32Array(iSuckAtJS);\n    //\n    const vertBuffer = gl.createBuffer();\n\n    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);\n    gl.bufferData(gl.ARRAY_BUFFER, 1000000, gl.STATIC_DRAW);\n\n    const indexLoc = gl.getAttribLocation(testProgram, \"a_index\");\n    const dbLoc = gl.getAttribLocation(testProgram, \"a_db\");\n\n    console.log(\"indexLoc:\", indexLoc, \"dbLoc:\", dbLoc);\n\n    // math is hard\n    const STRIDE = 1 * 4 + 1 * 4;\n\n    // wow that I \\/  is dumb\n    gl.vertexAttribIPointer(indexLoc, 1, gl.INT, false, STRIDE, 0);\n    gl.vertexAttribPointer(dbLoc, 1, gl.FLOAT, false, STRIDE, 1 * 4);\n\n    gl.enableVertexAttribArray(indexLoc);\n    gl.enableVertexAttribArray(dbLoc);\n\n    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);\n\n    this.initialized = true;\n    // draw(dataData.length);\n    // gl.drawArrays(gl.POINTS, 0, dataData.length);\n  }\n\n  initializeSliders() {\n    this.MAX_DB = -20;\n    this.MIN_DB = -80;\n    this.MAX_FREQ = 22e3;\n\n    const sliderNames = [\n      {\n        id: \"max-db\",\n        display: \"val-max-db\",\n        units: \"dB\",\n        onUpdate: (x) => (this.MAX_DB = x),\n      },\n      {\n        id: \"min-db\",\n        display: \"val-min-db\",\n        units: \"dB\",\n        onUpdate: (x) => (this.MIN_DB = x),\n      },\n      {\n        id: \"max-freq\",\n        display: \"val-max-freq\",\n        units: \"kHz\",\n        onUpdate: (x) => {\n          this.MAX_FREQ = x * 1000;\n        },\n      },\n    ];\n\n    const sliders = sliderNames.map(({ id, display, units, onUpdate }) => ({\n      input: document.getElementById(id),\n      display: document.getElementById(display),\n      units: units,\n      onUpdate: onUpdate,\n    }));\n\n    sliders.forEach((s) => {\n      if (!s.input || !s.display) {\n        console.warn(\"undefined slider\");\n        return;\n      }\n\n      s.input.addEventListener(\"input\", () => updateSlider(s));\n\n      updateSlider(s);\n    });\n  }\n\n  computeRowHeight() {\n    if (!this.opts) {\n      console.log(\"no opts?\");\n      return;\n    }\n\n    const theoreticalMax = this.opts.sampleRate / 2;\n    // this is not great, i think we should go back\n    const maxFreq = Math.min(this.MAX_FREQ, theoreticalMax);\n    const analyzedFreqs = this.opts.fftSize * (maxFreq / theoreticalMax);\n    this.rowHeight = this.height / analyzedFreqs;\n  }\n\n  setAttribArray(data) {\n    const gl = this.gl;\n    const buf = gl.createBuffer();\n\n    gl.bindBuffer(gl.ARRAY_BUFFER, buf);\n    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);\n\n    this.attribArray = buf;\n  }\n\n  loadSong(data, opts) {\n    // this.PCM = song;\n    this.data = data;\n    this.opts = opts;\n    // spacing is seconds between fft\n    this.fft_spacing = opts.fftSpacing;\n\n    this.colWidth = opts.fftSpacing * this.scale;\n\n    // let attribArray = data.map((bins) => {\n    //   let withIndicies = [];\n    //   for (const index in bins) {\n    //     withIndicies += [index, bins[index]];\n    //   }\n    //\n    //   return withIndicies;\n    // });\n\n    const withIndicies = [];\n    console.log(\"huh\", data[0][0]);\n    var index = 0;\n    for (const bins of data) {\n      for (const db of bins) {\n        // withIndicies += [index, bins[index]];\n        withIndicies.push(Math.round(index));\n        withIndicies.push(db);\n        index++;\n      }\n    }\n\n    console.log(withIndicies.length);\n\n    this.setAttribArray(withIndicies);\n  }\n\n  colorGradient(t) {\n    if (t > 1) {\n      t = 1;\n    }\n\n    const colors = [\n      [0, 0, 0],\n      [128, 0, 128],\n      [255, 255, 0],\n    ];\n\n    const segments = colors.length - 1;\n    const scaled = t * segments;\n    const i = Math.min(Math.floor(scaled), segments - 1);\n    const localT = scaled - i;\n    return gradient(localT, colors[i], colors[i + 1]);\n  }\n\n  normalizeDb(db) {\n    db = Math.min(this.MAX_DB, Math.max(this.MIN_DB, db));\n\n    return (db - this.MIN_DB) / (this.MAX_DB - this.MIN_DB);\n  }\n\n  drawColumn(x, freqBins) {\n    let index = 0;\n    let y = this.height;\n\n    while (y >= 0 && index < freqBins.length) {\n      const intensity = freqBins[index];\n\n      const normalized = this.normalizeDb(intensity);\n\n      if (intensity) {\n        this.ctx.fillStyle = this.colorGradient(normalized);\n        this.ctx.fillRect(x, y, this.colWidth, -this.rowHeight);\n      }\n\n      y -= this.rowHeight;\n      index++;\n    }\n  }\n\n  draw() {\n    if (!this.data) {\n      console.warn(\"No data?\");\n    }\n\n    this.computeRowHeight();\n\n    console.log(this.MAX_DB, this.MIN_DB, this.MAX_FREQ);\n\n    const gl = this.gl;\n    gl.bindBuffer(gl.ARRAY_BUFFER, this.attribArray);\n    gl.drawArrays(gl.POINTS, 0, 10000);\n    return;\n\n    // removed by dead control flow\n\n    // removed by dead control flow\n\n\n    // removed by dead control flow\n\n    // removed by dead control flow\n\n\n    // removed by dead control flow\n\n    // removed by dead control flow\n\n\n    // removed by dead control flow\n\n\n    // this.ctx.clearRect(0, 0, 500, 500);\n    //\n    // this.ctx.fillStyle = \"blue\";\n    // this.ctx.fillRect(0, 0, 100, 100);\n  }\n}\n\n\n//# sourceURL=webpack:///./src/spectrogram.js?\n}");

/***/ },

/***/ "./src/webgl.js"
/*!**********************!*\
  !*** ./src/webgl.js ***!
  \**********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n// const canvas = document.getElementById(\"canvas\");\n// const gl = canvas.getContext(\"webgl2\");\n// const tf = gl.createTransformFeedback();\n\n// helper function to compile a shader\nfunction compileShader(gl, type, source) {\n  const shader = gl.createShader(type);\n  gl.shaderSource(shader, source);\n  gl.compileShader(shader);\n  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {\n    console.error(gl.getShaderInfoLog(shader));\n    gl.deleteShader(shader);\n    return null;\n  }\n  return shader;\n}\n\n// helper function to compile a program\n// (theres a wee bit of boilerplate in WebGL)\nfunction createProgram(gl, vertSrc, fragSrc) {\n  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);\n  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);\n  const program = gl.createProgram();\n  gl.attachShader(program, vert);\n  gl.attachShader(program, frag);\n  gl.linkProgram(program);\n  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {\n    console.error(gl.getProgramInfoLog(program));\n    return null;\n  }\n  return program;\n}\n\nasync function loadShader(path) {\n  const res = await fetch(path);\n  return res.text();\n}\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({ compileShader, createProgram, loadShader });\n\n\n//# sourceURL=webpack:///./src/webgl.js?\n}");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/async module */
/******/ 	(() => {
/******/ 		var hasSymbol = typeof Symbol === "function";
/******/ 		var webpackQueues = hasSymbol ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 		var webpackExports = hasSymbol ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 		var webpackError = hasSymbol ? Symbol("webpack error") : "__webpack_error__";
/******/ 		
/******/ 		var resolveQueue = (queue) => {
/******/ 			if(queue && queue.d < 1) {
/******/ 				queue.d = 1;
/******/ 				queue.forEach((fn) => (fn.r--));
/******/ 				queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 			}
/******/ 		}
/******/ 		var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 			if(dep !== null && typeof dep === "object") {
/******/ 		
/******/ 				if(dep[webpackQueues]) return dep;
/******/ 				if(dep.then) {
/******/ 					var queue = [];
/******/ 					queue.d = 0;
/******/ 					dep.then((r) => {
/******/ 						obj[webpackExports] = r;
/******/ 						resolveQueue(queue);
/******/ 					}, (e) => {
/******/ 						obj[webpackError] = e;
/******/ 						resolveQueue(queue);
/******/ 					});
/******/ 					var obj = {};
/******/ 		
/******/ 					obj[webpackQueues] = (fn) => (fn(queue));
/******/ 					return obj;
/******/ 				}
/******/ 			}
/******/ 			var ret = {};
/******/ 			ret[webpackQueues] = x => {};
/******/ 			ret[webpackExports] = dep;
/******/ 			return ret;
/******/ 		}));
/******/ 		__webpack_require__.a = (module, body, hasAwait) => {
/******/ 			var queue;
/******/ 			hasAwait && ((queue = []).d = -1);
/******/ 			var depQueues = new Set();
/******/ 			var exports = module.exports;
/******/ 			var currentDeps;
/******/ 			var outerResolve;
/******/ 			var reject;
/******/ 			var promise = new Promise((resolve, rej) => {
/******/ 				reject = rej;
/******/ 				outerResolve = resolve;
/******/ 			});
/******/ 			promise[webpackExports] = exports;
/******/ 			promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 			module.exports = promise;
/******/ 			var handle = (deps) => {
/******/ 				currentDeps = wrapDeps(deps);
/******/ 				var fn;
/******/ 				var getResult = () => (currentDeps.map((d) => {
/******/ 		
/******/ 					if(d[webpackError]) throw d[webpackError];
/******/ 					return d[webpackExports];
/******/ 				}))
/******/ 				var promise = new Promise((resolve) => {
/******/ 					fn = () => (resolve(getResult));
/******/ 					fn.r = 0;
/******/ 					var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 					currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 				});
/******/ 				return fn.r ? promise : getResult();
/******/ 			}
/******/ 			var done = (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue))
/******/ 			body(handle, done);
/******/ 			queue && queue.d < 0 && (queue.d = 0);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;