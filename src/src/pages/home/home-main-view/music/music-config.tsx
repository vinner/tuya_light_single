export interface AreaData {
  area: number[];
  isColour: boolean;
  h: number;
  s: number;
  t: number;
  b: number;
}

export interface AppMusicDataType {
  name: string;         // 名称
  mode: number;         // 变化模式，取值[0-7]
  colorArea: AreaData[];
}

/* 每个APP音乐律动模式的配色参数 */
export const AppMusicColors: AppMusicDataType[] = [
  {
    name: 'Jazz',
    mode: 1,
    colorArea: [
      { area: [0, 1], isColour: true, h: 27,  s: 580,  t: 0, b: 1000 },
      { area: [2, 3], isColour: true, h: 333, s: 460,  t: 0, b: 1000 },
      { area: [4, 5], isColour: true, h: 286, s: 540,  t: 0, b: 1000 },
      { area: [6, 7], isColour: true, h: 191, s: 570,  t: 0, b: 1000 },
      { area: [8, 8], isColour: true, h: 149, s: 630,  t: 0, b: 1000 },
      { area: [9, 9], isColour: true, h: 75,  s: 630,  t: 0, b: 1000 },
    ]
  },
  {
    name: 'R&B',
    mode: 2,
    colorArea: [
      { area: [0, 1], isColour: true, h: 207, s: 600, t: 0, b: 800 },
      { area: [2, 3], isColour: true, h: 230, s: 430, t: 0, b: 800 },
      { area: [4, 5], isColour: true, h: 6,   s: 610, t: 0, b: 800 },
      { area: [6, 7], isColour: true, h: 169, s: 910, t: 0, b: 800 },
      { area: [8, 8], isColour: true, h: 313, s: 860, t: 0, b: 800 },
      { area: [9, 9], isColour: true, h: 181, s: 680, t: 0, b: 800 },
    ]
  },
  {
    name: 'Hip-Hop',
    mode: 3,
    colorArea: [
      { area: [0, 1], isColour: true, h: 339, s: 1000, t: 0, b: 1000 },
      { area: [2, 3], isColour: true, h: 181, s: 910,  t: 0, b: 1000 },
      { area: [4, 5], isColour: true, h: 72,  s: 910,  t: 0, b: 1000 },
      { area: [6, 7], isColour: true, h: 139, s: 910,  t: 0, b: 1000 },
      { area: [8, 8], isColour: true, h: 266, s: 590,  t: 0, b: 1000 },
      { area: [9, 9], isColour: true, h: 239, s: 820,  t: 0, b: 1000 },
    ]
  },
  {
    name: 'Rock',
    mode: 3,
    colorArea: [
      { area: [0, 1], isColour: true, h: 14,  s: 760, t: 0, b: 890 },
      { area: [2, 3], isColour: true, h: 350, s: 810, t: 0, b: 640 },
      { area: [4, 5], isColour: true, h: 228, s: 900, t: 0, b: 590 },
      { area: [6, 7], isColour: true, h: 248, s: 580, t: 0, b: 600 },
      { area: [8, 8], isColour: true, h: 239, s: 720, t: 0, b: 920 },
      { area: [9, 9], isColour: true, h: 184, s: 560, t: 0, b: 950 },
    ]
  },
];
