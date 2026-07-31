export type TimeSlotType = 'morning' | 'afternoon' | 'evening' | 'night';

export interface AudioTargetParams {
  min_valence?: number;
  target_valence?: number;
  max_valence?: number;
  min_energy?: number;
  target_energy?: number;
  max_energy?: number;
  min_danceability?: number;
  target_danceability?: number;
  max_danceability?: number;
  target_tempo?: number;
  [key: string]: number | undefined;
}

export interface TimeSlotConfig {
  id: TimeSlotType;
  label: string;
  subLabel: string;
  timeRangeLabel: string;
  icon: string; // Emoji or Lucide icon name
  color: string;
  badgeBg: string;
  targets: AudioTargetParams;
  seedGenres: string[];
  description: string;
}

export type FeedbackAction = 'thumbs_up' | 'skip';

export interface FeedbackLogEntry {
  id: string;
  trackId: string;
  trackName: string;
  artistName: string;
  action: FeedbackAction;
  timestamp: number;
  timeSlot: TimeSlotType;
  audioFeatures?: {
    energy?: number;
    valence?: number;
    danceability?: number;
    tempo?: number;
  };
}

export interface DrivePreferenceWeights {
  energyOffset: number; // e.g. +0.05 or -0.05
  danceabilityOffset: number;
  valenceOffset: number;
  tempoOffset: number;
}
