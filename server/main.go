package main

import (
	// "errors"
	"flag"
	"log"
	"net/http"
	// "os"
)

var (
	listen = flag.String("listen", ":8080", "listen address")
	dir    = flag.String("dir", "../frontend/", "directory to serve")
)

func main() {
	flag.Parse()
	log.Printf("listening on %q...", *listen)
	err := http.ListenAndServe(*listen, http.FileServer(http.Dir(*dir)))
	log.Fatalln(err)
}
