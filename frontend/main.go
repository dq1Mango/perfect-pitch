package main

import (
	"syscall/js"

	"github.com/dq1Mango/perfect-pitch/core"
)

func parseJSArray(array js.Value) []float64 {

	parsed := make([]float64, array.Length())
	for i := range array.Length() {
		if v := array.Index(i); v.Type() == js.TypeNumber {
			parsed[i] = v.Float()
		}
	}

	return parsed
}

func WrapNewSong(this js.Value, args []js.Value) any {
	println("wrapping")

	var audio []float64

	if len(args) == 1 {
		audio = parseJSArray(args[0])
	} else {
		println("hey man, u gotta give me a song")
	}

	song := core.NewSong(audio)

	analyze := js.FuncOf(func(this js.Value, args []js.Value) any {
		parsed := song.Analyze()

		return parsed.FFT
	})

	test := js.FuncOf(func(this js.Value, args []js.Value) any {
		println("test complete")
		return nil
	})

	obj := js.Global().Get("Object").New()
	obj.Set("analyze", analyze)
	obj.Set("test", test)
	// obj.Set("decrement", decrement)
	// obj.Set("get", get)

	return obj

}

// [][]int -> JS Array of Arrays
func convertNestedSlice(matrix []core.FreqBins) []any {
	outer := make([]any, len(matrix))
	for i, row := range matrix {
		inner := make([]any, len(row))
		for j, val := range row {
			inner[j] = val
		}
		outer[i] = inner
	}
	return outer
}

func WrapMakeSpectrogram(this js.Value, args []js.Value) any {
	var audio []float64

	if len(args) == 1 {
		audio = parseJSArray(args[0])
	} else {
		println("hey man, u gotta give me a song")
	}

	spectrogram := core.MakeSpectrogram(audio)

	println("wow that takes almost as long as the whole fft")

	return js.ValueOf(convertNestedSlice(spectrogram.Data))

}

func main() {
	println("also hi")
	js.Global().Set("testing", js.FuncOf(core.WrapTest))

	js.Global().Set("newSong", js.FuncOf(WrapNewSong))

	js.Global().Set("makeSpectrogram", js.FuncOf(WrapMakeSpectrogram))

	select {}
}
