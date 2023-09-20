/* eslint-disable import/prefer-default-export */
import _ from 'lodash';
import { TYSdk, Utils } from 'tuya-panel-kit';
import ColorObj from 'color';
import { store } from '../models';
import Strings from '../i18n';
import { WHITEPARAM } from '../config';
import { defaultThemeScenes, defaultHolidayScenes, defaultColourfulScenes } from '../config/scenes';

const { convertX: cx, isIphoneX } = Utils.RatioUtils;

export interface SceneValueData {
  t: number; // 时长
  f: number; // 频率
  m: number; // 模式
  h: number; // 彩光色相
  s: number; // 彩光饱和度
  v: number; // 彩光亮度
  b: number; // 白光亮度
  k: number; // 白光色温
}

export const screen_bottom_height = isIphoneX ? cx(80) : cx(60);

export const getFaultStrings = (faultCode: string, faultValue: number, onlyPrior = true) => {
  const { devInfo } = store.getState();
  if (!faultValue) return '';
  const { label } = devInfo.schema[faultCode];
  const labels: string[] = [];
  for (let i = 0; i < label!.length; i++) {
    const value = label![i];
    const isExist = Utils.NumberUtils.getBitValue(faultValue, i);
    if (isExist) {
      labels.push(Strings.getDpLang(faultCode, value));
      if (onlyPrior) break;
    }
  }
  return onlyPrior ? labels[0] : labels.join(', ');
};

const { color: ColorUtils } = Utils.ColorUtils;

let sendMusicEnabled = false;

export const musicEnabled = () => {
  sendMusicEnabled = true;
};
export const musicDisabled = () => {
  sendMusicEnabled = false;
};

export const isSendMusicEnabled = () => {
  return sendMusicEnabled;
};

class Parser {
  format(value: string, len = 2) {
    let v = `${value}`;
    if (v.length < len) {
      v = '0'.repeat(len - v.length) + v;
    } else {
      v = v.slice(0, len);
    }
    return v;
  }

  /**
   * @desc 将10进制的hsv转换成16进制的hhsssvvvv
   * 范围为h(0-360) s(0-1000) v(0-1000)
   * @param {Array} hsvArr - [h, s, v]
   *
   * @return {String} 'hhhhssssvvvv'
   *
   */
  encodeColorData(h: number, s: number, v: number): string {
    let hue = h % 360;
    hue = hue > 0 ? hue : h;
    hue = hue < 0 ? 360 + hue : hue;

    return [hue, s, v].reduce((curr: string, next: number) => {
      let hex = parseInt(`${next}`, 10).toString(16);
      hex = this.format(hex, 4);
      return curr + hex;
    }, '');
  }

  // t: time; f: frequence; m: sceneMode=[0,1,2];
  // h: hue; s: saturation; v: lightValue; b: whiteBright; k: kelvin
  encodeSceneData(scenes: SceneValueData[], sceneNum: number) {
    const scenesValue = scenes.reduce((sum: string, seconde: SceneValueData) => {
      const { t, f, m, h = 0, s = 0, v = 0, b = 0, k = 0 } = seconde;
      const tfm = [t, f, m].reduce((total: string, next: number) => {
        let cur = parseInt(`${next}`, 10).toString(16);
        cur = this.format(cur, 2);
        return total + cur;
      }, '');
      const hsvbk = [h, s, v, b, k].reduce((total: string, next: number) => {
        let cur = parseInt(`${next}`, 10).toString(16);
        cur = this.format(cur, 4);
        return total + cur;
      }, '');
      return sum + tfm + hsvbk;
    }, '');
    return this.format(`${sceneNum}`, 2) + scenesValue;
  }

  // m: mode; h: hue; s: saturation; v: lightValue; b: whiteBright; k: kelvin;
  // mode: 0 - 跳变; 1 - 呼吸;
  encodeControlData(m: number, h: number, s: number, v: number, b: number, k: number) {
    const hsvbk = [h, s, v, b, k].reduce((total: string, next: number) => {
      let cur = parseInt(`${next}`, 10).toString(16);
      cur = this.format(cur, 4);
      return total + cur;
    }, '');
    return m + hsvbk;
  }

  // m: mode; h: hue; s: saturation; v: lightValue;
  // mode: 0 - 跳变; 1 - 呼吸;
  encodeSigmeshControlData(m: number, h: number, s: number, v: number) {
    const hsv = [h, s, v].reduce((total: string, next: number, index: number) => {
      let cur = parseInt(`${next}`, 10).toString(16);
      cur = this.format(cur, index === 0 ? 4 : 2);
      return total + cur;
    }, '');
    return `80${hsv}`;
  }

  /**
   * @desc 将16进制的hhsssvvv转换成10进制的hsv
   * 范围为h(0-360) s(0-1000) v(0-1000)
   * @param {String} hsvStr - encoded hsvStr (hhhhssssvvvv)
   *
   * @return {Array} [h, s, v]
   *
   */
  decodeColorData(byte: string) {
    if (!byte || byte.length !== 12) {
      return [0, 1000, 1000];
    }
    const b = byte.match(/[a-z\d]{4}/gi) || [];
    return b.reduce((curr: number[], hex: string) => {
      curr.push(parseInt(hex, 16));
      return curr;
    }, []);
  }

  decodeSceneData(byte: string) {
    if (!byte || (byte.length - 2) % 26 !== 0) {
      return {
        sceneNum: 0,
        scenes: [],
      };
    }
    const sceneNum = byte.slice(0, 2);
    const sceneValueArr = byte.slice(2).match(/[a-z\d]{26}/gi) || [];
    const scenes = sceneValueArr.map((item: string) => {
      const tfm = item.slice(0, 6);
      const [t, f, m] = (tfm.match(/[a-z\d]{2}/gi) || []).map(v => parseInt(v, 16));
      const hsvbk = item.slice(6);
      const [h, s, v, b, k] = (hsvbk.match(/[a-z\d]{4}/gi) || []).map(d => parseInt(d, 16));
      return { t, f, m, h, s, v, b, k };
    });
    return {
      sceneNum: sceneNum,
      scenes,
    };
  }

  updateSceneBright(sceneValue: string, brightness: number) {
    const decodedSceneData = this.decodeSceneData(sceneValue);
    const num = _.get(decodedSceneData, 'sceneNum');
    const scenes = _.get(decodedSceneData, 'scenes') || [];
    const new_scenes = scenes.map(({ t, f, m, h, s, v, b, k }) => {
      let new_v = 0;
      let new_b = 0;
      if (h !== 0 || s !== 0 && v !== 0)
      {
        new_v = v * brightness / 100;
      }
      if (b !== 0 || k !== 0)
      {
        new_b = b * brightness / 100;
      }
      return {
        t, f, m, h, s, v: new_v, b: new_b, k
      };
    });

    const sceneData = ColorParser.encodeSceneData(new_scenes, num as number);
    return sceneData;
  };

  getSceneBright(sceneValue: string) {
    const decodedSceneData = this.decodeSceneData(sceneValue);
    const scenes = _.get(decodedSceneData, 'scenes') || [];
    if (scenes.length > 0) {
      const {h, s, v, b, k} = scenes[0];
      if (h !== 0 || s !== 0 && v !== 0)
      {
        return v;
      }
      else if (b !== 0 || k !== 0)
      {
        return b;
      }
    }
    return 1000;
  };

  bright2Opacity(brightness: number, option = { min: 0.3, max: 1 }) {
    const { min = 0.3, max = 1 } = option;
    return Math.round((min + ((brightness - 10) / (1000 - 10)) * (max - min)) * 100) / 100;
  }

  /**
   * 格式化hsv
   * 亮度将转化为透明度变化
   */
  hsv2rgba(hue: number, saturation: number, bright: number) {
    let color = ColorUtils.hsb2hex(hue, saturation / 10, 100);
    color = new ColorObj(color).alpha(this.bright2Opacity(bright)).rgbString();
    return color;
  }

  rgb2rgba(r: number, g: number, b: number, bright: number) {
    let color = ColorUtils.rgb2hex(r, g, b);
    color = new ColorObj(color).alpha(this.bright2Opacity(bright)).rgbString();
    return color;
  }

  brightKelvin2rgba(bright: number, kelvin: number) {
    let color = ColorUtils.brightKelvin2rgb(1000, kelvin);
    color = new ColorObj(color).alpha(this.bright2Opacity(bright)).rgbString();
    return color;
  }
}

export const ColorParser = new Parser();

export const calcPercent = (start: number, end: number, pos: number, min = 0) => {
  const distance = end - start;
  const diff = pos - start;
  return (diff / distance) * (1 - min) + min;
};

export const calcPosition = (start: number, end: number, percent: number) => {
  const distance = end - start;
  return percent * distance + start;
};

export const randomHsb = () => {
  const random = (min: number, max: number) => {
    let x = max;
    let y = min;
    if (x < y) {
      x = min;
      y = max;
    }
    return Math.random() * (x - y) + y;
  };
  return [random(0, 360), 100, 100];
};

export const arrayToObject = (arr: any[]) => {
  if (arr.length === 0) {
    return {};
  }
  return Object.assign({}, ...arr);
};

export const isCapability = (id: number) => {
  return (TYSdk.devInfo.capability & (1 << id)) > 0; // eslint-disable-line no-bitwise
};

export const parseJSON = (str: string) => {
  let rst;
  if (str && {}.toString.call(str) === '[object String]') {
    // 当JSON字符串解析
    try {
      rst = JSON.parse(str);
    } catch (e) {
      // 出错，用eval继续解析JSON字符串
      try {
        // eslint-disable-next-line
        rst = eval(`(${str})`);
      } catch (e2) {
        // 当成普通字符串
        rst = str;
      }   
    }   
  } else {
    rst = typeof str === 'undefined' ? {} : str;
  }

  return rst;
};

export const getSceneValueOri = (id: string, customScenes) => {
  const v1 = defaultThemeScenes.filter(item => item.value.slice(0,2) === id);
  const v2 = defaultColourfulScenes.filter(item => item.value.slice(0,2) === id);
  const v3 = defaultHolidayScenes.filter(item => item.value.slice(0,2) === id);
  const v4 = customScenes.filter(item => item.value.slice(0,2) === id);
  return v1.length > 0 ? v1[0].value :
          v2.length > 0 ? v2[0].value :
          v3.length > 0 ? v3[0].value :
          v4.length > 0 ? v4[0].value : '';
}

const {
  NumberUtils: { numToHexString },
  CoreUtils: { toFixed },
} = Utils;

export interface LocalGroupTimingData {
  id: number;
  groupId: string;
  state: boolean;
  execuing: boolean;
  loops: string;
  startTime: string;
  endTime: string;
  isColour: boolean;
  h: number;
  s: number;
  b: number;
  t: number;
}

export interface LocalTimingType {
  version: number;
  count: number;
};

export const LOCAL_TIMING_MODE_ADD  = 0;
export const LOCAL_TIMING_MODE_MOD  = 1;
export const LOCAL_TIMING_MODE_DEL  = 2;

export function nToHS(value = 0, num = 2) {
  return numToHexString(value || 0, num);
}

export function sToN(str = '', base = 16) {
  return parseInt(str, base) || 0;
}

export function avgSplit(str = '', num = 1) {
  const reg = new RegExp(`.{1,${num}}`, 'g');
  return str.match(reg) || [];
}

export function toN(n: any) {
  return +n || 0;
}

export function sort(arr: number[]) {
  return arr.sort((a, b) => a - b);
}

/* 将时间从分钟数的字符串HH:MM转换成整型 */
const translateTimeToN = (time: string) => {
  const t = time.split(':');
  return parseInt(t[0]) * 60 + parseInt(t[1]);
};

/* 将时间从分钟数的整型转换成字符串HH:MM */
export const translateTimeToS = (time: number) => {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;
  return `${_.padStart(`${hours}`, 2, '0')}:${_.padStart(`${minutes}`, 2, '0')}`;
}

/* 命令解析器 */
export function* formatterTransform(value: string) {
  let start = 0;
  let result: number | string = '';
  let length;
  while (true) {
    // @ts-ignore wtf
    length = yield result;
    const newStart: number = length > 0 ? start + length : value.length + (length || 0);
    result = length > 0 ? sToN(value.slice(start, newStart)) : value.slice(start, newStart);
    if (newStart >= value.length) break;
    start = newStart;
  }
  return result;
}

/* 解析定时规则列表命令为本地参数 */
export const parseLocalGroupTimingData = (data: string) => {
  if (!data || typeof data !== 'string') {
    console.warn(0, 'dp数据有问题，无法解析', data);
    return [];
  }

  const generator = formatterTransform(data);
  const step = (n?: number) => generator.next(n);
  step();

  const version = toN(step(2).value);
  const count = toN(step(2).value);

  const result = _.times(count, () => {
    const id = toN(step(2).value);

    const stateStr = toFixed(toN(step(2).value).toString(2), 8);
    const state = sToN(stateStr.slice(7, 8), 2) ? true :  false;
    const execuing = sToN(stateStr.slice(6, 7), 2) ? true :  false;

    /* 协议的 bit 0 为周日，bit1 ~ bit 7 为 周一到周六，
     * APP 程序中处理是字符串从左到右是从周日到周六。
     * 因此这里需要做反转处理。
     */
    let loops = toFixed(toN(step(2).value).toString(2), 7).split('').reverse().join('');

    const startTime = translateTimeToS(toN(step(4).value));
    const endTime = translateTimeToS(toN(step(4).value));

    /* 本地定时的协议中 s/v/b/t 的取值是 [0-100]，但程序中统一按取值[0-1000]处理 */
    const h = toN(step(4).value);
    const s = toN(step(2).value) * 10;
    const v = toN(step(2).value) * 10;
    const b = toN(step(2).value) * 10;
    const t = toN(step(2).value) * 10;
    const isColour = v > 0 ? true : false;

    return { id, groupId: '', state, execuing, loops, startTime, endTime, isColour, h, s, t, b: isColour ? v : b };
  });
  return result;
}

/* 根据参数生成添加、修改或删除定时规则的命令字符串 */
export const formatLocalGroupTimingData = (mode: number, data: LocalGroupTimingData) => {
  const version = 1;
  const {
    id,
    state,
    loops,
    startTime,
    endTime,
    isColour,
    h,
    s,
    b,
    t,
  } = data;

  /* 传入的参数是 h 取值 [0-360],s/v/b/t 取值均为 [1-1000]
   * 而本地定时的协议则是s/v/b/t 取值均为 [1-100]
   * 因此这里需要特殊处理。
   */

  /* 协议的 bit 0 为周日，bit1 ~ bit 7 为 周一到周六，
   * APP 程序中处理是字符串从左到右是从周日到周六。
   * 因此这里需要做反转处理。
   */
  const lo = parseInt(loops.split('').reverse().join(''), 2);

  let result = `${nToHS(version)}${nToHS(id)}${nToHS(mode)}`;
  result += `${nToHS(state ? 1 : 0)}${nToHS(lo)}${nToHS(translateTimeToN(startTime), 4)}${nToHS(translateTimeToN(endTime), 4)}`;
  result += `${nToHS(h, 4)}${nToHS(Math.round(s * 0.1))}${nToHS(isColour ? Math.round(b * 0.1) : 0)}${nToHS(isColour ? 0 : Math.round(b * 0.1))}${nToHS(Math.round(t * 0.1))}`;

  //TYSdk.native.simpleTipDialog('formatLocalTimingData: ' + JSON.stringify(data) + ',' + result, () => {});
  return result;
}

/* 根据参数生成所有定时规则列表的命令字符串 */
export const formatLocalTimingListData = (datas: LocalGroupTimingData[]) => {
  const version = 1;
  let result = `${nToHS(version)}${nToHS(datas.length)}`;

  datas.map(({id, state, loops, startTime, endTime, isColour, h, s, t, b}) => {
    const lo = parseInt(loops.split('').reverse().join(''), 2);
    result += `${nToHS(id)}${nToHS(state ? 1 : 0)}${nToHS(lo)}`;
    result += `${nToHS(translateTimeToN(startTime), 4)}${nToHS(translateTimeToN(endTime), 4)}`;
    result += `${nToHS(h, 4)}${nToHS(Math.round(s * 0.1))}${nToHS(isColour ? Math.round(b * 0.1) : 0)}`;
    result += `${nToHS(isColour ? 0 : Math.round(b * 0.1))}${nToHS(Math.round(t * 0.1))}`;
  });

  return result;
}

/* 将 1000% 数转换为色温值，色温范围[2000,7000] */
export const mapTempToKelvin = (v: number) => {
  const kelvin = calcPosition(WHITEPARAM.KELVIN_MIN, WHITEPARAM.KELVIN_MAX, v / 1000);
  return kelvin;
};

/* 将色温值转换为 1000% 数 */
export const mapKelvinToTemp = (v: number) => {
  const temp = calcPosition(0, 1000, (v - WHITEPARAM.KELVIN_MIN) / (WHITEPARAM.KELVIN_MAX - WHITEPARAM.KELVIN_MIN));
  return temp;
};

/* 将白光色温和亮度值转化的rgba颜色数据 */
export const getWhiteKelvinRgba = (kelvin, brightness) => {
  const rgb = Utils.ColorUtils.color.kelvin2rgb(kelvin || 0); 
  const [h, s] = Utils.ColorUtils.color.rgb2hsb(...rgb);
  return ColorParser.hsv2rgba(h, s * 10, brightness);
}


/* 将白光色温和亮度值转化的rgba颜色数据 */
export const getWhiteRgba = (temperature, brightness) => {
  /* 色温显示的颜色太过于暖色调，用户体验不佳，这里转换颜色时，默认转换成增加1000K色温的颜色 */
  let kelvin = mapTempToKelvin(temperature + 0); 
  //kelvin = kelvin > 4500 ? kelvin + 1000 : kelvin;
  const rgb = Utils.ColorUtils.color.kelvin2rgb(kelvin || 0); 
  const [h, s] = Utils.ColorUtils.color.rgb2hsb(...rgb);
  return ColorParser.hsv2rgba(h, s * 10, brightness);
}

/* 将白光色温和亮度值转化的rgba颜色数据 */
export const getColorRgba = (hue, saturation, value) => {
  return ColorParser.hsv2rgba(hue, saturation, value);
}

/* 将白光色温和亮度值转化的rgba颜色数据 */
export const getWhiteRgb = (temperature, brightness) => {
  /* 色温显示的颜色太过于暖色调，用户体验不佳，这里转换颜色时，默认转换成增加1000K色温的颜色 */
  let kelvin = mapTempToKelvin(temperature + 0); 
  //kelvin = kelvin > 4500 ? kelvin + 1000 : kelvin;
  const rgb = Utils.ColorUtils.color.kelvin2rgb(kelvin || 0); 
  const [h, s] = Utils.ColorUtils.color.rgb2hsb(...rgb);
  return ColorUtils.hsb2hex(h, s, brightness / 10);
}

/* 将白光色温和亮度值转化的rgba颜色数据 */
export const getColorRgb = (hue, saturation, value) => {
  return ColorUtils.hsb2hex(hue, saturation / 10, value / 10);
}

export const transTime2Str24 = (v: number) => {
  const hours = Math.floor(v / 60);
  const minutes = v % 60;
  return {
    hour: `${_.padStart(`${hours}`, 2, '0')}`,
    min: `${_.padStart(`${minutes}`, 2, '0')}`
  };
};

export const transTime2Str12 = (v: number) => {
  const hours = Math.floor(v / 60) % 12;
  const minutes = v % 60;
  return {
    hour: `${_.padStart(`${hours === 0 ? 12 : hours}`, 2, '0')}`,
    min: `${_.padStart(`${minutes}`, 2, '0')}`
  };
};

export const transTime2Str12Ampm = (v: number) => {
  return Math.floor(v / 60) < 12 ? 'am' : 'pm';
};

/* 将时间字符串转换成时间数值，5分钟为数值一单位 */
export const transTime2Value24 = (timeStr: string) => {
  const t = timeStr.split(":");
  const hour = parseInt(t[0], 10);
  const min = parseInt(t[1], 10);
  return Math.round(hour * 60 + min);
};
