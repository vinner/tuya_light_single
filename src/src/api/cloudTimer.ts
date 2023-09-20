import { TYSdk, Utils } from 'tuya-panel-kit';
import { parseJSON } from '../utils';
import _ from 'lodash';
const { TimeUtils } = Utils;

/**
 * 添加定时
 * 支持群组定时
 */
const addTimer = (params: any) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = TYSdk.devInfo;
    const defaultParams = {
      bizId: devGroupId || devId,
      bizType: devGroupId ? 1 : 0,
      timeZone: TimeUtils.timezone(),
      isAppPush: false,
      actionType: devGroupId ? 'device_group' : 'device',
      options: {},
    };
    const postData = { ...defaultParams, ...params };
    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.add',
        postData,
        v: '4.0',
      },
      (d: any) => {
        const data = parseJSON(d);
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
};

/**
 * 更新定时
 * 支持群组定时
 */
const updateTimer = (params: any) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = TYSdk.devInfo;
    const defaultParams = {
      bizId: devGroupId || devId,
      bizType: devGroupId ? 1 : 0,
      timeZone: TimeUtils.timezone(),
      isAppPush: false,
      actionType: devGroupId ? 'device_group' : 'device',
      options: {},
    };
    const postData = { ...defaultParams, ...params };
    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.update',
        postData,
        v: '4.0',
      },
      (d: any) => {
        const data = parseJSON(d);
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
};

const updateTimerStatus = (category: string, groupId: string, status: number, devInfo?: any) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = devInfo || TYSdk.devInfo;
    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.status.update',
        postData: {
          type: devGroupId ? 'device_group' : 'device',
          bizId: devGroupId || devId,
          category,
          groupId,
          status,
        },
        v: '2.0',
      },
      (d: any) => {
        const data = parseJSON(d);
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
};

/**
 * [removeTimer description]
 * @param {[type]} groupId  [description]
 * @param {[type]} category [description]
 * @param {Object} devInfo [设备信息]
 * @return {[type]}          [description]
 * 删除定时
 * 支持群组定时
 */
const removeTimer = (groupId: string, category: string, devInfo?: any) => {
  return new Promise((resolve, reject) => {
    const { groupId: devGroupId, devId } = devInfo || TYSdk.devInfo;

    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.remove',
        postData: {
          type: devGroupId ? 'device_group' : 'device',
          bizId: devGroupId || devId,
          groupId,
          category,
        },
        v: '2.0',
      },
      (d: any) => {
        const data = parseJSON(d);
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
};

/**
 * [getCategoryTimerList description]
 * @param  {[type]} category [description]
 * @return {[type]}          [description]
 * 获取某个分类下的定时
 * 支持群组定时
 */
const getCategoryTimerList = (category: string) => {
  return new Promise((resolve, reject) => {
    const { groupId, devId } = TYSdk.devInfo;
    TYSdk.native.apiRNRequest(
      {
        a: 'tuya.m.timer.group.list',
        postData: {
          type: groupId ? 'device_group' : 'device',
          bizId: groupId || devId,
          category,
        },
        v: '2.0',
      },
      (d: any) => {
        const data = parseJSON(d);
        resolve(data);
      },
      (e: any) => {
        reject(e);
      }
    );
  });
};

export default {
  addTimer,
  updateTimer,
  updateTimerStatus,
  removeTimer,
  getCategoryTimerList,
};