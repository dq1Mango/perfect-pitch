//go:build js && wasm

package core

import (
	"fmt"
	"math"
	"syscall/js"

	"github.com/argusdusty/gofft"
	// "gitlab.com/gomidi/midi/v2"
)

func makeFFTUseful(fft []complex128) ([]float64, []float64) {
	amplitudes := make([]float64, len(fft))
	phases := make([]float64, len(fft))

	for i, value := range fft {
		amplitudes[i] = math.Sqrt(real(value)*real(value) + imag(value)*imag(value))
		phases[i] = math.Atan(imag(value) / real(value))
	}

	return amplitudes, phases
}

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
	FFT []float64
}

type FreqBins []float64

type Spectrogram struct {
	Data     []FreqBins
	BinCount int
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

	usefull, _ := makeFFTUseful(complicated)

	if err != nil {
		panic(err)
	}

	return &ParsedSong{
		FFT: usefull,
	}
}

func Test() {

	fmt.Println("ts works")
	// Do an FFT and IFFT and get the same result
	// testArray := testingArray()
}

func WrapTest(this js.Value, args []js.Value) any {
	Test()

	return nil
}

func f32tof64(arr []float64) []float64 {
	f64 := make([]float64, len(arr))

	for i, v := range arr {
		f64[i] = float64(v)
	}

	return f64
}

func NewSong(audio []float64) *Song {
	return &Song{
		Audio: f32tof64(audio),
	}
}

func (s *Song) Test() {
	fmt.Println("this worked")
}

const FFT_SIZE = 2048
const SAMPLES_PER_HOP = 44100 / 144

func MakeSpectrogram(audio []float64) *Spectrogram {
	fmt.Println("all for the (spectro)gram")

	hops := len(audio) / SAMPLES_PER_HOP

	spectrogram := &Spectrogram{
		BinCount: FFT_SIZE / 2,
		Data:     make([]FreqBins, hops),
	}
	hopDex := 0
	i, j := 0, FFT_SIZE
	for j < len(audio) {
		slice := audio[i:j]

		complicated := complicate(slice)

		_ = gofft.FFT(complicated)

		usefull, _ := makeFFTUseful(complicated)

		spectrogram.Data[hopDex] = usefull

		// i += FFT_SIZE
		// 		j+= FFT_SIZE
		i += SAMPLES_PER_HOP
		j += SAMPLES_PER_HOP
		hopDex++
	}

	fmt.Println("bitches love the (spectro)gram")

	return spectrogram

}
