/* eslint-disable @typescript-eslint/no-empty-function */
import Res from '../../../../res';
import { SCENE_DATA } from './scene-utils';

export interface SCENE_ENTRY {
  image;
  title: string;
  value: SCENE_DATA;
}

export const scene_datas_life: SCENE_ENTRY[] = [
  {
    image: Res.scene_nighty_night,
    title: 'Nighty-night',
    value: {
      version: 0,
      id: 0,
      mode: 0,
      interval: 100,
      time: 100,
      colors: [
        { isColour: false, h: 0,   s: 0, t: 0, b: 200 },
      ]
    }
  },
  {
    image: Res.scene_enjoy,
    title: 'Joy',
    value: {
      version: 0,
      id: 1,
      mode: 0,
      interval: 100,
      time: 100,
      colors: [
        { isColour: false, h: 0,  s: 0, t: 500, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_dine,
    title: 'Dining',
    value: {
      version: 0,
      id: 2,
      mode: 0,
      interval: 100,
      time: 100,
      colors: [
        { isColour: false, h: 0, s: 0, t: 500, b: 500 },
      ]
    }
  },
  {
    image: Res.scene_immerse,
    title: 'Meditation',
    value: {
      version: 0,
      id: 3,
      mode: 0,
      interval: 100,
      time: 100,
      colors: [
        { isColour: false, h: 0, s: 0,  t: 1000, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_viridity,
    title: 'Vigorous',
    value: {
      version: 0,
      id: 4,
      mode: 4,
      interval: 70,
      time: 70,
      colors: [
        { isColour: true, h: 42, s: 940,  t: 0, b: 1000 },
        { isColour: true, h: 16, s: 1000, t: 0, b: 1000 },
        { isColour: true, h: 30, s: 1000, t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_vitality,
    title: 'Energetic',
    value: {
      version: 0,
      id: 5,
      mode: 1,
      interval: 65,
      time: 65,
      colors: [
        { isColour: true, h: 25,  s: 750,  t: 0, b: 1000 },
        { isColour: true, h: 51,  s: 1000, t: 0, b: 930 },
        { isColour: true, h: 333, s: 760,  t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_rose,
    title: 'Rose',
    value: {
      version: 0,
      id: 6,
      mode: 2,
      interval: 35,
      time: 35,
      colors: [
        { isColour: true, h: 3,   s: 490,  t: 0, b: 1000 },
        { isColour: true, h: 11,  s: 600,  t: 0, b: 990 },
        { isColour: true, h: 6,   s: 670,  t: 0, b: 1000 },
        { isColour: true, h: 349, s: 790,  t: 0, b: 1000 },
        { isColour: true, h: 346, s: 1000, t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_peacock_green,
    title: 'Peacock green',
    value: {
      version: 0,
      id: 7,
      mode: 0,
      interval: 100,
      time: 100,
      colors: [
        { isColour: true, h: 185, s: 1000,  t: 0, b: 690 },
      ]
    }
  },
  {
    image: Res.scene_springtime,
    title: 'Spring',
    value: {
      version: 0,
      id: 8,
      mode: 2,
      interval: 40,
      time: 40,
      colors: [
        { isColour: true, h: 351, s: 150,  t: 0, b: 1000 },
        { isColour: true, h: 333, s: 220,  t: 0, b: 1000 },
        { isColour: true, h: 334, s: 330,  t: 0, b: 1000 },
        { isColour: true, h: 338, s: 540,  t: 0, b: 1000 },
        { isColour: true, h: 5,   s: 520,  t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_cool_summer,
    title: 'Summer',
    value: {
      version: 0,
      id: 9,
      mode: 2,
      interval: 60,
      time: 60,
      colors: [
        { isColour: true, h: 146, s: 203,  t: 0, b: 810 },
        { isColour: true, h: 174, s: 710,  t: 0, b: 880 },
        { isColour: true, h: 208, s: 282,  t: 0, b: 1000 },
        { isColour: true, h: 186, s: 400,  t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_autmn,
    title: 'Autumn',
    value: {
      version: 0,
      id: 10,
      mode: 4,
      interval: 40,
      time: 40,
      colors: [
        { isColour: true, h: 38, s: 760,  t: 0, b: 990 },
        { isColour: true, h: 19, s: 720,  t: 0, b: 860 },
        { isColour: true, h: 25, s: 860,  t: 0, b: 800 },
        { isColour: true, h: 0,  s: 750,  t: 0, b: 800 },
      ]
    }
  },
  {
    image: Res.scene_fire_in_winter,
    title: 'Winter',
    value: {
      version: 0,
      id: 11,
      mode: 2,
      interval: 50,
      time: 50,
      colors: [
        { isColour: true, h: 52, s: 500,  t: 0, b: 990 },
        { isColour: true, h: 31, s: 980,  t: 0, b: 930 },
        { isColour: true, h: 16, s: 990,  t: 0, b: 950 },
      ]
    }
  },
  {
    image: Res.scene_independence,
    title: 'ID4',
    value: {
      version: 0,
      id: 12,
      mode: 2,
      interval: 90,
      time: 90,
      colors: [
        { isColour: true, h: 218, s: 1000, t: 0, b: 390 },
        { isColour: true, h: 359, s: 1000, t: 0, b: 1000 },
        { isColour: true, h: 0,   s: 0,    t: 0, b: 1000 },
      ]
    }
  },
];

export const scene_datas_weather: SCENE_ENTRY[] = [
  {
    image: Res.scene_rainbow,
    title: 'Rainbow',
    value: {
      version: 0,
      id: 30,
      mode: 1,
      interval: 70,
      time: 70,
      colors: [
        { isColour: true, h: 0,   s: 1000, t: 0, b: 1000 },
        { isColour: true, h: 30,  s: 1000, t: 0, b: 1000 },
        { isColour: true, h: 61,  s: 1000, t: 0, b: 1000 },
        { isColour: true, h: 120, s: 1000, t: 0, b: 1000 },
        { isColour: true, h: 174, s: 1000, t: 0, b: 1000 },
        { isColour: true, h: 240, s: 1000, t: 0, b: 1000 },
        { isColour: true, h: 275, s: 1000, t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_sun,
    title: 'Sun',
    value: {
      version: 0,
      id: 31,
      mode: 2,
      interval: 40,
      time: 40,
      colors: [
        { isColour: true, h: 59, s: 420,  t: 0, b: 980 },
        { isColour: true, h: 51, s: 480,  t: 0, b: 980 },
        { isColour: true, h: 48, s: 540,  t: 0, b: 980 },
        { isColour: true, h: 43, s: 650,  t: 0, b: 970 },
        { isColour: true, h: 34, s: 710,  t: 0, b: 970 },
      ]
    }
  },
  {
    image: Res.scene_thunder,
    title: 'Thunder',
    value: {
      version: 0,
      id: 32,
      mode: 5,
      interval: 90,
      time: 90,
      colors: [
        { isColour: true, h: 262, s: 960,  t: 0, b: 990 },
        { isColour: true, h: 263, s: 810,  t: 0, b: 1000 },
        { isColour: true, h: 285, s: 890,  t: 0, b: 1000 },
        { isColour: true, h: 267, s: 530,  t: 0, b: 1000 },
        { isColour: true, h: 291, s: 380,  t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_mood,
    title: 'Mood',
    value: {
      version: 0,
      id: 33,
      mode: 2,
      interval: 40,
      time: 40,
      colors: [
        { isColour: true, h: 60,  s: 130,  t: 0, b: 1000 },
        { isColour: true, h: 219, s: 370,  t: 0, b: 1000 },
        { isColour: true, h: 213, s: 660,  t: 0, b: 1000 },
        { isColour: true, h: 212, s: 990,  t: 0, b: 1000 },
        { isColour: true, h: 241, s: 1000, t: 0, b: 990 },
      ]
    }
  },
  {
    image: Res.scene_aurora,
    title: 'Aurora',
    value: {
      version: 0,
      id: 34,
      mode: 2,
      interval: 70,
      time: 70,
      colors: [
        { isColour: true, h: 145, s: 430, t: 0, b: 1000 },
        { isColour: true, h: 157, s: 350, t: 0, b: 990 },
        { isColour: true, h: 173, s: 590, t: 0, b: 1000 },
        { isColour: true, h: 204, s: 870, t: 0, b: 1000 },
        { isColour: true, h: 223, s: 990, t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_setting_sun,
    title: 'Sunset',
    value: {
      version: 0,
      id: 35,
      mode: 2,
      interval: 50,
      time: 50,
      colors: [
        { isColour: true, h: 9,   s: 720, t: 0, b: 1000 },
        { isColour: true, h: 14,  s: 660, t: 0, b: 1000 },
        { isColour: true, h: 27,  s: 530, t: 0, b: 1000 },
        { isColour: true, h: 209, s: 210, t: 0, b: 1000 },
        { isColour: true, h: 219, s: 480, t: 0, b: 990 },
      ]
    }
  },
  {
    image: Res.scene_nebula,
    title: 'Nebula',
    value: {
      version: 0,
      id: 36,
      mode: 5,
      interval: 40,
      time: 40,
      colors: [
        { isColour: true, h: 336, s: 320,  t: 0, b: 1000 },
        { isColour: true, h: 331, s: 290,  t: 0, b: 990 },
        { isColour: true, h: 237, s: 300,  t: 0, b: 1000 },
        { isColour: true, h: 291, s: 430,  t: 0, b: 990 },
        { isColour: true, h: 272, s: 950,  t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_sunrise,
    title: 'Sunrise',
    value: {
      version: 0,
      id: 37,
      mode: 4,
      interval: 50,
      time: 50,
      colors: [
        { isColour: true, h: 36,  s: 650,  t: 0, b: 1000 },
        { isColour: true, h: 37,  s: 590,  t: 0, b: 1000 },
        { isColour: true, h: 30,  s: 420,  t: 0, b: 1000 },
        { isColour: true, h: 225, s: 180,  t: 0, b: 1000 },
        { isColour: true, h: 202, s: 440,  t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_beach,
    title: 'Beach',
    value: {
      version: 0,
      id: 38,
      mode: 2,
      interval: 50,
      time: 50,
      colors: [
        { isColour: true, h: 172, s: 500,  t: 0, b: 1000 },
        { isColour: true, h: 158, s: 180,  t: 0, b: 1000 },
        { isColour: true, h: 364, s: 280,  t: 0, b: 1000 },
        { isColour: true, h: 4,   s: 430,  t: 0, b: 990 },
        { isColour: true, h: 11,  s: 680,  t: 0, b: 990 },
      ]
    }
  },
];

export const scene_datas_festival: SCENE_ENTRY[] = [
  {
    image: Res.scene_christmas,
    title: 'Christmas',
    value: {
      version: 0,
      id: 60,
      mode: 1,
      interval: 70,
      time: 70,
      colors: [
        { isColour: true, h: 1,   s: 890, t: 0, b: 760 },
        { isColour: true, h: 145, s: 820, t: 0, b: 400 },
      ]
    }
  },
  {
    image: Res.scene_halloween,
    title: 'Halloween',
    value: {
      version: 0,
      id: 61,
      mode: 4,
      interval: 40,
      time: 40,
      colors: [
        { isColour: true, h: 36,  s: 870,  t: 0, b: 1000 },
        { isColour: true, h: 206, s: 850,  t: 0, b: 900 },
        { isColour: true, h: 41,  s: 970,  t: 0, b: 910 },
        { isColour: true, h: 278, s: 670,  t: 0, b: 460 },
        { isColour: true, h: 88,  s: 980,  t: 0, b: 440 },
      ]
    }
  },
  {
    image: Res.scene_easter,
    title: 'Easter',
    value: {
      version: 0,
      id: 62,
      mode: 4,
      interval: 60,
      time: 60,
      colors: [
        { isColour: true, h: 18,  s: 200,  t: 0, b: 980 },
        { isColour: true, h: 7,   s: 390,  t: 0, b: 940 },
        { isColour: true, h: 348, s: 700,  t: 0, b: 890 },
        { isColour: true, h: 190, s: 820,  t: 0, b: 750 },
        { isColour: true, h: 207, s: 800,  t: 0, b: 580 },
        { isColour: true, h: 171, s: 480,  t: 0, b: 750 },
        { isColour: true, h: 325, s: 530,  t: 0, b: 900 },
      ]
    }
  },
  {
    image: Res.scene_birthday,
    title: 'Birthday',
    value: {
      version: 0,
      id: 63,
      mode: 4,
      interval: 60,
      time: 60,
      colors: [
        { isColour: true, h: 0,   s: 800,  t: 0, b: 1000 },
        { isColour: true, h: 30,  s: 790,  t: 0, b: 1000 },
        { isColour: true, h: 60,  s: 800,  t: 0, b: 1000 },
        { isColour: true, h: 119, s: 800,  t: 0, b: 1000 },
        { isColour: true, h: 180, s: 790,  t: 0, b: 1000 },
        { isColour: true, h: 210, s: 800,  t: 0, b: 1000 },
        { isColour: true, h: 330, s: 800,  t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_cny,
    title: 'New Year',
    value: {
      version: 0,
      id: 64,
      mode: 1,
      interval: 60,
      time: 60,
      colors: [
        { isColour: true, h: 352, s: 1000,  t: 0, b: 1000 },
        { isColour: true, h: 351, s: 920,   t: 0, b: 1000 },
        { isColour: true, h: 355, s: 800,   t: 0, b: 1000 },
        { isColour: true, h: 3,   s: 610,   t: 0, b: 1000 },
        { isColour: true, h: 33,  s: 1000,  t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_wedding_anniv,
    title: 'Wedding anniv',
    value: {
      version: 0,
      id: 65,
      mode: 2,
      interval: 40,
      time: 40,
      colors: [
        { isColour: true, h: 310, s: 1000,  t: 0, b: 1000 },
        { isColour: true, h: 38,  s: 940,   t: 0, b: 1000 },
        { isColour: true, h: 335, s: 490,   t: 0, b: 1000 },
        { isColour: true, h: 183, s: 440,   t: 0, b: 1000 },
        { isColour: true, h: 0,   s: 560,   t: 0, b: 1000 },
      ]
    }
  },
];

export const scene_datas_diy: SCENE_ENTRY[] = [
  {
    image: Res.scene_diy1,
    title: 'DIY1',
    value: {
      version: 0,
      id: 90,
      mode: 2,
      interval: 60,
      time: 60,
      colors: [
        { isColour: true, h: 179, s: 960, t: 0, b: 1000 },
        { isColour: true, h: 29,  s: 980, t: 0, b: 1000 },
        { isColour: true, h: 120, s: 940, t: 0, b: 980 },
        { isColour: true, h: 303, s: 990, t: 0, b: 990 },
        { isColour: true, h: 240, s: 980, t: 0, b: 990 },
      ]
    }
  },
  {
    image: Res.scene_diy2,
    title: 'DIY2',
    value: {
      version: 0,
      id: 91,
      mode: 3,
      interval: 50,
      time: 50,
      colors: [
        { isColour: true, h: 240, s: 1000,  t: 0, b: 1000 },
        { isColour: true, h: 60,  s: 1000,  t: 0, b: 1000 },
        { isColour: true, h: 120, s: 1000,  t: 0, b: 1000 },
        { isColour: true, h: 240, s: 1000,  t: 0, b: 1000 },
        { isColour: true, h: 180, s: 1000,  t: 0, b: 1000 },
        { isColour: true, h: 0,   s: 1000,  t: 0, b: 1000 },
        { isColour: true, h: 300, s: 1000,  t: 0, b: 1000 },
        { isColour: true, h: 60,  s: 1000,  t: 0, b: 1000 },
        { isColour: true, h: 35,  s: 1000,  t: 0, b: 1000 },
      ]
    }
  },
  {
    image: Res.scene_diy3,
    title: 'DIY3',
    value: {
      version: 0,
      id: 92,
      mode: 2,
      interval: 100,
      time: 100,
      colors: [
        { isColour: true, h: 184, s: 300,  t: 0, b: 840 },
        { isColour: true, h: 89,  s: 290,  t: 0, b: 860 },
        { isColour: true, h: 347, s: 360,  t: 0, b: 940 },
        { isColour: true, h: 237, s: 210,  t: 0, b: 820 },
        { isColour: true, h: 27,  s: 460,  t: 0, b: 970 },
        { isColour: true, h: 338, s: 450,  t: 0, b: 910 },
      ]
    }
  },
  {
    image: Res.scene_diy4,
    title: 'DIY4',
    value: {
      version: 0,
      id: 93,
      mode: 1,
      interval: 70,
      time: 70,
      colors: [
        { isColour: true, h: 194, s: 900,  t: 0, b: 300 },
        { isColour: true, h: 202, s: 960,  t: 0, b: 460 },
        { isColour: true, h: 191, s: 620,  t: 0, b: 560 },
        { isColour: true, h: 170, s: 290,  t: 0, b: 330 },
        { isColour: true, h: 195, s: 340,  t: 0, b: 730 },
      ]
    }
  },
];

export const flash_mode_configs = [
  {title: 'Bright', mode: 0 },
  {title: 'Breathing', mode: 4 },
  {title: 'Gradual change', mode: 2 },
  {title: 'Glint', mode: 5 },
  {title: 'Jump', mode: 1 },
  {title: 'Flash', mode: 3 },
];