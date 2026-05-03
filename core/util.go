package core

import (
	"math"
)

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
