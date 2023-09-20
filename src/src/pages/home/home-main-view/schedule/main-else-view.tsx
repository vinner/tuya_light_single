import _, { times } from 'lodash';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing, ImageBackground } from 'react-native';
import { Utils, TYText, Dialog, IconFont, TYSdk, DevInfo } from 'tuya-panel-kit';
import color from 'color';
import { useSelector } from '../../../../models';
import Strings from '../../../../i18n';
import SwitchList from '../../../../components/SwitchList';
import icons from '../../../../res/iconfont';
import Res from '../../../../res';
import DpCodes from '../../../../config/dpCodes';
import MainTimeView from './main-time-view';
import TopBar from '../../../../components/topbar';
import { LocalGroupTimingData, } from '../../../../utils';
import {
  SINGLE_TIMER_CNT_MAX,
  GROUP_TIMER_CNT_MAX,
  ColorData,
  transLoopsToStr,
  getGroupTimerParams,
  getCloudGroupTimerList,
  addSingleTimer,
  setSingleTimerState,
  UpdateSingleTimerParams,
  deleteSingleTimer,
  checkGroupTimerConflit,
  addGroupTimer,
  setGroupTimerState,
  updateGroupTimer,
  deleteGroupTimer,
  updateLocalGroupTimerList,
  setCloudTimerEnable,
  getCloudTimerEnable,
} from './schedule_utils'
import { showGlobalToast } from '../dimmer/dimmer-utils';

const { localTimingListCode } = DpCodes;
const { convertX: cx, convertY: cy, width: winWidth } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

const SIZE = 224;

/* 规则编辑参数 */
let editParams = {
  isInit: false,      // 编辑界面是否需要重新初始化，产生变化即需要重新初始化
  isEditting: false,  // 是否当前正处于编辑界面
  isTurning: false,   // 是否正在切换当中
  isEdit: false,      // 新增还是编辑
  index: 0,           // 当前编辑的规则ID
  isSingle: false,
  data: {
    power: true,
    time: '00:00',
    loops: '0000000',
    isColour: false,
    h: 0,
    s: 0,
    t: 0,
    b: 0,
  },
  isComplete: false,
  completeData: {
    startTime: '',
    endTime: '',
    loops: '',
    power: false,
    isColour: true,
    h: 0,
    s: 0,
    t: 0,
    b: 0,
  }
};

let groupTimers: LocalGroupTimingData[] = [];
let singleTimers;//: SingleTimerData[] = [];

interface MainElseViewProps {
  theme?: any;
  onGesture;
}

const MainElseView: React.FC<MainElseViewProps> = (
  {
    theme: {
      global: { fontColor },
    },
  }
) => {
  const groupTimingList = useSelector(state => state.dpState[localTimingListCode]) as string;
  const [waveAnim] = useState(new Animated.Value(0));
  const [__, setUpdate] = useState(false);

  const listRef = useRef<SwitchList>(null);
  const scrollRef = useRef<ScrollView>(null);
  //const [groupTimers, setGroupTimers] = useState<GroupTimerData[]>([]);
  //const [singleTimers, setSingleTimers] = useState<SingleTimerData[]>([]);
  //const [editParams, setEditParams] = useState<EditParams>(defaultEditParams);
  const [scrollEnable, setScrollEnable] = useState<boolean>(true);

  useEffect(() => {
    /* 获取设备的名称 */
    TYSdk.device.getDeviceInfo().then((data: DevInfo) => {
      const cloud = (data.devId === '6c6dcbcae29fcf69a90hls') || (data.uuid === 'vdevo166573250818156');
      //TYSdk.native.simpleTipDialog('cloud: ' + cloud + '; ' + JSON.stringify(data), () => {});
      if (!getCloudTimerEnable() && cloud) {
        updateLocalGroupTimerList(groupTimingList).then(
          () => {
            setCloudTimerEnable(cloud);
            updateGroupTimerList();
          }
        );
      } else {
        setCloudTimerEnable(cloud);
        updateGroupTimerList();  
      }
    }).catch(error => {});
  }, []);

  useEffect(() => {
    /* 获取设备的名称 */
    TYSdk.device.getDeviceInfo().then((data: DevInfo) => {
      const cloud = (data.devId === '6c6dcbcae29fcf69a90hls') || (data.uuid === 'vdevo166573250818156');
      if (!getCloudTimerEnable() && cloud) {
        updateLocalGroupTimerList(groupTimingList).then(
          () => {
            setCloudTimerEnable(cloud);
            updateGroupTimerList();
          }
        );
      } else {
        setCloudTimerEnable(cloud);
        updateGroupTimerList();  
      }
    }).catch(error => {});
  }, [groupTimingList]);

  const updateGroupTimerList = () => {
    updateLocalGroupTimerList(groupTimingList).then(
      () => {
        groupTimers = getCloudGroupTimerList();
        forceUpdate();
      }
    );
  }

  const forceUpdate = () => {
    setUpdate(preu => !preu);
  };

  const showConflitDialog = (cList: number[], timers) => {
    if (cList.length <= 0) {
      return;
    }

    //TYSdk.native.simpleTipDialog('conflit: ' + cList.join(',') + '; ' + JSON.stringify(timers), () => {});
    Dialog.custom({
      title: 'Timer Repeat',
      confirmText: 'OK',
      content: (
        <View style={styles.conflitRoot}> 
          <TYText style={styles.conflitTitle}> {'The setting timer is repeated with the following:'} </TYText>
          {
            cList.map(i => {
              return (
                <View style={styles.conflitView}>
                  <TYText style={styles.conflitText1}> {`${timers[i].startTime} - ${timers[i].endTime}`} </TYText>
                  <TYText style={styles.conflitText2}> {transLoopsToStr(timers[i].loops)} </TYText>
                </View>
              );
            })
          }
        </View>
      ),
      onConfirm: (_data, { close }) => {
        close();
      },
    });
  };

  /* 修改定时规则状态：开启或关闭 */
  const _handleSetGroupTimerState = async (index: number, state: boolean) => {
    const { startTime, endTime, loops } = groupTimers[index];
    const conflitList = checkGroupTimerConflit(startTime, endTime, loops, index, groupTimers);
    if (conflitList.length > 0) {
      showConflitDialog(conflitList, groupTimers);
    } else {
      setGroupTimerState(index, state).then(
        () => setTimeout(() => updateGroupTimerList(), 500)
      );
    }
  };

  /* 根据index删除对应的定时规则 */
  const _handleDeleteGroupTimer = async (index: number) => {
    deleteGroupTimer(index).then(
      () => setTimeout(() => updateGroupTimerList(), 500)
    );
  };

  /* 添加定时规则 */
  const _handleAddGroupTimer = async (startTime: string, endTime: string, loops: string, color: ColorData) => {
    addGroupTimer(startTime, endTime, loops, color).then(
      () => setTimeout(() => updateGroupTimerList(), 500)
    );
  };

  /* 修改定时规则 */
  const _handleUpdateGroupTimer = async (index: number, startTime: string, endTime: string, loops: string, color: ColorData) => {
    updateGroupTimer(index, startTime, endTime, loops, color).then(
      () => setTimeout(() => updateGroupTimerList(), 500)
    );
  };

  /* 修改定时规则状态：开启或关闭 */
  const _handleAddSingleTimer = async (time: string, loops: string, power: boolean, data) => {
    addSingleTimer(time, loops, power, data);
  }

  /* 修改定时规则状态：开启或关闭 */
  const _handleSetSingleTimerState = async (index: number, state: boolean) => {
    await setSingleTimerState(index, state);
  }

  /* 修改定时规则状态：开启或关闭 */
  const _handleUpdateSingleTimer = async (index: number, time: string, loops: string, power: boolean, data) => {
    UpdateSingleTimerParams(index, time, loops, power, data);
  }

  /* 根据index删除对应的定时规则 */
  const _handleDeleteSingleTimer = async (index: number) => {
    deleteSingleTimer(index);
  };

  /* 渲染顶部控制栏 */
  const renderTopBar = () => {
    return (
      <TopBar
        title={' '}
        backhandle={undefined}
      />
    );
  }
  
  /* 添加列表元素 */
  const _renderListSection = ({key, title, value, cnt, cntLimit, onPress}) => {
    const dimmedColor = color(fontColor).alpha(0.5).rgbString();
    const disabled = cnt >= cntLimit? true : false;
    const iconBg = disabled ? '#b2e7c5' : '#00ad3c';
    return (
      <View style={[styles.section, styles.section__listItem]}>
        <TouchableOpacity
          accessibilityLabel={`CustomScene_${key}`}
          disabled={disabled}
          style={[styles.row]}
          activeOpacity={disabled ? 0 : 0.8}
          onPress={onPress}
        >
          <TYText style={[styles.text, { color: fontColor }]} >{title}</TYText>
          <View style={styles.row__right} >
            <TYText style={[styles.text, { color: dimmedColor, marginRight: cx(9)}, ]}>
              {value}
            </TYText>
            <View style={[styles.addIcon, {backgroundColor: iconBg}]}>
              <IconFont d={icons.add} size={cx(20)} fill={'#fff'} stroke={'#fff'} />
            </View>
          </View>
        </TouchableOpacity>
        <View style={{ width: '100%', height: 1, backgroundColor: '#f0edf1' }}/>
      </View>
    );
  }

  /* 渲染新建定时规则列表元素 */
  const _renderGroupTimeClockItem = () => {
    return _renderListSection({
      key: 'timer_rule',
      title: 'Timer',
      value: '',
      cnt: groupTimers.length,
      cntLimit: GROUP_TIMER_CNT_MAX,
      onPress: _handleAddGroupTimeClock
    });
  };

  /* 渲染新建定时规则列表元素 */
  const _renderSingleTimeClockItem = () => {
    return _renderListSection({
      key: 'single_timer',
      title: 'Time Switch',
      value: '',
      cnt: singleTimers.length,
      cntLimit: SINGLE_TIMER_CNT_MAX,
      onPress: _handleAddNewSingleTimer
    });
  };

  const _renderSingleTimers = () => {
    if (singleTimers.length <= 0) {
      return (
        <View style={{ height: cx(88)}}/>
      )
    } else {
      const data = singleTimers.map(t => {
                      return {
                        startTime: t.time,
                        endTime: t.time,
                        loops: t.loops,
                        power: t.power,
                        startStatus: t.status,
                        endStatus: t.status,
                      }
                    });
      //TYSdk.native.simpleTipDialog('single: ' + JSON.stringify(data), () => {});

      return (
        <SwitchList
          ref={listRef}
          data={data}
          type='single'
          onValueChange={_handleSetSingleTimerState}
          onPress={_handleEditSingleTimer}
          onDelete={_handleDeleteSingleTimer}
          onMoveStart={_handleItemMoveStart}
          onMoveComplete={_handleItemMoveComplete}
        />
      );
    }
  };

  const _handleAddNewSingleTimer = useCallback(() => {
    //TYSdk.native.simpleTipDialog('_handleAddNewSingleTimer', () => {});

    editParams.isInit = !editParams.isInit;
    editParams.isEdit = false;
    editParams.isEditting = true;
    editParams.isTurning = true;
    editParams.isSingle = true;
    forceUpdate();

    /*
    const { isInit, index, data } = editParams;
    setEditParams({
      isInit: !isInit,
      isEdit: false,
      isEditting: true,
      isTurning: true,
      index,
      isSingle: true,
      data,
    });
    */
  }, []);

  const _handleEditSingleTimer = useCallback((index: number) => {
    editParams.isInit = !editParams.isInit;
    editParams.isEdit = true;
    editParams.index = index;
    editParams.isEditting = true;
    editParams.isTurning = true;
    editParams.isSingle = true;
    editParams.data.power = singleTimers[index].power;
    editParams.data.time = singleTimers[index].time;
    editParams.data.loops = singleTimers[index].loops;
    editParams.data.isColour = singleTimers[index].data.isColour;
    editParams.data.h = singleTimers[index].data.h;
    editParams.data.s = singleTimers[index].data.s;
    editParams.data.t = singleTimers[index].data.t;
    editParams.data.b = singleTimers[index].data.b;
    forceUpdate();

    /*
    const { isInit, data } = editParams;
    setEditParams({
      isInit: !isInit,
      isEdit: true,
      isEditting: true,
      isTurning: true,
      index,
      isSingle: true,
      data: {
        power: singleTimers[index].power,
        time: singleTimers[index].time,
        loops: singleTimers[index].loops,
        isColour: singleTimers[index].data.isColour,
        h: singleTimers[index].data.h,
        s: singleTimers[index].data.s,
        t: singleTimers[index].data.t,
        b: singleTimers[index].data.b,
      },
    });
    */
  }, [singleTimers]);

  /* 进入添加定时规则界面的回调函数 */
  const _handleAddGroupTimeClock = useCallback(() => {
    editParams.isInit = !editParams.isInit;
    editParams.isEdit = false;
    editParams.isEditting = true;
    editParams.isTurning = true;
    editParams.isSingle = false;
    forceUpdate();
    /*
    TYSdk.native.simpleTipDialog('_handleAddGroupTimeClock: ' + JSON.stringify(editParams), () => {});
    const { isInit, index, data } = editParams;
    setEditParams({
      isInit: !isInit,
      isEdit: false,
      isEditting: true,
      isTurning: true,
      index,
      isSingle: false,
      data,
    });
    */
  }, []);
  
  /* 进入编辑定时规则界面 */
  const _handleEditGroupTimer = useCallback((index: number) => {
    editParams.isInit = !editParams.isInit;
    editParams.isEdit = true;
    editParams.index = index;
    editParams.isEditting = true;
    editParams.isTurning = true;
    editParams.isSingle = false;
    forceUpdate();
    //TYSdk.native.simpleTipDialog('_handleEditGroupTimer' , () => {});
    /*
    const { isInit, data } = editParams;
    setEditParams({
      isInit: !isInit,
      isEdit: true,
      isEditting: true,
      isTurning: true,
      index,
      isSingle: false,
      data,
    });
    */
  }, []);

  /* 渲染已存在的定时规则列表元素的函数 */
  const _renderGroupTimers = () => {
    const data = groupTimers.map(t => {
                    return {
                      startTime: t.startTime,
                      endTime: t.endTime,
                      loops: t.loops,
                      power: true,
                      startStatus: (t.state && !t.execuing) ? true : false,
                      endStatus: t.state,
                    }
                  });
    return (
      <SwitchList
        ref={listRef}
        data={data}
        onValueChange={_handleSetGroupTimerState}
        onPress={_handleEditGroupTimer}
        onDelete={_handleDeleteGroupTimer}
        onMoveStart={_handleItemMoveStart}
        onMoveComplete={_handleItemMoveComplete}
      />
    );
  };

  /* 定时列表元素在开始滑动时的回调函数 */
  const _handleItemMoveStart = useCallback(() => {
    //setScrollEnable(false);
    // @ts-ignore
    scrollRef.current?.setNativeProps({ scrollEnabled: false });
  },[]);

  /* 定时列表元素在结束滑动时的回调函数 */
  const _handleItemMoveComplete = useCallback(() => {
    //setScrollEnable(true);
    // @ts-ignore
    scrollRef.current?.setNativeProps({ scrollEnabled: true });
  },[]);

  /* 从添加或编辑定时规则界面返回定时列表界面的回调函数 */
  const _handleTimeClockBack = useCallback(() => {
    editParams.isEditting = false;
    editParams.isTurning = true;
    forceUpdate();
    //TYSdk.native.simpleTipDialog('_handleTimeClockBack: ' + JSON.stringify(editParams), () => {});
    /*
    const { isInit, isEdit, index, isSingle, data } = editParams;
    setEditParams({
      isInit,
      isEdit,
      isEditting: false,
      isTurning: true,
      index,
      isSingle,
      data,
    });
    */
  },[]);

  const _handleTimeClockCheck = useCallback((
    startTime: string,
    endTime: string,
    loops: string,
    power: boolean,
    ) => {

      if (editParams.isSingle) {
        if (editParams.isEdit) {
          // TODO
        } else {
          // TODO
        }
        return true;
      } else {
        const index = editParams.isEdit ? editParams.index : -1;
        const conflitList = checkGroupTimerConflit(startTime, endTime, loops, index, groupTimers);
        if (conflitList.length > 0) {
          showConflitDialog(conflitList, groupTimers);
          return false;
        } else {
          return true;
        }
      }
  }, []);

  /* 添加或编辑定时规则界面完成操作，并返回定时列表界面的回调函数 */
  const _handleTimeClockComplete = useCallback((
    startTime: string,
    endTime: string,
    loops: string,
    power: boolean,
    isColour: boolean,
    h: number,
    s: number,
    t: number,
    b: number
    ) => {
      /*
      const { isInit, isEdit, index, isSingle, data } = editParams;
      setEditParams({
        isInit,
        isEdit,
        isEditting: false,
        isTurning: true,
        index,
        isSingle,
        data,
      });
      */

      editParams.isEditting = false;
      editParams.isTurning = true;
      editParams.isComplete = true;
      editParams.completeData = {
        startTime, endTime, loops, power, isColour, h, s, t, b
      };
      forceUpdate();
  }, []);

  const getIinitFlag = () => {
    if (editParams.isTurning) {
      if (editParams.isEditting) {
        listRef.current?.reset_item_state();
        //TYSdk.native.simpleTipDialog('data: ' + JSON.stringify(timers), () => {});
      }
      startWaveAnimation();
    }
    return editParams.isInit;
  };

  const startWaveAnimation = () => {
    const startValue = editParams.isEditting ? 0 : 1;
    const endValue = editParams.isEditting ? 1 : 0;

    waveAnim.setValue(startValue);
    Animated.timing(waveAnim, {
      toValue: endValue,
      duration: 350,
      easing: Easing.bezier(.22,.62,.6,.9),
    }).start(
      () => {
        editParams.isTurning = false;

        if (editParams.isComplete) {
          editParams.isComplete = false;
          const { startTime, endTime, loops, power, isColour, h, s, t, b } = editParams.completeData;
          const color = { isColour, h, s, t, b };

          if (editParams.isSingle) {
            if (editParams.isEdit) {
              _handleUpdateSingleTimer(editParams.index, startTime, loops, power, color);
            } else {
              _handleAddSingleTimer(startTime, loops, power, color);
            }
          } else {
            /* 判断是编辑还是添加定时规则 */
            if (editParams.isEdit) {
              _handleUpdateGroupTimer(editParams.index, startTime, endTime, loops, color);
            } else {
              _handleAddGroupTimer(startTime, endTime, loops, color);
            }
          }
        }
        /*
        TYSdk.native.simpleTipDialog('wave: ' + JSON.stringify(editParams), () => {});
        const { isInit, isEdit, isEditting, index, isSingle, data } = editParams;
        setEditParams({
          isInit,
          isEdit,
          isEditting,
          isTurning: false,
          index,
          isSingle,
          data,
        });
        */
      }
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <ImageBackground
          style={{ position: 'absolute', width: winWidth, height: winWidth * 0.533 }}
          source={Res.timer_header}
        />
        {renderTopBar()}
        <TYText style={{fontSize:cx(24), color:fontColor, marginLeft: cx(24), marginTop: cx(44), marginBottom: cx(48), fontWeight: '400'}}> {'More'} </TYText>

        <ScrollView
          accessibilityLabel="CustomScene_ScrollView"
          ref={scrollRef}
          scrollEnabled={scrollEnable}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollView]}
        >
        {/* 定时 */}
        {/*_renderSingleTimeClockItem()*/}
        {/*_renderSingleTimers()*/}
        {_renderGroupTimeClockItem()}
        {_renderGroupTimers()}
        </ScrollView>
      </View>
      <Animated.View
          accessibilityLabel="HomeScene_Custom_Editor"
          style={[
            styles.editor,
            {
              //paddingTop:10
            },
            {
              transform: [
                {
                  translateX: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -winWidth],
                  }),
                },
              ],
            },
          ]}
      >
        <ImageBackground
          style={{ position: 'absolute', top: 0, left: 0, width: winWidth, height: winWidth * 1.6 }}
          source={Res.timer_editor_bg}
        />
        <MainTimeView
          isInit={getIinitFlag()}
          isEdit={editParams.isEdit}
          isSingle={editParams.isSingle}
          singleTime={editParams.data.time}
          singleLoops={editParams.data.loops}
          power={editParams.data.power}
          startTime={getGroupTimerParams(editParams.index).startTime}
          endTime={getGroupTimerParams(editParams.index).endTime}
          loops={getGroupTimerParams(editParams.index).loops}
          isColour={getGroupTimerParams(editParams.index).isColour}
          h={getGroupTimerParams(editParams.index).h}
          s={getGroupTimerParams(editParams.index).s}
          t={getGroupTimerParams(editParams.index).t}
          b={getGroupTimerParams(editParams.index).b}
          onBack={_handleTimeClockBack}
          onCheck={_handleTimeClockCheck}
          onComplete={_handleTimeClockComplete}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    flexDirection: 'row',
  },

  editor: {
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    alignSelf: 'stretch',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingBottom: cy(10),
  },

  scrollView: {
    alignSelf: 'stretch',
  },

  section: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },

  section__listItem: {
    alignSelf: 'stretch',
    height: cx(87),
    marginHorizontal: cx(24),
  },

  mask: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    marginTop: cy(55),
    borderRadius: 112,
    backgroundColor: '#000E20',
    borderColor: '#000',
    borderWidth: 2,
    overflow: 'hidden',
  },

  image: {
    width: 448,
    height: 149,
  },

  item: {
    height: '30',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  text: {
    fontSize: cx(23),
    color: '#fff',
    fontWeight: '400',
  },

  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },

  row__right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addIcon: {
    width: cx(24),
    height: cx(24),
    borderRadius: cx(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  conflitRoot: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: cx(20),
  },
  conflitTitle: {
    fontSize: 17,
    color: '#000',
  },
  conflitView: {
    width: winWidth * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: cx(20),
    paddingVertical: cx(10),
    backgroundColor: '#d8d8d8',
    borderRadius: 30,
  },
  conflitText1: {
    fontSize: 18, 
    color: '#000',
    fontWeight:'400',
  },
  conflitText2: {
    fontSize: 15,
    color: '#4c4c4c',
  },
});

export default withTheme(MainElseView);
