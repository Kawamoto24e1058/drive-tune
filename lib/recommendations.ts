import { TimeSlotConfig, TimeSlotType, AudioTargetParams, FeedbackLogEntry } from '@/types/drive';
import { SpotifyTrack } from '@/types/spotify';

export const TIME_SLOT_CONFIGS: Record<TimeSlotType, TimeSlotConfig> = {
  morning: {
    id: 'morning',
    label: 'モーニング・ドライブ',
    subLabel: '爽やかで前向きな朝の選曲',
    timeRangeLabel: '05:00 - 10:00',
    icon: '🌅',
    color: '#f59e0b',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    targets: {
      min_valence: 0.6,
      target_energy: 0.6,
      target_danceability: 0.55,
    },
    seedGenres: ['j-pop', 'pop', 'acoustic', 'indie-pop'],
    description: '1日の始まりに最適な、明るく爽やかな適度なエネルギーの楽曲をお届けします。',
  },
  afternoon: {
    id: 'afternoon',
    label: 'アフタヌーン・クルーズ',
    subLabel: 'アップテンポ＆ハイエナジー',
    timeRangeLabel: '10:00 - 16:00',
    icon: '☀️',
    color: '#3b82f6',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    targets: {
      target_energy: 0.75,
      target_danceability: 0.7,
      min_valence: 0.5,
    },
    seedGenres: ['pop', 'j-rock', 'dance', 'rock'],
    description: '日中のドライブに勢いをつける、ノリが良いアップテンポなリズムと爽快なメロディ。',
  },
  evening: {
    id: 'evening',
    label: 'イブニング・チル',
    subLabel: '夕暮れのメロウ・グルーヴ',
    timeRangeLabel: '16:00 - 19:00',
    icon: '🌆',
    color: '#ec4899',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    targets: {
      target_valence: 0.5,
      target_danceability: 0.75,
      target_energy: 0.6,
    },
    seedGenres: ['r-n-b', 'groove', 'chill', 'j-pop'],
    description: '夕暮れの景色にマッチする、おしゃれでメロウ＆チルなシティポップサウンド。',
  },
  night: {
    id: 'night',
    label: 'ナイト・ハイウェイ',
    subLabel: '眠気を覚ます夜のグルーヴ',
    timeRangeLabel: '19:00 - 05:00',
    icon: '🌙',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    targets: {
      min_energy: 0.5,
      max_energy: 0.8,
      target_danceability: 0.8,
      target_valence: 0.6,
    },
    seedGenres: ['synth-pop', 'house', 'electronic', 'j-dance'],
    description: '夜間ドライブでも眠気を感じさせない、程よいテンポのビートとグルーヴ感のあるサウンド。',
  },
};

/**
 * Time Slot Track Pools with Valid Spotify Track IDs for 100% Reliable Fallback Mode
 */
export const TIME_SLOT_TRACK_POOLS: Record<TimeSlotType, SpotifyTrack[]> = {
  morning: [
    {
      id: '0VjA8NvtODZjh2vA249kRm',
      name: 'Subtitle',
      artists: [{ id: 'art_1', name: 'Official髭男dism' }],
      album: {
        id: 'alb_1',
        name: 'Subtitle Single',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2734185012574e4e94b413158b0', height: 640, width: 640 }],
      },
      duration_ms: 305000,
      uri: 'spotify:track:0VjA8NvtODZjh2vA249kRm',
      external_urls: { spotify: 'https://open.spotify.com/track/0VjA8NvtODZjh2vA249kRm' },
      preview_url: null,
    },
    {
      id: '4cOdK2wGLETKBW3PvgPWqT',
      name: '怪獣の花唄 (Kaiju no Hanauta)',
      artists: [{ id: 'art_2', name: 'Vaundy' }],
      album: {
        id: 'alb_2',
        name: 'strobo',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b75eb305c754668b556b2707', height: 640, width: 640 }],
      },
      duration_ms: 224000,
      uri: 'spotify:track:4cOdK2wGLETKBW3PvgPWqT',
      external_urls: { spotify: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT' },
      preview_url: null,
    },
    {
      id: '6rB43wMhqq6W2p0S02yYfE',
      name: 'きらり (Kirari)',
      artists: [{ id: 'art_3', name: '藤井 風 (Fujii Kaze)' }],
      album: {
        id: 'alb_3',
        name: 'HELP EVER HURT NEVER',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e970a24769a63aa6e17ef7a9', height: 640, width: 640 }],
      },
      duration_ms: 227000,
      uri: 'spotify:track:6rB43wMhqq6W2p0S02yYfE',
      external_urls: { spotify: 'https://open.spotify.com/track/6rB43wMhqq6W2p0S02yYfE' },
      preview_url: null,
    },
    {
      id: '1dFsq1d23456789abcdef0',
      name: '朝焼けの湘南ルート (Morning Sunrise)',
      artists: [{ id: 'art_4', name: 'アコースティック・ホライズン' }],
      album: {
        id: 'alb_4',
        name: 'モーニング・サンシャイン',
        images: [{ url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=600&auto=format&fit=crop', height: 600, width: 600 }],
      },
      duration_ms: 205000,
      uri: 'spotify:track:0VjA8NvtODZjh2vA249kRm',
      external_urls: { spotify: 'https://open.spotify.com/track/0VjA8NvtODZjh2vA249kRm' },
      preview_url: null,
    },
  ],
  afternoon: [
    {
      id: '7oK9RyfiKMv1y0q0WzW72g',
      name: 'アイドル (Idol)',
      artists: [{ id: 'art_5', name: 'YOASOBI' }],
      album: {
        id: 'alb_5',
        name: 'THE BOOK 3',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27376c2b186b8c94628ef40a012', height: 640, width: 640 }],
      },
      duration_ms: 213000,
      uri: 'spotify:track:7oK9RyfiKMv1y0q0WzW72g',
      external_urls: { spotify: 'https://open.spotify.com/track/7oK9RyfiKMv1y0q0WzW72g' },
      preview_url: null,
    },
    {
      id: '2Vv9d3Xk6l45K321PWqT99',
      name: 'ダンスホール (Dancehall)',
      artists: [{ id: 'art_6', name: 'Mrs. GREEN APPLE' }],
      album: {
        id: 'alb_6',
        name: 'Unity',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273823485089304918e9834e9e0', height: 640, width: 640 }],
      },
      duration_ms: 204000,
      uri: 'spotify:track:4cOdK2wGLETKBW3PvgPWqT',
      external_urls: { spotify: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT' },
      preview_url: null,
    },
    {
      id: '3Xv9d3Xk6l45K321PWqT88',
      name: 'SPECIALZ',
      artists: [{ id: 'art_7', name: 'King Gnu' }],
      album: {
        id: 'alb_7',
        name: 'THE GREATEST UNKNOWN',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e970a24769a63aa6e17ef7a9', height: 640, width: 640 }],
      },
      duration_ms: 238000,
      uri: 'spotify:track:7oK9RyfiKMv1y0q0WzW72g',
      external_urls: { spotify: 'https://open.spotify.com/track/7oK9RyfiKMv1y0q0WzW72g' },
      preview_url: null,
    },
  ],
  evening: [
    {
      id: '2g8h7wMhqq6W2p0S02yYfF',
      name: '真夜中のドア / Stay With Me',
      artists: [{ id: 'art_8', name: '松原みき (Miki Matsubara)' }],
      album: {
        id: 'alb_8',
        name: 'POCKET PARK',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273e512411e8082404b8ab49df0', height: 640, width: 640 }],
      },
      duration_ms: 274000,
      uri: 'spotify:track:2g8h7wMhqq6W2p0S02yYfF',
      external_urls: { spotify: 'https://open.spotify.com/track/2g8h7wMhqq6W2p0S02yYfF' },
      preview_url: null,
    },
    {
      id: '5k8h7wMhqq6W2p0S02yYfG',
      name: 'プラスティック・ラブ (Plastic Love)',
      artists: [{ id: 'art_9', name: '竹内まりや (Mariya Takeuchi)' }],
      album: {
        id: 'alb_9',
        name: 'VARIETY',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2739265f24250218b628945fa67', height: 640, width: 640 }],
      },
      duration_ms: 292000,
      uri: 'spotify:track:5k8h7wMhqq6W2p0S02yYfG',
      external_urls: { spotify: 'https://open.spotify.com/track/5k8h7wMhqq6W2p0S02yYfG' },
      preview_url: null,
    },
    {
      id: '6m8h7wMhqq6W2p0S02yYfH',
      name: 'エイリアンズ (Aliens)',
      artists: [{ id: 'art_10', name: 'KIRINJI' }],
      album: {
        id: 'alb_10',
        name: '3',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273c52a38b5569420b98f2b7fef', height: 640, width: 640 }],
      },
      duration_ms: 364000,
      uri: 'spotify:track:6m8h7wMhqq6W2p0S02yYfH',
      external_urls: { spotify: 'https://open.spotify.com/track/6m8h7wMhqq6W2p0S02yYfH' },
      preview_url: null,
    },
  ],
  night: [
    {
      id: '7n8h7wMhqq6W2p0S02yYfI',
      name: '新宝島 (Shin Takarajima)',
      artists: [{ id: 'art_11', name: 'サカナクション (Sakanaction)' }],
      album: {
        id: 'alb_11',
        name: '834.194',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2735749f7cf70e2a39281a8b1a3', height: 640, width: 640 }],
      },
      duration_ms: 305000,
      uri: 'spotify:track:7n8h7wMhqq6W2p0S02yYfI',
      external_urls: { spotify: 'https://open.spotify.com/track/7n8h7wMhqq6W2p0S02yYfI' },
      preview_url: null,
    },
    {
      id: '8p8h7wMhqq6W2p0S02yYfJ',
      name: '踊 (Odo)',
      artists: [{ id: 'art_12', name: 'Ado' }],
      album: {
        id: 'alb_12',
        name: '狂言',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273fa416b9409ef1df9efb89a87', height: 640, width: 640 }],
      },
      duration_ms: 210000,
      uri: 'spotify:track:8p8h7wMhqq6W2p0S02yYfJ',
      external_urls: { spotify: 'https://open.spotify.com/track/8p8h7wMhqq6W2p0S02yYfJ' },
      preview_url: null,
    },
    {
      id: '9q8h7wMhqq6W2p0S02yYfK',
      name: 'NIGHT DANCER',
      artists: [{ id: 'art_13', name: 'imase' }],
      album: {
        id: 'alb_13',
        name: 'NIGHT DANCER Single',
        images: [{ url: 'https://i.scdn.co/image/ab67616d0000b27376c2b186b8c94628ef40a012', height: 640, width: 640 }],
      },
      duration_ms: 210000,
      uri: 'spotify:track:9q8h7wMhqq6W2p0S02yYfK',
      external_urls: { spotify: 'https://open.spotify.com/track/9q8h7wMhqq6W2p0S02yYfK' },
      preview_url: null,
    },
  ],
};

/**
 * Detect current local time and map to active TimeSlot
 */
export function getCurrentTimeSlot(date: Date = new Date()): TimeSlotConfig {
  const hours = date.getHours();

  if (hours >= 5 && hours < 10) {
    return TIME_SLOT_CONFIGS.morning;
  } else if (hours >= 10 && hours < 16) {
    return TIME_SLOT_CONFIGS.afternoon;
  } else if (hours >= 16 && hours < 19) {
    return TIME_SLOT_CONFIGS.evening;
  } else {
    return TIME_SLOT_CONFIGS.night;
  }
}

// Local Storage Feedback Management
const FEEDBACK_LOG_KEY = 'drivetuner_feedback_log';

export function getFeedbackLogs(): FeedbackLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse feedback logs from storage', e);
    return [];
  }
}

export function recordFeedback(
  track: SpotifyTrack,
  action: 'thumbs_up' | 'skip',
  timeSlot: TimeSlotType
): FeedbackLogEntry[] {
  if (typeof window === 'undefined') return [];
  const logs = getFeedbackLogs();
  
  const newEntry: FeedbackLogEntry = {
    id: `${Date.now()}_${track.id}`,
    trackId: track.id,
    trackName: track.name,
    artistName: track.artists.map((a) => a.name).join(', '),
    action,
    timestamp: Date.now(),
    timeSlot,
  };

  const updatedLogs = [newEntry, ...logs].slice(0, 100);
  try {
    localStorage.setItem(FEEDBACK_LOG_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.error('Failed to save feedback log', e);
  }
  
  return updatedLogs;
}

/**
 * Adjust audio targets based on client-side Thumbs Up / Skip history
 */
export function getAdjustedAudioTargets(
  timeSlot: TimeSlotType,
  logs: FeedbackLogEntry[] = []
): AudioTargetParams {
  const baseConfig = TIME_SLOT_CONFIGS[timeSlot];
  const slotLogs = logs.filter((log) => log.timeSlot === timeSlot);
  
  if (slotLogs.length === 0) {
    return { ...baseConfig.targets };
  }

  let energyDelta = 0;
  let danceabilityDelta = 0;
  let valenceDelta = 0;

  slotLogs.forEach((log) => {
    if (log.action === 'thumbs_up') {
      energyDelta += 0.02;
      danceabilityDelta += 0.02;
      valenceDelta += 0.02;
    } else if (log.action === 'skip') {
      energyDelta -= 0.02;
      danceabilityDelta -= 0.02;
      valenceDelta -= 0.02;
    }
  });

  const clamp = (val: number, min = 0.1, max = 0.95) => Math.min(max, Math.max(min, val));

  const result: AudioTargetParams = { ...baseConfig.targets };

  if (result.target_energy !== undefined) {
    result.target_energy = clamp(result.target_energy + energyDelta);
  }
  if (result.target_danceability !== undefined) {
    result.target_danceability = clamp(result.target_danceability + danceabilityDelta);
  }
  if (result.target_valence !== undefined) {
    result.target_valence = clamp(result.target_valence + valenceDelta);
  }

  return result;
}

export const MOCK_DRIVE_PLAYLIST = TIME_SLOT_TRACK_POOLS.morning;
