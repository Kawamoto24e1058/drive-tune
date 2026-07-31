export interface RadioTrack {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  albumCover: string;
}

export type TimeSlotType = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeSlotConfig {
  id: TimeSlotType;
  label: string;
  period: string;
  color: string;
}
