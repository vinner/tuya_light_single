/* eslint-disable max-len */
import Strings from '../i18n';

// 主题场景参数- 默认为静态
export const defaultThemeScenes = [
  {
    name: Strings.getDpLang('scene_data_night'),
    value: '000e0d0000000000000000c803e8',
  },
  {
    name: Strings.getDpLang('scene_data_reading'),
    value: '010e0d0000000000000003e803e8',
  },
  {
    name: Strings.getDpLang('scene_data_work'),
    value: '020e0d00000000000000032003e8',
  },
  {
    name: Strings.getDpLang('scene_data_relaxation'),
    value: '030e0d0000000000000001f403e8',
  },
];

/* 假日场景参数 */
export const defaultHolidayScenes = [
  {
    name: Strings.getDpLang('scene_data_0'),
    value: '06464602007803e803e800000000464602007803e8000a00000000',
  },
  {
    name: Strings.getDpLang('scene_data_1'),
    value:
      '07464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000464601003d03e803e80000000046460100ae03e803e800000000464601011303e803e800000000',
  },
  {
    name: Strings.getDpLang('scene_data_2'),
    value: '08464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000',
  },
  {
    name: Strings.getDpLang('scene_data_3'),
    value:
      '09464602000003e803e800000000464602007803e803e80000000046460200f003e803e800000000464602003d03e803e80000000046460200ae03e803e800000000464602011303e803e800000000',
  },
  {
    name: Strings.getDpLang('scene_data_4'),
    value: '0a464602007803e803e800000000464602007803e8000a00000000',
  },
  {
    name: Strings.getDpLang('scene_data_5'),
    value:
      '0b464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000464601003d03e803e80000000046460100ae03e803e800000000464601011303e803e800000000',
  },
];

/* 多彩场景参数 */
export const defaultColourfulScenes = [
  {
    name: Strings.getDpLang('scene_data_0'),
    value: '0c464602007803e803e800000000464602007803e8000a00000000',
  },
  {
    name: Strings.getDpLang('scene_data_1'),
    value:
      '0d464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000464601003d03e803e80000000046460100ae03e803e800000000464601011303e803e800000000',
  },
  {
    name: Strings.getDpLang('scene_data_2'),
    value: '0e464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000',
  },
  {
    name: Strings.getDpLang('scene_data_3'),
    value:
      '0f464602000003e803e800000000464602007803e803e80000000046460200f003e803e800000000464602003d03e803e80000000046460200ae03e803e800000000464602011303e803e800000000',
  },
  {
    name: Strings.getDpLang('scene_data_4'),
    value: '10464602007803e803e800000000464602007803e8000a00000000',
  },
  {
    name: Strings.getDpLang('scene_data_5'),
    value:
      '11464601000003e803e800000000464601007803e803e80000000046460100f003e803e800000000464601003d03e803e80000000046460100ae03e803e800000000464601011303e803e800000000',
  },
];

// 自定义场景参数 - 默认为空（只在只有白光的时候使用）
export const defaultCustomScenes = [
  {
    name: Strings.getDpLang('scene_data_diy_0'),
    value: '61646403000000000000000003e8646403000000000000026203e8',
  },
  {
    name: Strings.getDpLang('scene_data_diy_1'),
    value: '623a3a02000000000000000003e83a3a02000000000000032a03e8',
  },
  {
    name: Strings.getDpLang('scene_data_diy_2'),
    value: '63464601000000000000000003e846460100000000000002c603e8',
  },
  {
    name: Strings.getDpLang('scene_data_diy_3'),
    value: '640e0d0000000000000003e803e8',
  },
];

export default {
  cloudState: {
    themeScenes: defaultThemeScenes,
    holidayScenes: defaultHolidayScenes,
    colourfulScenes: defaultColourfulScenes,
    customScenes: defaultCustomScenes,
    sceneDatas: [...defaultCustomScenes],
    sceneBright: 100,
    singleTimer: [],
    singleColors: '',
    groupColors: [],
    lightColors: '',
    diyScenes: [],
  },
};
