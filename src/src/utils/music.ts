/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import { NativeModules } from 'react-native';
import _ from 'lodash';
import SupportUtils from './support'
import { Utils, TYSdk } from 'tuya-panel-kit';
import dpCodes from '../config/dpCodes';
import { ColorParser } from '../utils'
import { lampPutDpData } from '../api';

type Type = 'checking' | 'failure' | 'success' | 'close';

const TYNative = TYSdk.native;
const DeviceEvent = TYSdk.DeviceEventEmitter;
const TYPublicNative = NativeModules.TYRCTMusicManager;

const { musicCode } = dpCodes;
let isListening = false;
let isSendEanbled = true;
let timeOutTimer: number;
const listenters: {
  opening?: any;
  failure?: any;
  success?: any;
  close?: any;
} = {};

const fireEvent = (type: Type) => {
  if (listenters[type]) {
    listenters[type].forEach(cb => {
      cb();
    });
  }
};

const handleTimeOut = () => {
  return setTimeout(() => {
    // 10秒内未有音源输入, 调用检测中事件
    fireEvent('checking');
    // 30 秒内没有音源输入，则调用失事件，并主动停止监听
    timeOutTimer = setTimeout(() => {
      close(false);
      fireEvent('failure');
    }, 30000);
  }, 10000);
};

const handleSuccess = _.throttle(() => {
  fireEvent('success');
}, 1000);

export const addListener = (type: Type, cb: any) => {
  // @ts-ignore
  if (!listenters[type]) {
    // @ts-ignore
    listenters[type] = [];
  }
  // @ts-ignore
  listenters[type].push(cb);
};
export const removeListener = (type: Type, cb: any) => {
  // @ts-ignore
  if (listenters[type]) {
    // @ts-ignore
    const index = listenters[type].indexOf(cb);
    if (index >= 0) {
      // @ts-ignore
      listenters[type].splice(index, 1);
    }
  }
};

export const handleAudioRgbChange = _.throttle(
  ({ R, G, B, C: temp, L: bright, index }: any, musicCallback: any) => {
    if (!isListening) {
      return;
    }
    //clearTimeout(timeOutTimer);
    //timeOutTimer = handleTimeOut();
    
    /*
    let hue = 0;
    let saturation = 0;
    let value = 0;
    let brightness = 0;
    let temperature = 0;

    if (SupportUtils.isSupportColour()) {
      [hue, saturation, value] = Utils.ColorUtils.color.rgb2hsb(R, G, B);
    } else {
      // 是否支持白光音乐功能
      if (typeof bright === 'undefined' || typeof temp === 'undefined') {
        return;
      }
      brightness = bright * 10;
      temperature = temp * 10;
      if (!SupportUtils.isSupportTemp()) {
        temperature = 1000;
      }
    }
    */
   
    resetRandomMusicData();
    handleSuccess();
    if (isSendEanbled) {
      musicCallback(index);
    }
  },
  300,
  { leading: false }
);

/**
 * 开启麦克风，并开始监听
 */
export const open = async (musicCallback: any) => {
  if (isListening) {
    return Promise.resolve();
  }
  if (!isSendEanbled) {
    resume();
  } else {
    try {
      musicHandleCb = musicCallback;
      startRandomMusicData();
      DeviceEvent.addListener('audioRgbChange', (musicData: any) =>
        handleAudioRgbChange(musicData, musicCallback)
      );
      // TYSdk.native.simpleTipDialog('Open MIC', () => {});
      // 开启麦克风
      await TYPublicNative.startVoice(
        (d: any) => {
          // 保持屏幕
          TYNative.screenAlwaysOn(true);
          Promise.resolve(d);
        },
        (err: any) => {
          Promise.reject(err);
        }
      );
      isListening = true;
      isSendEanbled = true;
    } catch (e) {
      return Promise.reject(e);
    }
  }
};

/**
 * 关闭麦克风
 */
export const close = async (needFire = true) => {
  if (!isListening) {
    return Promise.resolve();
  }
  isListening = false;
  stopRandomMusicData();
  handleSuccess.cancel();
  handleAudioRgbChange && handleAudioRgbChange.cancel();
  //clearTimeout(timeOutTimer);
  needFire && fireEvent('close');
  isSendEanbled = true;
  try {
    DeviceEvent.removeAllListeners('audioRgbChange');
    // TYSdk.native.simpleTipDialog('Close MIC', () => {});
    // 关掉麦克风
    await TYPublicNative.stopVoice(
      (d: any) => {
        // 关掉保持屏幕
        TYNative.screenAlwaysOn(false);
        Promise.resolve(d);
      },
      (err: any) => {
        Promise.reject(err);
      }
    );
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * 暂停下发
 */
export const pause = () => {
  pauseRandomMusicData();
  handleSuccess.cancel();
  isSendEanbled = false;
};

/**
 * 继续下发
 */
export const resume = () => {
  resumeRandomMusicData();
  isSendEanbled = true;
};

const TIMEOUT_START_TIME = 10000; // 检测到多久没有音频数据后开启随机定时器
const TIMEOUT_INTERVAL = 1000;    // 每隔多久发送一次随机数据
let musicHandleCb;                // 上报数据的回调函数
let randomTimeoutId = -1;         // 定时器的handle
let randomMusicState = false;     // 定时器状态，true为开启运行，false为停止
let randomMusicReset = false;     // 复位定时器的标识位
let randomMusicPause = false;     // 复位定时器的标识位

const randomBrightIndex = () => {
  let x = 9;
  let y = 0;
  return Math.round(Math.random() * (x - y) + y);
};

const randomTimeoutTime = () => {
  let x = 200;
  let y = 1000;
  return Math.round(Math.random() * (x - y) + y);
};

/** 定时器回调函数 */
const handleRandomMusicData = () => {
  let timeout = TIMEOUT_INTERVAL;

  /** 判断是否需要退出定时器，退出定时器不执行操作，定时器依然执行 */
  if (!randomMusicState) {
    timeout = TIMEOUT_START_TIME;
  } else if (randomMusicReset) {    /** 判断是否需要复位定时器，或暂停定时器 */
    randomMusicReset = false;
    timeout = TIMEOUT_START_TIME;
  } else if (!randomMusicPause) {
    timeout = randomTimeoutTime();
    const index = randomBrightIndex();
    //TYSdk.native.simpleTipDialog('random: ' + index, () => {});
    musicHandleCb(index);
  }

  randomTimeoutId = setTimeout(() => {
    handleRandomMusicData();
  }, timeout);
}

/** 一定时间内没有收到MIC的数据，则发送随机数据 */
const startRandomMusicData = () => {
  randomMusicState = true;

  if (randomTimeoutId === -1) {
    randomTimeoutId = setTimeout(() => {
      handleRandomMusicData();
    }, TIMEOUT_START_TIME);
  } else {
    randomMusicReset = true;
  }
}

/** 复位定时器 */
const resetRandomMusicData = () => {
  randomMusicReset = true;
}

/** 暂停定时器 */
const pauseRandomMusicData = () => {
  randomMusicPause = true;
}

/** 恢复定时器 */
const resumeRandomMusicData = () => {
  randomMusicPause = false;
}

/** 停止定时器 */
const stopRandomMusicData = () => {
  randomMusicState = false;
}