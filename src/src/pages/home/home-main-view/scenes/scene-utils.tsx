/* eslint-disable @typescript-eslint/no-empty-function */
import _ from 'lodash';
import throttle from 'lodash/throttle';
import { TYSdk } from 'tuya-panel-kit';
import Res from '../../../../res';
import { lampPutDpData, saveDiyScenes, saveSceneBright } from '../../../../api';
import DpCodes from '../../../../config/dpCodes';
import { ColorParser, nToHS, sToN, avgSplit } from '../../../../utils';
import { defaultThemeScenes, defaultHolidayScenes, defaultColourfulScenes } from '../../../../config/scenes';
import { SCENE_ENTRY, scene_datas_life, scene_datas_weather, scene_datas_festival, scene_datas_diy } from './scene-config';
import { translateSToLimit } from '../dimmer/dimmer-utils';

const { sceneCode: sceneValueCode, controlCode: controlDataCode, } = DpCodes;
const CUSTOM_ID_OFFSET = 0x61;
let sLimit: boolean = false;

export const setSLimit = (limit: boolean) => {
  sLimit = limit;
}

/* 获取场景的图片资源 */
export const getScenePic = (id: string) => {
  const num = parseInt(id, 16);
  if (num >= CUSTOM_ID_OFFSET)
  {
    const id = num - CUSTOM_ID_OFFSET;
    const picSource = Res[`dp_scene_custom_${id}`] || Res.dp_scene_custom_0;
  return picSource;
  }
  else
  {
    const id = num % 9;
    const picSource = Res[`dp_scene_data_${id}`] || Res.dp_scene_data_0;
    return picSource;
  }
};

/* 判断当前是否处于可编辑状态 */
export const isEditDisable = (id: string) => {
  return parseInt(id, 16) < CUSTOM_ID_OFFSET;
};

/* 判断自定义场景的数量是否已满，是否还可以新增场景 */
export const isAddSceneDisable = (customScenes) => {
  const datas = getCustomDataSourceOrigin(customScenes);
  const isAddDisable= datas.length <= 0;
  const customSceneValue = isAddDisable ? '' : datas[0].value;
  return { isAddDisable, customSceneValue};
};

/* 自定义场景列表数据，用户可编辑 */
export const getCustomDataSource = (customScenes) => {
  const datas = [...customScenes].filter(
    v => !!v
  );

  datas.sort((a, b) => {
    if ((a.value.length <= 2 && b.value.length <= 2) ||
      (a.value.length > 2 && b.value.length > 2)) {
        return 0;
    } else if (b.value.length > 2) {
      return 1;
    } else {
      return -1;
    }
  });
  return datas;
};

/* 自定义场景列表中未定义的数据，用户可编辑 */
const getCustomDataSourceOrigin = (customScenes) => {
  const datas = [...customScenes].filter(
    v => !!v && v.value.length <= 2
  );
  return datas;
};

/* 主题场景使用默认的，用户不可编辑 */
export const getThemeDataSource = () => {
  let defaultSceneData = defaultThemeScenes; // 五路
  const datas = [...defaultSceneData].filter(
    v => !!v
  );
  return datas;
};

/* 多彩场景使用默认的，用户不可编辑 */
export const getColourfulDataSource = () => {
  const datas = [...defaultColourfulScenes].filter(
    v => !!v
  );
  return datas;
};

/* 假日场景使用默认的，用户不可编辑 */
export const getHolidayDataSource  = () => {
  const datas = [...defaultHolidayScenes].filter(
    v => !!v
  );
  return datas;
};

const putControlDataDP = throttle((h: number, s: number, v: number, b: number, t: number) => {
  if (!controlDataCode) {
    return;
  }
  const encodeControlData = ColorParser.encodeControlData(1, h, s, v, b, t);
  lampPutDpData({ [controlDataCode]: encodeControlData });
}, 150);

export const sceneChange = (bright: number, sceneValue) => {
  /* 拿到第一个颜色数据 */
  let hsvbk = sceneValue.slice(8);
  let [h, s, v, b, k] = (hsvbk.match(/[a-z\d]{4}/gi) || []).map(d => parseInt(d, 16));

  v = (h === 0 && s === 0 && v === 0) ? 0 : v * bright / 100;
  b = (b === 0 && k === 0) ? 0 : b * bright / 100;

  putControlDataDP(h, s, v, b, k);
};

export const sceneComplete = (bright: number, sceneValue) => {
  if (typeof putControlDataDP.cancel === 'function') {
    putControlDataDP.cancel();
  }
  saveSceneBright(bright.toString());
  const sceneData = ColorParser.updateSceneBright(sceneValue, bright);
  lampPutDpData({
    [sceneValueCode]: sceneData
  });
};

export interface COLOR_DATA {
  isColour: boolean;
  h: number;
  s: number;
  t: number;
  b: number;
}

export interface SCENE_DATA {
  version: number;
  id: number;
  mode: number;
  interval: number;
  time: number;
  colors: COLOR_DATA[];
}

export const lampSceneValue = (data: SCENE_DATA) => {
  const result = formatSceneValueForLamp(data);
  //TYSdk.native.simpleTipDialog('scene: ' + result, () => {})
  lampPutDpData({ [sceneValueCode] : result });
}

export const formatSceneValue = (data: SCENE_DATA) => {
  if (data.colors.length <= 0) {
    return '';
  }

  const { id, mode, interval, time, colors } = data;
  let result = `${nToHS(id)}`;

  result += `${colors.map(({ isColour, h, s, t, b }) => {
    let res = `${nToHS(interval)}${nToHS(time)}${nToHS(mode)}`;
    res += isColour ? `${nToHS(h, 4)}${nToHS(s, 4)}${nToHS(b, 4)}00000000`
            : `000000000000${nToHS(b, 4)}${nToHS(t, 4)}`;
    return res;
  }).join('')}`;
  return result;
}

export const formatSceneValueForLamp = (data: SCENE_DATA) => {
  if (data.colors.length <= 0) {
    return '';
  }

  const { id, mode, interval, time, colors } = data;
  let result = `${nToHS(id)}`;

  /** 由于模组端固件有Bug，在mode为0时，若配色是白光，则会导致灯不亮。
   *  为了规避该问题，在上述模式+配色的情况下，转换成mode为1，加上两个相同配色。
   *  使用两个相同的白光配色，用跳变的方式，来达到白光常亮的场景。
   *  影响的场景是： life 中的前4个场景。
   */
  /**
   * LSWW-001存在RGB混光时功率过大的问题，所以需要对颜色数据的饱和度做转换
   */
  if (mode === 0 && !colors[0].isColour) {
    const { b, t } = colors[0];
    result += `${nToHS(interval)}${nToHS(time)}${nToHS(1)}000000000000${nToHS(b, 4)}${nToHS(t, 4)}`;
    result += `${nToHS(interval)}${nToHS(time)}${nToHS(1)}000000000000${nToHS(b, 4)}${nToHS(t, 4)}`;
  } else {
    result += colors.map(({ isColour, h, s, t, b }) => {
      let res = `${nToHS(interval)}${nToHS(time)}${nToHS(mode)}`;

      if (isColour) {
        const newS = sLimit ? translateSToLimit(h, s) : s;
        res += `${nToHS(h, 4)}${nToHS(newS, 4)}${nToHS(b, 4)}00000000`;
      } else {
        res += `000000000000${nToHS(b, 4)}${nToHS(t, 4)}`;
      }
      return res;
    }).join('');
  }

  //TYSdk.native.simpleTipDialog('scene: ' + result.length + ',' + result + ']]]', () => {});
  return result;
}


export const parseSceneValue = (str: string) => {
  if (!str || typeof str !== 'string') {
    return;
  }

  const id = sToN(str.slice(0, 2));
  let time = 0;
  let interval = 0;
  let mode = 0;
  const colors: COLOR_DATA[] = [];

  avgSplit(str.slice(2), 26).forEach(n => {
    if (n.length < 26) return;

    interval = sToN(n.slice(0, 2));
    time = sToN(n.slice(2, 4));
    mode = sToN(n.slice(4, 6));

    const h = sToN(n.slice(6, 10));
    const s = sToN(n.slice(10, 14));
    const v = sToN(n.slice(14, 18));
    const b = sToN(n.slice(18, 22));
    const t = sToN(n.slice(22, 26));
    const isColour = v !== 0 ? true : false;
    colors.push({isColour, h, s, t, b: isColour ? v : b});
  });

  return {
    version: 0,
    id,
    mode,
    interval,
    time,
    colors,
  };
}

export const parseCloudDiyScenes = (diyScenes) => {
  const cnt = scene_datas_diy.length;
  const res = _.times(cnt, i => {
    if (i < diyScenes.length) {
      const v = parseSceneValue(diyScenes[i].value);
      return {
        image: scene_datas_diy[i].image,
        title: diyScenes.title || scene_datas_diy[i].title,
        value: v || scene_datas_diy[i].value,
      }
    } else {
      return scene_datas_diy[i];
    }
  });

  //TYSdk.native.simpleTipDialog('parse: ' + JSON.stringify(diyScenes) + '; ' + JSON.stringify(res), () => {});
  return res;
}

export const saveCloudDiyScene = (diyScenes: SCENE_ENTRY[]) => {
  const res = diyScenes.map(d => {
    return {
      title: d.title,
      value: formatSceneValue(d.value),
    }
  });
  //TYSdk.native.simpleTipDialog('save: ' + JSON.stringify(diyScenes) + '; ' + JSON.stringify(res), () => {});
  saveDiyScenes(res)
}

export const getSceneValueId = (str: string) => {
  const v = parseSceneValue(str);
  return v ? v.id : -1;
}

export const tabDatas = [
  { key: 'life',     title: 'Life', datas: scene_datas_life },
  { key: 'nature',  title: 'Nature', datas: scene_datas_weather },
  { key: 'celebrations', title: 'Celebrations', datas: scene_datas_festival },
  { key: 'diy',      title: 'DIY', datas: scene_datas_diy },
];

export const getSceneDatasByTab = (tab: string) => {
  const res = tabDatas.filter(t => t.key === tab);
  if (res && res.length > 0) {
    return res[0];
  }
  return tabDatas[0];
}

export const getSceneTabKeyById = (id: number) => {
  let tab = tabDatas[0].key;

  tabDatas.map(t => {
    const r = t.datas.filter(d => d.value.id === id);
    if (r && r.length > 0) {
      tab = t.key;
    }
  });

  return tab;
}
