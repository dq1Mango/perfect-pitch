//go:build js && wasm

package core

import (
	"fmt"

	"github.com/argusdusty/gofft"
	// "gitlab.com/gomidi/midi/v2"
)

type SongOpts struct {
	FFTSize int
}

func (o *SongOpts) SetFFTSize(size int) *SongOpts {
	o.FFTSize = size
	return o
}

type Song struct {
	Audio []float64
	Opts  *SongOpts
}

type ParsedSong struct {
	FFT []complex128
}

func complicate(arr []float64) []complex128 {
	complicated := make([]complex128, len(arr))

	for i, v := range arr {
		complicated[i] = complex(v, 0)
	}

	return complicated
}

func (s *Song) Analyze() *ParsedSong {

	complicated := complicate(s.Audio)
	err := gofft.FFT(complicated)

	if err != nil {
		panic(err)
	}

	return &ParsedSong{
		FFT: complicated,
	}
}

//go:wasmexport Init
func Init() {

	fmt.Println("ts works")
	// Do an FFT and IFFT and get the same result
	// testArray := testingArray()
}
