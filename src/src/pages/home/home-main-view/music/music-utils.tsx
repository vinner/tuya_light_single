/* eslint-disable @typescript-eslint/no-empty-function */
import { lampPutDpData } from '../../../../api';
import DpCodes from '../../../../config/dpCodes';
import { nToHS } from '../../../../utils';
import * as MusicManager from '../../../../utils/music';
import { Dialog, TYSdk, } from 'tuya-panel-kit';
import Strings from '../../../../i18n';
import { AppMusicColors } from './music-config';

const { workModeCode, musicCode } = DpCodes;

/** 格式化生成音乐变化命令 */
const formatMusicData = (index: number, id: number) => {
  const { mode, colorArea } = AppMusicColors[id];
  let hue = 0;
  let saturation = 0;
  let value = 0;
  let bright = 0;
  let temp = 0;

  if (colorArea) {
    colorArea.forEach(({ area, isColour, h, s, t, b }: any) => {
      const [left, right] = area;
      if (index >= left && index <= right) {
        if (isColour) {
          hue = h;
          saturation = s;
          value = b;
          bright = 0;
          t = 0;
        } else {
          hue = 0;
          saturation = 0;
          value = 0;
          bright = b;
          temp = t;
        }
      }
    });
  }
  return `${nToHS(mode, 1)}${nToHS(hue, 4)}${nToHS(saturation, 4)}${nToHS(value, 4)}${nToHS(bright, 4)}${nToHS(temp, 4)}`;
}

/* 开启定时器来开启MIC，避免快速操作界面时反复执行MIC关闭又开启的动作 */
let musicPlayId = -1;

/* 开启音乐律动功能 */
export const musicPlay = (id: number) => {
  musicPlayId >= 0 && clearTimeout(musicPlayId);
  musicPlayId = setTimeout(() => handleMusicPlay(id), 500);
};

/* 关闭音乐律动功能 */
export const musicStop = () => {
  musicPlayId >= 0 && clearTimeout(musicPlayId);
  MusicManager.close();
}

/** 开启音乐律动功能的执行函数 */
const handleMusicPlay = async (id: number) => {
  /** 先关闭MIC */
  await MusicManager.close();

  /** 切换工作模式为 Music */
  lampPutDpData({ [workModeCode]: 'music' });

  /** 开启MIC */
  try {
    await MusicManager.open((index: number) => {
      //TYSdk.native.simpleTipDialog('music: ' + index, () => {});
      const data = formatMusicData(index, id);
      lampPutDpData({ [musicCode]: data });
    });
  } catch (err) {
    Dialog.alert({
      title: Strings.getLang('open_mike_failure'),
      subTitle: Strings.getLang('open_mike_error'),
      confirmText: Strings.getLang('confirm'),
      onConfirm: () => {
        Dialog.close();
        // updateUi({ voiceStatus: VoiceStatus.NONE });
      },
    });
  }
}
