package core

import (
	"errors"
	"fmt"
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

func TestNoteName(t *testing.T) {
	fmt.Println("--- Running Pitch.Name() (Sharp Preference) Tests ---")

	// Test cases: Frequency, Expected Sharp Name
	tests := []struct {
		freq float64
		want string
	}{
		{440.0, "A"},
		{220.0, "A"},
		{880.0, "A"},
		{466.16, "A#"},
		{392.0, "G"},
		{523.25, "C"},
		{493.88, "B"},
		{320.0, "D#"},
		{369.99, "F#"},
		{415.30, "G#"},
		{349.28, "F"},
		{261.63, "C"},
		{0.0, "Unknown"},
	}

	for _, tt := range tests {
		p := Pitch(tt.freq)
		got := p.SharpName()
		if got != tt.want {
			t.Errorf("FAIL: Pitch %.2fHz -> Name() got %s, want %s\n", tt.freq, got, tt.want)
		} else {
			fmt.Printf("PASS: Pitch %.2fHz -> Name() is %s\n", tt.freq, got)
		}
	}

	// fmt.Println("\n--- Running Pitch.NameFlat() (Flat Preference) Tests ---")
	//
	// // Test cases: Frequency, Expected Flat Name
	// flatTests := []struct {
	// 	freq float64
	// 	want string
	// }{
	// 	{440.0, "A"},     // Reference A4
	// 	{220.0, "A"},     // A3
	// 	{880.0, "A"},     // A5
	// 	{415.30, "Cb"},   // Cb4 (Flat preference)
	// 	{392.0, "Db"},    // Db4 (Flat preference, common for 392Hz)
	// 	{523.25, "C#"},   // C#5 (often written as Db5, but let's test Db)
	// 	{392.0, "Db"},    // Db4 (Testing 392 again)
	// 	{493.88, "B"},    // B4 (B is usually B, not Bb, unless preferred)
	// 	{320.0, "E"},     // E4
	// 	{369.99, "Gb"},   // Gb4 (Flat preference)
	// 	{349.28, "F"},    // F4
	// 	{261.63, "C"},    // C4
	// 	{0.0, "Unknown"}, // Zero frequency
	// }
	//
	// for _, tt := range flatTests {
	// 	p := Pitch(tt.freq)
	// 	got := p.SharpName()
	// 	if got != tt.want {
	// 		fmt.Printf("FAIL: Pitch %.2fHz -> NameFlat() got %s, want %s\n", tt.freq, got, tt.want)
	// 	} else {
	// 		fmt.Printf("PASS: Pitch %.2fHz -> NameFlat() is %s\n", tt.freq, got)
	// 	}
	// }
}

func roundTo(value float64, n int) float64 {
	factor := math.Pow(10, float64(n))
	return math.Round(value*factor) / factor
}

func TestParseNote(t *testing.T) {

	// yeah u caught me, these r the same ai made test cases as before
	tests := []struct {
		want float64
		note string
		err  error
	}{
		{440.0, "A", nil},
		{220.0, "A3", nil},
		{880.0, "A5", nil},
		{466.16, "A#", nil},
		{392.0, "G3", nil},
		{523.25, "C", nil},
		{493.88, "B", nil},
		// {320.0, "D#3", nil},
		{369.99, "F#3", nil},
		{415.30, "G#3", nil},
		{349.23, "F3", nil},
		{261.63, "C3", nil},

		{0, "ABC", InvalidNoteError},
		{0, "", InvalidNoteError},
	}

	for _, tt := range tests {
		pitch, err := noteFromString(tt.note)

		if !errors.Is(tt.err, err) {
			t.Errorf(
				"FAIL: Note %.2s -> NoteFromeString() got error %s, want %s\n",
				tt.note,
				err,
				tt.err,
			)
		}

		if err != nil {
			continue
		}

		got := roundTo(float64(*pitch), 2)
		if got != tt.want {
			t.Errorf(
				"FAIL: Pitch %.2s ->NoteFromeString() got %fHz, want %fHz\n",
				tt.note,
				got,
				tt.want,
			)
		} else {
			fmt.Printf("PASS: Pitch %.2s -> NoteFromeString() is %.2fHz\n", tt.note, got)
		}
	}

}
