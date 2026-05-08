# nix shell for targetting wasm
let pkgs = import <nixpkgs> { };
in pkgs.mkShell {
  buildInputs = with pkgs; [ go ];

  GOOS = "js";
  GOARCH = "wasm";

  shellHook = "export GOROOT=$(go env GOROOT)";
}
