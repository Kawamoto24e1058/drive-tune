export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyUser {
  id: string;
  display_name: string | null;
  email?: string;
  images?: SpotifyImage[];
  product?: string;
  country?: string;
  uri?: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres?: string[];
  images?: SpotifyImage[];
  uri: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date?: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: SpotifyAlbum;
  duration_ms: number;
  uri: string;
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
}

export interface SpotifyAudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  duration_ms: number;
  time_signature: number;
}

export interface SpotifySeed {
  initialPoolSize: number;
  afterFilteringSize: number;
  afterRelinkingSize: number;
  id: string;
  type: string;
}

export interface SpotifyRecommendationsResponse {
  tracks: SpotifyTrack[];
  seeds: SpotifySeed[];
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  uri: string;
  external_urls: {
    spotify: string;
  };
  images: SpotifyImage[];
  tracks?: {
    total: number;
  };
}
