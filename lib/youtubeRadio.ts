import { RadioTrack, TimeSlotType, TimeSlotConfig } from '@/types/radio';

export const TIME_SLOTS: Record<TimeSlotType, TimeSlotConfig> = {
  morning: {
    id: 'morning',
    label: 'モーニング・ドライブ',
    period: '05:00 - 10:00',
    color: '#38bdf8', // Bright Sky Blue
  },
  afternoon: {
    id: 'afternoon',
    label: 'アフタヌーン・ハイウェイ',
    period: '10:00 - 16:00',
    color: '#eab308', // Upbeat Sun Yellow
  },
  evening: {
    id: 'evening',
    label: 'サンセット・グルーヴ',
    period: '16:00 - 19:00',
    color: '#f97316', // Sunset Orange
  },
  night: {
    id: 'night',
    label: 'ナイト・ハイウェイ',
    period: '19:00 - 05:00',
    color: '#a855f7', // Cyber Purple
  },
};

export const YOUTUBE_DRIVE_POOLS: Record<TimeSlotType, RadioTrack[]> = {
  morning: [
    {
      id: 'm1',
      videoId: '0VjA8NvtODZjh2vA249kRm',
      title: 'Subtitle',
      artist: 'Official髭男dism',
      albumCover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'm2',
      videoId: '4cOdK2wGLETKBW3PvgPWqT',
      title: '怪獣の花唄',
      artist: 'Vaundy',
      albumCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'm3',
      videoId: '7oK9RyfiKMv1y0q0WzW72g',
      title: 'アイドル',
      artist: 'YOASOBI',
      albumCover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'm4',
      videoId: 'm20k7w8J1aY',
      title: 'ミックスナッツ',
      artist: 'Official髭男dism',
      albumCover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80',
    },
  ],
  afternoon: [
    {
      id: 'a1',
      videoId: 'ony539T074w',
      title: 'SPECIALZ',
      artist: 'King Gnu',
      albumCover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'a2',
      videoId: 'L18d4i5qJjQ',
      title: '青と夏',
      artist: 'Mrs. GREEN APPLE',
      albumCover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'a3',
      videoId: '1-69pU-f9vQ',
      title: '感電',
      artist: '米津玄師',
      albumCover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    },
  ],
  evening: [
    {
      id: 'e1',
      videoId: '9Gj47G2e1Jc',
      title: '真夜中のドア / Stay With Me',
      artist: '松原みき (Miki Matsubara)',
      albumCover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'e2',
      videoId: '3bNITQR4480',
      title: 'Plastic Love',
      artist: '竹内まりや (Mariya Takeuchi)',
      albumCover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'e3',
      videoId: 'qC_202x0n9M',
      title: 'RIDE ON TIME',
      artist: '山下達郎 (Tatsuro Yamashita)',
      albumCover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    },
  ],
  night: [
    {
      id: 'n1',
      videoId: 'MV_3Dpw-BRY',
      title: 'Nightcall',
      artist: 'Kavinsky (Drive OST)',
      albumCover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'n2',
      videoId: '4NRXx6U8ABQ',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      albumCover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'n3',
      videoId: '17n-Zc_003Y',
      title: 'Midnight City',
      artist: 'M83',
      albumCover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    },
  ],
};

export function getCurrentTimeSlot(): TimeSlotConfig {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return TIME_SLOTS.morning;
  if (hour >= 10 && hour < 16) return TIME_SLOTS.afternoon;
  if (hour >= 16 && hour < 19) return TIME_SLOTS.evening;
  return TIME_SLOTS.night;
}
