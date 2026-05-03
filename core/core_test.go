package core

import (
	"math"
	"slices"
	"testing"

	"github.com/argusdusty/gofft"
)

func testingArray() []complex128 {

	return gofft.Float64ToComplex128Array([]float64{1, 0, -1, 0, 1, 0, -1, 0})
}

func betterTestArray() []complex128 {
	samples := 1 << 4
	// fmt.Println("samples:", samples)

	data := make([]complex128, samples)

	f := func(t float64) float64 {
		var output float64

		output += math.Cos(math.Pi * 2.0 * 0.125 * t)
		output += math.Cos(math.Pi * 2 * 0.25 * t)

		return output
	}

	for t := range samples {
		data[t] = complex(f(float64(t)), 0)
	}

	// fmt.Println("data: ", data)
	// fmt.Println("f: ", f(1))

	return data
}

func TestHandBaked(t *testing.T) {
	handBaked := betterTestArray()
	realOne := betterTestArray()

	err := gofft.FFT(realOne)
	if err != nil {
		panic(err)
	}

	realResult := gofft.Complex128ToFloat64Array(realOne)
	gofft.RoundFloat64Array(realResult)

	// testArray = testingArray()
	output := handBackedFFT(handBaked)

	handResult := gofft.Complex128ToFloat64Array(output)
	gofft.RoundFloat64Array(handResult)

	if !slices.Equal(realResult, handResult) {
		t.Errorf("FFTs not equal\nExpected: %v\nActual: %v", realResult, handResult)
	}
}
