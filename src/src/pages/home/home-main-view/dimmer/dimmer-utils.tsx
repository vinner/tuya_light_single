import _, { } from 'lodash';
import throttle from 'lodash/throttle';
import { lampPutDpData, saveSingleColors, saveGroupColors, saveLightColors } from '../../../../api';
import DpCodes from '../../../../config/dpCodes';
import { ColorParser, SceneValueData, avgSplit, sToN, nToHS, calcPercent, calcPosition } from '../../../../utils';
// @ts-ignore
import { Utils, TYSdk, GlobalToast } from 'tuya-panel-kit';
import { MY_COLORS_DATA, GROUP_COLORS_CNT_MAX } from './my-colors';
import icons from '../../../../res/iconfont';
import { WORKMODE } from '../../../../config';
import { PixelRatio } from 'react-native';

const {
  controlCode: controlDataCode,
  sceneCode: sceneValueCode,
  colourCode,
  brightCode,
  temperatureCode,
 } = DpCodes;

const {
  CoreUtils: { toFixed },
} = Utils;

const {
  convertX: cx,
  winWidth,
  winHeight,
} = Utils.RatioUtils;


export interface COLOR_DATA {
  isColour: boolean;
  h: number;
  s: number;
  b: number;
  t: number;
};

interface WHITE_PARAMS {
  title: string;
  id: string;
  mode: number;
  default: number;
  datas: SceneValueData[];
};

const S_LIMIT = [
  {h: 0,   sMin: 360, sMax: 1000},
  {h: 60,  sMin: 800, sMax: 1000},
  {h: 120, sMin: 360, sMax: 1000},
  {h: 180, sMin: 600, sMax: 1000},
  {h: 240, sMin: 300, sMax: 1000},
  {h: 300, sMin: 700, sMax: 1000},
  {h: 360, sMin: 360, sMax: 1000},
]

export const BAISC_WHITES_PARAMS: WHITE_PARAMS[] = [
  {
    title: 'Twinkle',
    id: '72',
    mode: 1,
    default: 71,
    datas: [
      { h: 0, s: 0, v: 0, b: 700, k: 1000, m: 1, f: 80, t: 80, },
      { h: 0, s: 0, v: 0, b: 0,   k: 1000, m: 1, f: 80, t: 80, },
    ],
  },
  {
    title: 'Breathing',
    id: '73',
    mode: 2,
    default: 81,
    datas: [
      { h: 0, s: 0, v: 0, b: 800, k: 1000, m: 2, f: 70, t: 70, },
      { h: 0, s: 0, v: 0, b: 1,   k: 1000, m: 2, f: 70, t: 70, },
    ],
  },
  {
    title: 'Bright',
    id: '71',
    mode: 0,
    default: 100,
    datas: [
      { h: 0, s: 0, v: 0, b: 1000, k: 1000, m: 0, f: 50, t: 50, },
    ],
  }];


/* 发送控制数据包 */
export const putControlDataDP = throttle((h: number, s: number, v: number, b: number, t: number) => {
  if (!controlDataCode) {
    return;
  }

  if (v > 0) {
    const encodeControlData = ColorParser.encodeControlData(1, h, s, v, b, t);
    lampPutDpData({ [controlDataCode]: encodeControlData });  
  } else {
    const encodeControlData = ColorParser.encodeControlData(1, h, s, v, b, t);
    lampPutDpData({ [controlDataCode]: encodeControlData });  
  }
}, 150);


/* 控制白光用于预览 */
export const handleWhiteBrightChange = (b: number) => {
  putControlDataDP(0, 0, 0, b, 1000);
};

/* 亮度条亮度完成变化的回调函数 */
export const handleBrightChange = (value: number) => {
  const bright = Math.round(value * 10);
  handleWhiteBrightChange(bright);
};

export const saveCloudSingleColor = (cs: COLOR_DATA[]) => {
  let result: string = '';
  cs.map(c => {
    result += c.isColour ? '1' : '0';
    result += `${nToHS(c.h, 3)}${nToHS(c.s, 3)}${nToHS(c.t, 3)}${nToHS(c.b, 3)}`
  })

  if (result.length === 0) {
    result += '0';
  }
  saveSingleColors(result);
}

export const parseCloudSingleColors = (str: string = '') => {
  let colors: COLOR_DATA[] = [];

  if (!str || typeof str !== 'string') {
    return colors;
  }

  avgSplit(str, 13).forEach(v => {
    if (v.length < 13) return;

    const isColour = v.slice(0, 1) === '0' ? false : true;
    const h = sToN(v.slice(1, 4));
    const s = sToN(v.slice(4, 7));
    const t = sToN(v.slice(7, 10));
    const b = sToN(v.slice(10, 13));
    colors.push({isColour, h, s, t, b});
  });

  //TYSdk.native.simpleTipDialog('single: ' + JSON.stringify(colors), () => {});
  return colors;
}

export const saveCloudGroupColors = (cs: MY_COLORS_DATA[]) => {
  let result: string[] = [];

  cs.map(c => {
    const n = Math.min(c.data.length, c.stops.length);
    let str = '';

    _.times(n, i => {
      str += c.data[i].isColour ? '1' : '0';
      str += `${nToHS(c.data[i].h, 3)}${nToHS(c.data[i].s, 3)}${nToHS(c.data[i].t, 3)}${nToHS(c.data[i].b, 3)}`
      str += `${nToHS(Math.ceil(c.stops[i]), 2)}`
    })

    str += `${nToHS(c.lightCnt, 2)}`
    result.push(str);
  })

  //TYSdk.native.simpleTipDialog('p: ' + JSON.stringify(cs) + ',' + result, () => {});
  saveGroupColors(result, GROUP_COLORS_CNT_MAX);
}

export const parseCloudGroupColors = (lightStrs: string[] = []) => {
  let colors: MY_COLORS_DATA[] = [];

  lightStrs.map(str => {
    if (!str || typeof str !== 'string') {
      return;
    }

    let data: COLOR_DATA[] = [];
    let stops: number[] = [];

    avgSplit(str, 15).forEach(v => {
      if (v.length < 15) return;

      const isColour = v.slice(0, 1) === '0' ? false : true;
      const h = sToN(v.slice(1, 4));
      const s = sToN(v.slice(4, 7));
      const t = sToN(v.slice(7, 10));
      const b = sToN(v.slice(10, 13));
      const n = sToN(v.slice(13, 15));
      data.push({isColour, h, s, t, b});
      stops.push(n);
    });

    let lightCnt: number = sToN(str.slice(str.length - 2, str.length));
    if (data.length > 0) {
      colors.push({data, stops, lightCnt});
    }
  })

  //TYSdk.native.simpleTipDialog('p: ' + JSON.stringify(colors) + ',' + lightStrs, () => {});
  return colors;
}

export const saveCloudLightColors = (cs: COLOR_DATA[]) => {
  let lightStr = '';
  cs.map(c => {
    c.isColour ? lightStr += '1' : lightStr += '0';
    lightStr += `${nToHS(c.h, 3)}${nToHS(c.s, 3)}${nToHS(c.t, 3)}${nToHS(c.b, 3)}`;
  });
  saveLightColors(lightStr);
}

export const parseCloudLightColors = (lightStr = '', cnt: number) => {
  const defaultColor: COLOR_DATA = {isColour: true, h: 100, s: 500, t: 0, b: 1000};
  const colors: COLOR_DATA[] = new Array(cnt).fill(defaultColor);

  if (!lightStr || typeof lightStr !== 'string') {
    return colors;
  }

  let id = 0;
  avgSplit(lightStr, 13).forEach(v => {
    if (v.length < 13 || id >= cnt) return;

    const isColour = v.slice(0, 1) === '0' ? false : true;
    const h = sToN(v.slice(1, 4));
    const s = sToN(v.slice(4, 7));
    const t = sToN(v.slice(7, 10));
    const b = sToN(v.slice(10, 13));
    colors[id] = {isColour, h, s, t, b};
    id ++;
  });
  return colors;
}

/** 调光器模式 */
export enum DimmerMode {
  white = 0,
  colour,
  colourCard,
  combination,
}

export enum SmearMode {
  all = 0,
  single,
  clear,
}

export const parseDpLightColor = (val: string) => {
  const defaultColor = {isColour: false, h: 0, s: 0, t: 0, b: 0};
  if (!val || typeof val !== 'string') {
    return defaultColor;
  }
  const dimmerMode = parseInt(val.slice(2, 4));

  if (dimmerMode === DimmerMode.white) {
    const isColour =  false;
    const b = parseInt(val.slice(10, 14), 16);
    const t = parseInt(val.slice(14, 18), 16);
    return {isColour, h: 0, s: 0, t, b};
  } else if (dimmerMode === DimmerMode.colour || dimmerMode === DimmerMode.colourCard) {
    const isColour =  true;
    const h = parseInt(val.slice(10, 14), 16);
    const s = parseInt(val.slice(14, 18), 16);
    const b = parseInt(val.slice(18, 22), 16);
    return {isColour, h, s, t: 0, b};
  } else {
    return defaultColor;
  }
}

export const formatDpLightsColor = (c: COLOR_DATA, selected: boolean[], ledNumber: number, smearMode: number) => {
  const version = 0;
  const effect = 0;
  const dimmerMode = c.isColour ? DimmerMode.colour : DimmerMode.white;
  const singleType = 1;

  let result = `${nToHS(version)}${nToHS(dimmerMode)}${nToHS(
    dimmerMode === DimmerMode.white ? 0 : effect
  )}${nToHS(ledNumber)}`;

  if (dimmerMode === DimmerMode.white) {
    /** 白光 */
    result += `${nToHS(smearMode)}${nToHS(c.b, 4)}${nToHS(c.t, 4)}`;

    if ([SmearMode.single, SmearMode.clear].includes(smearMode)) {
      const quantity = selected.filter(s => s === true).length;
      const singleDataStr = `${nToHS(
        parseInt(`${singleType}${toFixed(quantity.toString(2), 7)}`, 2)
      )}`;

      let indexsStr = '';
      _.times(Math.min(selected.length, ledNumber), i => {
        if (selected[i] === true) {
          indexsStr += nToHS(i + 1);
        }
      })

      result += `${singleDataStr}${indexsStr}`;
    }
  } else if ([DimmerMode.colour, DimmerMode.colourCard].includes(dimmerMode)) {
    /** 彩光/色卡 */
    result += `${nToHS(smearMode)}${nToHS(c.h, 4)}${nToHS(c.s, 4)}${nToHS(c.b, 4)}`;

    if ([SmearMode.single, SmearMode.clear].includes(smearMode)) {
      const quantity = selected.filter(s => s === true).length;
      const singleDataStr = `${nToHS(
        parseInt(`${singleType}${toFixed(quantity.toString(2), 7)}`, 2)
      )}`;

      let indexsStr = '';
      _.times(Math.min(selected.length, ledNumber), i => {
        if (selected[i] === true) {
          indexsStr += nToHS(i + 1);
        }
      })
      result += `${singleDataStr}${indexsStr}`;
    }
  }
  return result;
}

/** 发送彩光、白光的参数 */
export const lampPutDpLightColor = (c: COLOR_DATA) => {
  if (typeof putControlDataDP.cancel === 'function') {
    putControlDataDP.cancel();
  }

  const { isColour, h, s, t, b } = c;
  if (isColour) {
    const encodeColor = ColorParser.encodeColorData(h, s, b);
    lampPutDpData({ [colourCode]: encodeColor });
  } else {
    lampPutDpData({ [brightCode]: Math.round(b), [temperatureCode]: Math.round(t) });
  }
}

const setFontSize = (size) => {
  const scaleWidth = winWidth / 375;
  const scaleHeight = winHeight / 812;
  const pixelRatio = PixelRatio.get();
  const fontScale = PixelRatio.getFontScale();
  const scale = Math.min(scaleWidth, scaleHeight);
  const s = Math.round((size * scale + 0.5) * pixelRatio / fontScale);

  //TYSdk.native.simpleTipDialog('toast: ' + pixelRatio + ',|' + fontScale + '|,' + scaleWidth + ',' + scaleHeight, () => {});
  return Math.round(s / pixelRatio);
}

export const showGlobalToast = (text: string, error: boolean) => {
  const size = setFontSize(14);
  GlobalToast.show({
    text,
    d: error ? icons.error2 : icons.check2,
    contentStyle:{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EDEDED',
      width: '80%',
      height: cx(54),
      borderRadius: cx(27),
    },
    textStyle: {
      fontSize: size,
      color: '#020914',
      lineHeight: size + 3,
      marginTop: 0,
      paddingTop: 0,
      marginLeft: cx(7),
    },
    size: cx(17),
    color: error ? '#ff3f33' : '#00AD3C',
    show: true,
    onFinish: GlobalToast.hide,
  });
}

/** 从DP参数中解析出当前的颜色值 */
export const genDefaulColor = (workMode: string, colorData: string, bright: number, temp: number) => {
  const isColour = workMode === WORKMODE.WHITE ? false : true;
  const [hue, saturation, brightness] = ColorParser.decodeColorData(colorData);
  return {
    isColour,
    h: hue,
    s: saturation,
    t: temp,
    b: isColour ? brightness : bright,
  }
}

/** LSWS-001 在RGB全亮时会出现功率超过最大功率限制的问题，
 *  因此加入饱和度的限制，以此达到控制最大功率的目的。
 */
export const translateSToLimit = (h: number, s: number) => {
  let match = false;
  let index_start = 0;
  let index_end = 0;

  S_LIMIT.map((limit, i) => {
    if (!match) {
      if (limit.h === h) {
        index_start = i;
        index_end = i;
        match = true;
      } else if (limit.h > h) {
        index_start = i - 1;
        index_end = i;
        match = true;
      }
    }
  })

  if (index_start === index_end) {
    const newS = calcPosition(S_LIMIT[index_start].sMin, S_LIMIT[index_start].sMax, s/1000);
    return Math.ceil(newS);
  } else {
    const p = calcPercent(S_LIMIT[index_start].h, S_LIMIT[index_end].h, h);
    const newSMin = calcPosition(S_LIMIT[index_start].sMin, S_LIMIT[index_end].sMin, p);
    const newSMax = calcPosition(S_LIMIT[index_start].sMax, S_LIMIT[index_end].sMax, p);
    const newS = calcPosition(newSMin, newSMax, s/1000);
  
    //if (newS < 0 || newS > 1000)
    // TYSdk.native.simpleTipDialog('translateSToLimit: ' + h + ',' + s + ',' + index_start + ','+ index_end +','+ p +','+newSMin + ',' + newSMax + ',' + newS, () => {});
    return Math.ceil(newS);
  }
}

/** LSWS-001 在RGB全亮时会出现功率超过最大功率限制的问题，
 *  因此加入饱和度的限制，以此达到控制最大功率的目的。
 */
export const translateSToOriginal = (h: number, s: number) => {
  let match = false;
  let index_start = 0;
  let index_end = 0;

  S_LIMIT.map((limit, i) => {
    if (!match) {
      if (limit.h === h) {
        index_start = i;
        index_end = i;
        match = true;
      } else if (limit.h > h) {
        index_start = i - 1;
        index_end = i;
        match = true;
      }
    }
  })

  if (index_start === index_end) {
    const newS = calcPercent(S_LIMIT[index_start].sMin, S_LIMIT[index_start].sMax, s) * 1000;
    //TYSdk.native.simpleTipDialog('Trans: ' + h + ',' + s + ',' + index_start + ',' + newS, () => {});
    return (newS < 0 ? 0 : newS > 1000 ? 1000 : Math.ceil(newS));
  } else {
    const p = calcPercent(S_LIMIT[index_start].h, S_LIMIT[index_end].h, h);
    const newSMin = calcPosition(S_LIMIT[index_start].sMin, S_LIMIT[index_end].sMin, p);
    const newSMax = calcPosition(S_LIMIT[index_start].sMax, S_LIMIT[index_end].sMax, p);
    const newS = calcPercent(newSMin, newSMax, s) * 1000;
  
    //if (newS < 0 || newS > 1000)
    //  TYSdk.native.simpleTipDialog('translateSToOriginal: ' + h + ',' + s + ',' + newSMin + ',' + newSMax + ',' + newS, () => {});
    return (newS < 0 ? 0 : newS > 1000 ? 1000 : Math.ceil(newS));
  }
}

/** 通过功能等级判断是否需要对饱和度做限制，功能等级小于 1.0.5 的需要添加饱和度限制，大于则不需要 */
export const detectSLimit = (funcLevel: string) => {
  if (!funcLevel || funcLevel === '') {
    return true;
  }

  let res = false;
  const v = funcLevel.split('.');
  if (v.length !== 3) {
    res = true;
  } else {
    const v1 = parseInt(v[0]);
    const v2 = parseInt(v[1]);
    const v3 = parseInt(v[2]);
    if (v1 <= 1 && v2 <= 0 && v3 <= 5) {
      res = true;
    }
  }
  return res;
}