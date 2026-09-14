export interface EQBand {
  type: BiquadFilterType
  frequency: number // Hz
  gain: number // dB, ±12
  Q: number // quality factor
  enabled: boolean
}

export interface EQPreset {
  id: string
  name: string
  description: string
  gain: number
  bands: EQBand[]
}

export const DEFAULT_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

export function createFlatBands(): EQBand[] {
  return DEFAULT_FREQUENCIES.map(f => ({
    type: 'peaking' as BiquadFilterType,
    frequency: f,
    gain: 0,
    Q: 1.41,
    enabled: true,
  }))
}

// preset values are taken from https://www.reddit.com/r/oratory1990/wiki/index/list_of_presets/
export const EQ_PRESETS: EQPreset[] = [
  {
    id: 'flat',
    name: 'Flat',
    description: 'No EQ correction – flat response',
    gain: 0.0,
    bands: createFlatBands(),
  },
  {
    id: 'akg240s',
    name: 'AKG 240 Studio',
    description: 'boosts sub-bass, tames treble spike',
    gain: -9.5,
    bands: [
      { type: 'lowshelf',   frequency: 75,      gain:  4.0,     Q: 0.71,    enabled: true },
      { type: 'lowshelf',   frequency: 105,     gain:  5.5,     Q: 0.71,    enabled: true },
      { type: 'peaking',    frequency: 220,     gain: -4.0,     Q: 0.5,     enabled: true },
      { type: 'peaking',    frequency: 950,     gain: -2.6,     Q: 1.3,     enabled: true },
      { type: 'peaking',    frequency: 1650,    gain:  5.0,     Q: 1.4,     enabled: true },
      { type: 'peaking',    frequency: 2100,    gain: -1.6,     Q: 4.0,     enabled: true },
      { type: 'peaking',    frequency: 2700,    gain: -4.0,     Q: 2.5,     enabled: true },
      { type: 'peaking',    frequency: 3000,    gain: -0.7,     Q: 6.0,     enabled: true },
      { type: 'peaking',    frequency: 4100,    gain:  4.0,     Q: 1.4,     enabled: true },
      { type: 'peaking',    frequency: 7000,    gain: -4.9,     Q: 3.0,     enabled: true },
    ],
  },
  {
    id: 'akg701',
    name: 'AKG 701',
    description: 'tames treble spike',
    gain: -5.5,
    bands: [
      { type: 'lowshelf',   frequency: 105,     gain:  5.5,     Q: 0.71,    enabled: true },
      { type: 'peaking',    frequency: 200,     gain: -2.7,     Q: 0.4,     enabled: true },
      { type: 'peaking',    frequency: 710,     gain:  2.9,     Q: 1.4,     enabled: true },
      { type: 'peaking',    frequency: 1320,    gain:  2.8,     Q: 1.5,     enabled: true },
      { type: 'highshelf',  frequency: 2000,    gain:  4.0,     Q: 0.71,    enabled: true },
      { type: 'peaking',    frequency: 2450,    gain: -5.3,     Q: 1.9,     enabled: true },
      { type: 'peaking',    frequency: 3500,    gain:  2.5,     Q: 1.4,     enabled: true },
      { type: 'peaking',    frequency: 5850,    gain: -6.1,     Q: 2.5,     enabled: true },
      { type: 'peaking',    frequency: 7500,    gain: -1.2,     Q: 6.0,     enabled: true },
      { type: 'highshelf',  frequency: 10000,   gain: -4.0,     Q: 0.71,    enabled: true },
    ],
  },
  {
    id: 'dt880fresh',
    name: 'Beyerdynamic DT 880 [fresh earpads]',
    description: 'boosts sub-bass, tames treble spike',
    gain: -5.4,
    bands: [
      { type: 'lowshelf',   frequency: 105,     gain:  5.5,     Q: 0.71,    enabled: true },
      { type: 'peaking',    frequency: 200,     gain:  5.1,     Q: 0.3,     enabled: true },
      { type: 'peaking',    frequency: 530,     gain:  1.5,     Q: 1.0,     enabled: true },
      { type: 'peaking',    frequency: 1400,    gain:  1.1,     Q: 2.0,     enabled: true },
      { type: 'peaking',    frequency: 3000,    gain: -1.7,     Q: 3.0,     enabled: true },
      { type: 'peaking',    frequency: 4700,    gain:  1.5,     Q: 1.4,     enabled: true },
      { type: 'peaking',    frequency: 5500,    gain: -2.6,     Q: 6.0,     enabled: true },
      { type: 'peaking',    frequency: 5950,    gain: -5.8,     Q: 4.0,     enabled: true },
      { type: 'peaking',    frequency: 8300,    gain: -4.8,     Q: 5.0,     enabled: true },
      { type: 'highshelf',  frequency: 10000,   gain: -2.0,     Q: 0.71,    enabled: true },
    ],
  },
  {
    id: 'dt880worn',
    name: 'Beyerdynamic DT 880 [worn earpads]',
    description: 'boosts sub-bass, tames treble spike',
    gain: -11.0,
    bands: [
      { type: 'peaking',    frequency: 20,      gain:  2.5,     Q: 1.0,     enabled: true },
      { type: 'lowshelf',   frequency: 100,     gain:  8.5,     Q: 0.7,     enabled: true },
      { type: 'peaking',    frequency: 210,     gain: -0.8,     Q: 2.0,     enabled: true },
      { type: 'peaking',    frequency: 2800,    gain: -0.7,     Q: 4.0,     enabled: true },
      { type: 'peaking',    frequency: 5000,    gain:  4.2,     Q: 3.0,     enabled: true },
      { type: 'peaking',    frequency: 5980,    gain: -4.6,     Q: 5.0,     enabled: true },
      { type: 'peaking',    frequency: 7400,    gain:  1.0,     Q: 6.0,     enabled: true },
      { type: 'peaking',    frequency: 8000,    gain:  0.0,     Q: 1.0,     enabled: false },
      { type: 'peaking',    frequency: 3650,    gain:  1.5,     Q: 6.0,     enabled: true },
      { type: 'peaking',    frequency: 10000,   gain:  0.0,     Q: 1.0,     enabled: false },
    ],
  },
  {
    id: 'mmx300',
    name: 'Beyerdynamic MMX 300',
    description: 'tames sub-bass and treble spike',
    gain: -5.0,
    bands: [
      { type: 'lowshelf',   frequency: 40,      gain:  5.0,     Q: 0.71,    enabled: true },
      { type: 'peaking',    frequency: 85,      gain:  4.0,     Q: 2.0,     enabled: true },
      { type: 'peaking',    frequency: 125,     gain: -4.0,     Q: 1.6,     enabled: true },
      { type: 'peaking',    frequency: 350,     gain: -0.5,     Q: 2.0,     enabled: true },
      { type: 'peaking',    frequency: 1800,    gain:  1.4,     Q: 1.2,     enabled: true },
      { type: 'peaking',    frequency: 2370,    gain: -2.7,     Q: 2.7,     enabled: true },
      { type: 'peaking',    frequency: 3800,    gain:  3.0,     Q: 2.0,     enabled: true },
      { type: 'peaking',    frequency: 5650,    gain: -4.5,     Q: 7.0,     enabled: true },
      { type: 'peaking',    frequency: 8300,    gain: -3.0,     Q: 7.0,     enabled: true },
      { type: 'highshelf',  frequency: 10000,   gain: -4.0,     Q: 0.71,    enabled: true },
    ],
  },
  {
    id: 'boseQCUltra',
    name: 'Bose QuietComfort Ultra',
    description: 'tames sub-bass and treble spikes',
    gain: -5.7,
    bands: [
      { type: 'peaking',    frequency: 32,      gain: -3.9,     Q: 1.0,     enabled: true },
      { type: 'lowshelf',   frequency: 103,     gain:  0.0,     Q: 0.71,    enabled: true },
      { type: 'peaking',    frequency: 130,     gain: -2.8,     Q: 0.7,     enabled: true },
      { type: 'peaking',    frequency: 350,     gain:  1.0,     Q: 1.4,     enabled: true },
      { type: 'peaking',    frequency: 900,     gain: -1.5,     Q: 1.4,     enabled: true },
      { type: 'peaking',    frequency: 1550,    gain:  2.2,     Q: 2.0,     enabled: true },
      { type: 'peaking',    frequency: 2430,    gain: -3.0,     Q: 3.0,     enabled: true },
      { type: 'peaking',    frequency: 5200,    gain:  7.0,     Q: 1.1,     enabled: true },
      { type: 'peaking',    frequency: 6000,    gain: -6.5,     Q: 5.0,     enabled: true },
      { type: 'highshelf',  frequency: 10000,   gain:  0.0,     Q: 1.0,     enabled: false },
    ],
  },
  {
    id: 'shHD600',
    name: 'Sennheiser HD 600',
    description: 'tames sub-bass and treble spikes',
    gain: -9.3,
    bands: [
      { type: 'peaking',    frequency: 20,      gain:  4.0,     Q: 1.1,     enabled: true },
      { type: 'peaking',    frequency: 97,      gain: -2.5,     Q: 0.7,     enabled: true },
      { type: 'lowshelf',   frequency: 105,     gain:  5.5,     Q: 0.71,    enabled: true },
      { type: 'peaking',    frequency: 215,     gain: -1.7,     Q: 1.1,     enabled: true },
      { type: 'peaking',    frequency: 1400,    gain: -2.1,     Q: 1.5,     enabled: true },
      { type: 'highshelf',  frequency: 2000,    gain:  3.0,     Q: 0.71,    enabled: true },
      { type: 'peaking',    frequency: 2700,    gain: -1.3,     Q: 3.0,     enabled: true },
      { type: 'peaking',    frequency: 3370,    gain: -3.9,     Q: 2.5,     enabled: true },
      { type: 'peaking',    frequency: 5350,    gain: -3.5,     Q: 3.0,     enabled: true },
      { type: 'highshelf',  frequency: 11000,   gain: -4.0,     Q: 0.71,    enabled: true },
    ],
  },
]
