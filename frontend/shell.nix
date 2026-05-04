# nix shell for targetting wasm
let pkgs = import <nixpkgs> { };
in pkgs.mkShell {
  GOOS = "js";
  GOARCH = "wasm";
}
