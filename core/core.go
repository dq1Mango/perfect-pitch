package core

import (
	"fmt"
	"math"
	"slices"

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

// Reference frequency: A4 = 440 Hz
const A4_FREQ = 440.0

var SharpNames = []string{"A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"}
var FlatNames = []string{"A", "B♭", "B", "C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭"}

type Pitch float64

func remEuclid(a, b float64) float64 {
	return math.Mod(math.Mod(a, b)+b, b)
}

func pitch2NoteNum(pitch *Pitch) int {
	n := 12.0 * math.Log2(float64(*pitch)/A4_FREQ)
	n = math.Round(n)

	return int(remEuclid(n, 12.0))

}

// Name returns the standard note name for the given frequency (in Hz).
// It uses A4 = 440Hz as the reference.
func (p *Pitch) SharpName() string {

	if *p <= 0 {
		return "Unknown"
	}

	n := pitch2NoteNum(p)

	// Map pitch class to note name

	// Determine representation: prefer sharp unless it's C, E, F, or G
	// For C, E, F, G, the flat version (b) is also common, but we'll stick to sharp
	// unless the user specifically wants a preference, but returning the standard sharp
	// representation is usually clearest.
	noteName := SharpNames[n]

	// Optional: If we wanted to favor flats for certain notes (e.g., Cb, Eb, Fb, Gb)
	// switch pitchClass {
	// case 1: // C#
	// 	if *p == 415.30 { return "Cb" } // Example for Cb
	// case 3: // D#
	// 	if *p == 392.0 { return "Db" } // Example for Db
	// case 6: // F#
	// 	if *p == 369.99 { return "Gb" } // Example for Gb
	// case 8: // G#
	// 	if *p == 392.0 { return "Ab" } // Example for Ab (Note: 392 is also D#)
	// }

	return noteName
}

func (p *Pitch) FlatName() string {

	if *p <= 0 {
		return "Unknown"
	}

	n := pitch2NoteNum(p)

	noteName := FlatNames[n]

	return noteName
}

func (sp *Spectrogram) PrimaryPitches() []Pitch {
	pitches := make([]Pitch, len(sp.Data))

	for i, v := range sp.Data {

		pitches[i] = Pitch(slices.Max(v))
	}

	return pitches

}
