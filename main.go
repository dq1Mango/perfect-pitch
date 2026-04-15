package main

import (
	"fmt"
	"math"

	"github.com/argusdusty/gofft"
)

func testingArray() []complex128 {

	return gofft.Float64ToComplex128Array([]float64{1, 0, -1, 0, 1, 0, -1, 0})
}

func realTest() []complex128 {
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

func handBackedFFT(x []complex128) []complex128 {
	N := len(x)

	if N == 2 {
		return []complex128{x[0] + x[1], x[0] - x[1]}
	}

	evens := make([]complex128, N/2)
	odds := make([]complex128, N/2)

	for i := range N / 2 {
		evens[i] = x[2*i]
		odds[i] = x[2*i+1]
	}

	Ek := handBackedFFT(evens)
	Ok := handBackedFFT(odds)

	twoPiOverN := 2.0 * float64(math.Pi) / float64(N)

	fourier := make([]complex128, N)
	for K := range N / 2 {
		k := float64(K)
		exponential := complex(math.Cos(twoPiOverN*k), math.Sin(twoPiOverN*k))
		fourier[K] = Ek[K] + exponential*Ok[K]
		fourier[K+N/2] = Ek[K] - exponential*Ok[K]
	}

	return fourier
}

func dft(x []complex128) []complex128 {
	N := len(x)
	fourier := make([]complex128, N)

	for k := range N {

		var sum complex128
		for n, xn := range x {
			exponent := 2.0 * float64(math.Pi) * float64(k*n) / float64(N)
			sum += xn * complex(math.Cos(exponent), math.Sin(exponent))
		}

		fourier[k] = sum
	}

	return fourier

}

func freqSlice(deltaTime float64, samples int) []float64 {
	freqs := make([]float64, samples)

	totalTime := float64(deltaTime * float64(samples))

	for i := range samples / 2 {
		freqs[i] = float64(i) / totalTime
		freqs[len(freqs)-1-i] = -float64(i) / totalTime
	}

	return freqs
}

func main() {
	// Do an FFT and IFFT and get the same result
	// testArray := testingArray()
	testArray := realTest()
	err := gofft.FFT(testArray)
	if err != nil {
		panic(err)
	}
	// err = gofft.IFFT(testArray)
	// if err != nil {
	// 	panic(err)
	// }
	result := gofft.Complex128ToFloat64Array(testArray)
	// gofft.RoundFloat64Array(result)
	// fmt.Println(result)
	//
	// // Do a discrete convolution of the testArray with itself
	// testArray, err = gofft.Convolve(testArray, testArray)
	// if err != nil {
	// 	panic(err)
	// }
	result = gofft.Complex128ToFloat64Array(testArray)
	gofft.RoundFloat64Array(result)
	fmt.Println(result)

	// testArray = testingArray()
	testArray = realTest()
	output := handBackedFFT(testArray)

	result = gofft.Complex128ToFloat64Array(output)
	gofft.RoundFloat64Array(result)
	fmt.Println(result)
	fmt.Println(freqSlice(1, len(testArray)))
}
