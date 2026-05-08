const path = require("path");
// const { lookpath } = require("lookpath");
//
// console.log("PATH:", process.env.PATH);
// console.log("GOROOT:", process.env.GOROOT);

// const p = await lookpath("bash");
//
// console.log(p);
// webpack.config.js:
module.exports = {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.go$/,
        use: ["golang-wasm"],
      },
    ],
  },
  ignoreWarnings: [
    {
      module: /wasm_exec.js$/,
    },
  ],
  // loader: "golang-wasm",
  // options: {
  //   goroot: "/run/current-system/sw", // or wherever `which go` points on your system
  // },
};
