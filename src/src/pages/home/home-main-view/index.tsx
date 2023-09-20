/* eslint-disable react/no-unused-state */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/no-unresolved */
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutChangeEvent, Image } from 'react-native';
// @ts-ignore
import { Utils, TYSdk, IconFont, LinearGradient } from 'tuya-panel-kit';
import { useSelector } from '../../../models';
import { lampPutDpData } from '../../../api';
import { WORKMODE } from '../../../config';
import Res from '../../../res';
import DpCodes from '../../../config/dpCodes';
import * as MusicManager from '../../../utils/music';
import MainSceneView from './scenes/main-scene-view';
import MainElseView from './schedule/main-else-view';
import MainWhiteView from './dimmer/main-white-view';
import MainMusicView from './music/main-music-view';

// @ts-ignore
import { Rect } from 'react-native-svg';
import { screen_bottom_height } from '../../../utils';
import { musicStop } from './music/music-utils';


const { convertX: cx, isIphoneX } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const { workModeCode, powerCode } = DpCodes;

interface HomeMainViewProps {
  theme?: any;
  onComplete;
  onGesture;
  tab: string;
}

const HomeMainView: React.FC<HomeMainViewProps> = ({
  theme: {
    global: { },
  },
  onComplete,
  onGesture,
  tab: tabSelected,
}) => {
  const ledMode = useSelector(state => state.dpState[workModeCode]) as string;
  const power = useSelector(state => state.dpState[powerCode]) as string;
  const [layout, setLayout] = useState({width: 100, height: 0});

  const checkWorkModeNeedUpdate = (tab: string) => {
    if (tab === 'else') {
      return false;
    }

    if (((ledMode === WORKMODE.COLOUR || ledMode === WORKMODE.WHITE) && tab === WORKMODE.COLOUR_WHITE)
        || ledMode === tab) {
      return false;
    }
    return true;
  }

  /* 根据标签页，获得对应的工作模式 */
  const getWorkMode = (key: string) => {
    if (key === WORKMODE.COLOUR_WHITE) {
      return WORKMODE.COLOUR;
    }
    else {
      return key;
    }
  };

  /* 更新工作模式 */
  const changeWorkMode = async (key: string) => {
    if (power && key !== ledMode) {
      if (ledMode === WORKMODE.MUSIC) {
        /* 如果前一个是音乐模式，则直接更新模式，以做到取消音乐dp的监听 */
        //TYSdk.native.simpleTipDialog('change: music close', () => {});
        musicStop();
      }

      /* 更改工作模式 */
      lampPutDpData({ [workModeCode]: key });
    }
  };

  const renderView = () => {
    // 三路灯下，群组、虚拟设备及调试助手默认值为white的问题
    let el = <View />;

    if (tabSelected === 'else') {
      el = <MainElseView onGesture={onGesture}/>;
      return el;
    }

    switch (tabSelected) {
      case WORKMODE.COLOUR_WHITE:
        el = <MainWhiteView />;
        break;
      case WORKMODE.SCENE:
        el = <MainSceneView />;
        break;
      case WORKMODE.MUSIC:
        el = <MainMusicView />;
    }
    return el;
  };

  /* 判断标签页是否被选中 */
  const isActived = (key: string) => {
    return key === tabSelected;
  };

  /* 标签页点击的回调函数 */
  const handleChangeTab = (key: string) => () => {
    if (tabSelected === key) {
      return;
    }

    onComplete(key);

    if (checkWorkModeNeedUpdate(key)) {
      changeWorkMode(getWorkMode(key));
    }
  };

  /* 标签页的数据源 */
  const getDataSource = useMemo(() => {
    const data = [
      {
        key: WORKMODE.COLOUR_WHITE,
        imgPath: Res.tab_dimmer,
        imgSelectedPath: Res.tab_dimmer_s,
        isSupport: true,
      },
      {
        key: WORKMODE.SCENE,
        imgPath: Res.tab_scene,
        imgSelectedPath: Res.tab_scene_s,
        isSupport: true,
      },
      {
        key: WORKMODE.MUSIC,
        imgPath: Res.tab_music,
        imgSelectedPath: Res.tab_music_s,
        isSupport: true,
      },
      {
        key: 'else',
        imgPath: Res.tab_schedule,
        imgSelectedPath: Res.tab_schedule_s,
        isSupport: true,
      },
    ];

    return data
      .filter(item => item.isSupport)
      .map(item => ({
        ...item,
      }));
  }, []);

  const _handleLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    setLayout({ width: layout.width, height: layout.height });
  };

  const renderBorder = () => { 
    return (
      <LinearGradient
        gradientId="tab_border"
        style={{
          width: layout.width,
          height: 0.5,
        }}
        x1="0%"
        y1="0%"
        x2="100%"
        y2="0%"
        stops={{
          '0%': '#fec0b2',
          '33%': '#fefbd0',
          '66%': '#b7e6df', 
          '100%': '#fcbeb6',
        }}
      >
        <Rect width={layout.width} height={2} />
      </LinearGradient>
    );
  }

  const iconColor =  '#817f8e';
  const activeIconColor = '#000';

  return (
    <View style={styles.container} onLayout={_handleLayout}>
      <View style={styles.view}>
        {renderView()}
      </View>
      <View style={[styles.btns,]}>
        {renderBorder()}
        {getDataSource.map(item => {
          const isActive = isActived(item.key);
          return (
            <TouchableOpacity
              style={[styles.btn,]}
              activeOpacity={0.7}
              key={item.key}
              onPress={handleChangeTab(item.key)}
            >
              <Image
                style={{
                  width: cx(24),
                  height: cx(24),
                }}
                source={isActive ? item.imgSelectedPath : item.imgPath}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  view: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTab: {
    width: '100%',
    backgroundColor: 'transparent',
    height: cx(60),
    borderBottomWidth: 1,
    alignItems: 'center',
  },

  textTab: {
    fontSize: cx(16),
    textAlign: 'center',
  },

  btns: {
    width: '100%',
    height: screen_bottom_height,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: cx(10),
  },

  btn: {
    width: cx(60),
    height: screen_bottom_height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: isIphoneX ? cx(20) : 0,
  },

  image: {
    width: cx(200),
    height: cx(200),
    opacity: 0.8,
  },
});

export default withTheme(HomeMainView);
