package main

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"math"
	"os"
	"os/exec"
	// "time"

	midi "gitlab.com/gomidi/midi/v2"
	// "gitlab.com/gomidi/midi/v2/gm"
	"gitlab.com/gomidi/midi/v2/smf"

	_ "gitlab.com/gomidi/midi/v2/drivers/testdrv"
)

const FILENAME = "song"

const (
	sampleRate  = 44100
	numChannels = 1
	bitDepth    = 16
)

type TrackWriter struct {
	track    smf.Track
	lastTick uint32
}

func (w *TrackWriter) Add(absoluteTick uint32, msg midi.Message) {
	delta := absoluteTick - w.lastTick
	w.track.Add(delta, msg)
	w.lastTick = absoluteTick
}

func writeFile() {

	clock := smf.MetricTicks(960) // 960 ticks per quarter note
	s := smf.New()
	s.TimeFormat = clock

	var tr smf.Track

	// Set tempo: 120 BPM = 500000 microseconds per beat
	tr.Add(0, smf.MetaTempo(500000))

	// NoteOn at tick 0, channel 0, middle C (60), velocity 100
	tr.Add(0, midi.NoteOn(0, 60, 100))
	// NoteOff 1 quarter note later (960 ticks)
	tr.Add(960, midi.NoteOff(0, 60))

	tr.Add(0, midi.NoteOn(0, 64, 100)) // E4
	tr.Add(960, midi.NoteOff(0, 64))

	tr.Add(0, midi.NoteOn(0, 67, 100)) // G4
	tr.Add(960, midi.NoteOff(0, 67))

	tr.Close(0) // writes end-of-track marker
	s.Add(tr)

	s.WriteFile(FILENAME)
}

// makes a SMF and returns the bytes
func mkSMF() []byte {
	var (
		bf    bytes.Buffer
		clock = smf.MetricTicks(960) // resolution: 96 ticks per quarternote 960 is also common
		// tr    smf.Track
		tw TrackWriter
	)

	tw.track.Add(0, smf.MetaTempo(120))
	tw.track.Add(0, smf.MetaInstrument("Brass"))

	offTick := uint32(960 * 4)

	tw.Add(0, midi.NoteOn(0, 20, 100)) // C
	tw.Add(0, midi.NoteOn(0, 24, 100)) // E  — delta 0 = same time
	tw.Add(0, midi.NoteOn(0, 27, 100)) // G
	tw.Add(offTick, midi.NoteOff(0, 20))
	tw.Add(offTick, midi.NoteOff(0, 24)) // delta 0 = same time as previous off
	tw.Add(offTick, midi.NoteOff(0, 27)) // first track must have tempo and meter informations
	// tw.Add(0, midi.NoteOn(0, 60, 100)) // C
	// tw.Add(0, midi.NoteOn(0, 64, 100)) // E  — delta 0 = same time
	// tw.Add(0, midi.NoteOn(0, 67, 100)) // G
	// tw.Add(offTick, midi.NoteOff(0, 60))
	// tw.Add(offTick, midi.NoteOff(0, 64)) // delta 0 = same time as previous off
	// tw.Add(offTick, midi.NoteOff(0, 67)) // first track must have tempo and meter informations
	// tw.Add(0, smf.MetaMeter(3, 4))
	// tw.Add(0, smf.MetaTempo(140))
	// tw.Add(0, smf.MetaInstrument("Brass"))
	// tw.Add(0, midi.ProgramChange(0, gm.Instr_BrassSection.Value()))
	// tw.Add(0, midi.Ab(3).NoteOn(0, 120)) // or midi.NoteOn(0, midi.Ab(3).Value(), 120)
	// tw.Add(clock.Ticks8th(), midi.C(4).NoteOn(0, 120))
	// // duration: a quarter note (96 ticks in our case)
	// tw.Add(clock.Ticks4th()*2, midi.Ab(3).NoteOff(0)) // or midi.NoteOff(0, midi.Ab(3).Value())
	// tw.Add(0, midi.C(4).NoteOff(0))
	tw.track.Close(0)

	// create the SMF and add the tracks
	s := smf.New()
	s.TimeFormat = clock
	s.Add(tw.track)
	s.WriteTo(&bf)
	return bf.Bytes()
}

func writeWAV(filename string, samples []int16) error {
	f, _ := os.Create(filename)
	defer f.Close()

	dataSize := len(samples) * 2
	// WAV header
	f.WriteString("RIFF")
	binary.Write(f, binary.LittleEndian, uint32(36+dataSize))
	f.WriteString("WAVEfmt ")
	binary.Write(f, binary.LittleEndian, uint32(16)) // chunk size
	binary.Write(f, binary.LittleEndian, uint16(1))  // PCM format
	binary.Write(f, binary.LittleEndian, uint16(numChannels))
	binary.Write(f, binary.LittleEndian, uint32(sampleRate))
	binary.Write(f, binary.LittleEndian, uint32(sampleRate*numChannels*bitDepth/8))
	binary.Write(f, binary.LittleEndian, uint16(numChannels*bitDepth/8))
	binary.Write(f, binary.LittleEndian, uint16(bitDepth))
	f.WriteString("data")
	binary.Write(f, binary.LittleEndian, uint32(dataSize))
	return binary.Write(f, binary.LittleEndian, samples)
}

func generateNote(freq, durationSec, amplitude float64) []int16 {
	n := int(sampleRate * durationSec)
	samples := make([]int16, n)
	for i := range samples {
		t := float64(i) / sampleRate
		// Basic sine wave + envelope to avoid clicks
		env := math.Min(float64(i)/500.0, math.Min(1.0, float64(n-i)/500.0))
		samples[i] = int16(amplitude * env * math.Sin(2*math.Pi*freq*t))
	}
	return samples
}

func writeMidi(filename string) {
	rd := bytes.NewReader(mkSMF())

	var notes []int16
	// score, _ := smf.ReadFile(FILENAME)
	smf.ReadTracksFrom(rd).Do(func(ev smf.TrackEvent) {
		// ev.Message is a MIDI message (NoteOn, NoteOff, ProgramChange, etc.)
		var ch, key, vel uint8
		if ev.Message.GetNoteOn(&ch, &key, &vel) {
			fmt.Println(key)
			freq := 440.0 * math.Pow(2, float64(key-69)/12.0)
			fmt.Println(freq)

			notes = append(notes, generateNote(freq, 0.4, 28000)...)

			// synthesize freq for the appropriate duration
		}
	})

	writeWAV(filename+".wav", notes)
}

func main() {
	writeMidi(FILENAME)
	cmd := exec.Command("ffplay", "-hide_banner", "-nodisp", "./"+FILENAME+".wav")
	err := cmd.Run()
	if err != nil {
		fmt.Println(err)
	}

	// fmt.Println(output)

	// time.Sleep(10 * time.Second)
}
