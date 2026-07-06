export type SpectrumFrame = {
  bins: Uint8Array<ArrayBuffer>;
};

export class CavaAnalyser {
  private bins: Uint8Array<ArrayBuffer>;

  constructor(private analyser: AnalyserNode) {
    this.bins = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
  }

  read(): SpectrumFrame {
    this.analyser.getByteFrequencyData(this.bins);
    return { bins: this.bins };
  }
}

