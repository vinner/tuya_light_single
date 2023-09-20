import _ from 'lodash';
import color from 'color';
import throttle from 'lodash/throttle';
// @ts-ignore
import { Rect } from 'react-native-svg';
import { connect } from 'react-redux';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Utils, TYText, TYSdk, IconFont, DevInfo } from 'tuya-panel-kit';
import { ReduxState } from '../../../../models';
import DpCodes from '../../../../config/dpCodes';
import TopBar from '../../../../components/topbar';
import Res from '../../../../res';
import icons from '../../../../res/iconfont';
import { lampPutDpData } from '../../../../api';
import { useSelector } from '../../../../models';
import {
  COLOR_DATA,
  saveCloudSingleColor,
  parseCloudSingleColors,
  parseCloudGroupColors,
  genDefaulColor,
  putControlDataDP,
  lampPutDpLightColor,
  detectSLimit,
} from './dimmer-utils';
import { MY_COLORS_DATA, SINGLE_COLORS_CNT_MAX } from './my-colors';
import { EditColorData } from './dimmer-panel';
import DimmerPanelUnits from './dimmer-panel-units';
import { WORKMODE } from '../../../../config';

const { convertX: cx, winWidth } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const {
  powerCode,
  workModeCode,
  colourCode,
  temperatureCode,
  brightCode,
  functionLevelCode,
 } = DpCodes;

const BG_WIDTH = winWidth;
const BG_HEIGHT = winWidth * 0.864;
const POWER_BTN_SIZE = cx(72);

let ScrollOffsetY = 0;

interface HomeMainWhiteViewProps {
  theme?: any;
}

const HomeMainWhiteView: React.FC<HomeMainWhiteViewProps> = ({
  theme: {
    global: {  },
  },
}) => {
  const power = useSelector(state => state.dpState[powerCode]) as boolean;
  const workMode = useSelector(state => state.dpState[workModeCode]) as string;
  const colourData = useSelector(state => state.dpState[colourCode]) as string;
  const bright = useSelector(state => state.dpState[brightCode]) as number;
  const temp = useSelector(state => state.dpState[temperatureCode]) as number;
  const funcLevel = useSelector(state => state.dpState[functionLevelCode]) as string || '';

  const cloudSingleColors = useSelector(state => state.cloudState.singleColors) || '';
  const cloudGroupColors = useSelector(state => state.cloudState.groupColors) || [];

  const topBarRef = useRef<TopBar>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [curColor, setCurColor] = useState<COLOR_DATA>(genDefaulColor(workMode, colourData, bright, temp));
  const singleColors = parseCloudSingleColors(cloudSingleColors);
  const dimmerPanelRef = useRef<DimmerPanelUnits>(null);

  useEffect(() => {
    setCurColor(genDefaulColor(workMode, colourData, bright, temp));
  }, [workMode, colourData, bright, temp]);

  /* 渲染顶部控制栏 */
  const renderTopBar = () => {
    return (
      <TopBar
        ref={topBarRef}
        style={{ position: 'absolute', left: 0, top: 0, }}
        title={TYSdk.devInfo.name}
        backhandle={undefined}
        setting={true}
      />
    );
  }

  const updateTopBarBackground = (offset: number) => {
    const OFFSET_MAX = 80;
    if (ScrollOffsetY >= OFFSET_MAX && offset >= OFFSET_MAX) {
      return;
    }

    ScrollOffsetY = offset;
    const a = offset >= OFFSET_MAX ? 1 : offset / OFFSET_MAX;
    const backgroundColor = color('#fff').alpha(a).rgbString();
    topBarRef.current?.setNativeProps({ backgroundColor });
  }

  const handleRootScroll = (event) => {
    updateTopBarBackground(event.nativeEvent.contentOffset.y);
  }

  /** 电源按键的回调函数 */
  const handlerPower = () => throttle(() => {
    lampPutDpData({ [powerCode]: !power });
  }, 200); 

  /** 渲染开关按键 */
  const renderPowerBtn = () => {
    return (
      <View style={styles.btnView}>
        <TouchableOpacity
          accessibilityLabel="HomeScene_SceneView_Power"
          activeOpacity={0.9}
          style={[styles.powerView]}
          onPress={handlerPower()}
        >
          <IconFont d={icons.power} size={cx(25)} fill={'#000'} stroke={'#000'} />
        </TouchableOpacity>
      </View>
    );
  }

  const renderPowerOffBg = () => {
    const width = winWidth * 0.26;
    const height = width * 0.816;
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1}}>
        <Image
          style={{
            width,
            height,
            marginBottom: cx(16),
          }}
          source={Res.power_off_bg}
        />
        <TYText style={{ fontSize: cx(14), color: '#000' }}> {'Device is offline'} </TYText>
      </View>
    );
  }

  /** 渲染灯串背景页 */
  const renderTitleBg =() => {
    return (
      <Image
        style={{ width: BG_WIDTH, height: BG_HEIGHT, resizeMode: 'stretch' }}
        source={power ? Res.dimmer_bg : Res.dimmer_bg_power_off}
      />
    );
  }


  const handleDimmerChange = useCallback((data: EditColorData, complete: boolean) => {
    // @ts-ignore
    scrollViewRef.current?.setNativeProps({ scrollEnabled: complete });

    const { isColour, h, s, t, b } = data;

    if (complete) {
      //TYSdk.native.simpleTipDialog('change: ' + JSON.stringify(data), () => {})
      setCurColor({ isColour, h, s, t, b });
      lampPutDpLightColor({isColour, h, s, t, b });  
    } else {
      if (isColour) {
        putControlDataDP(h, s, b, 0, 0);
      } else {
        putControlDataDP(0, 0, 0, b, t);
      }
    }
  }, []);

  const handleDimmerTypeSwitch = (isColour: boolean) => {
    const { h, s, t, b } = curColor;

    setCurColor({
      isColour: isColour,
      h, s, t, b,
    });
    lampPutDpData({ [workModeCode]: isColour ? WORKMODE.COLOUR : WORKMODE.WHITE });
  }

  const handleAddSingleColor = (data: EditColorData) => {
    const { isColour, h, s, t, b } = data;
    const c = { isColour, h, s, t, b };
    const newSingleColors: COLOR_DATA[] = [...singleColors];
    newSingleColors.unshift(c);
    (newSingleColors.length > SINGLE_COLORS_CNT_MAX) && newSingleColors.splice(SINGLE_COLORS_CNT_MAX);
    saveCloudSingleColor(newSingleColors);
  }

  const renderDimmerPanelUnits = () => {
    return (
      <DimmerPanelUnits
        ref={dimmerPanelRef}
        isColour={curColor.isColour}
        h={curColor.h}
        s={curColor.s}
        t={curColor.t}
        b={curColor.b}
        sLimit={detectSLimit(funcLevel)}
        singleColors={parseCloudSingleColors(cloudSingleColors)}
        groupColors={parseCloudGroupColors(cloudGroupColors)}
        lightLength={2}//{lightLength}
        onlySelected={false}
        onChange={handleDimmerChange}
        onSwitch={handleDimmerTypeSwitch}
        onMyColorSelected={handleMyColorSelected}
        onMyColorEditting={handleMyColorEditting}
        onAddColor={handleAddSingleColor}
      />
    );
  }

  const handleMyColorSelected = (d: MY_COLORS_DATA, single: boolean) => {
    if (d.data.length <= 0 || d.data.length !== d.stops.length) {
      return;
    }

    if (!single) {
      // TODO
    }
  }

  const handleMyColorEditting = (editting: boolean) => {
    editting && scrollViewRef.current?.scrollToEnd();
  }

  return (
    <View style={styles.container}>
      {power &&
        <ScrollView
          ref={scrollViewRef}
          accessibilityLabel="Dimmer_ScrollView"
          scrollEnabled={true}
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollView]}
          onScroll={handleRootScroll}
          scrollEventThrottle={10}
          >
          {renderTitleBg()}
          {renderPowerBtn()}
          {renderDimmerPanelUnits()}
        </ScrollView>
      }
      {!power &&
        <View style={{ flex: 1, alignSelf: 'stretch' }}>
          {renderTitleBg()}
          {renderPowerBtn()}
          {renderPowerOffBg()}
        </View>
      }
      {renderTopBar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  scrollView: {
    alignSelf: 'stretch',
  },
  btnView: {
    width: '100%',
    height: POWER_BTN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -(POWER_BTN_SIZE * 0.5),
  },
  powerView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: POWER_BTN_SIZE,
    height: POWER_BTN_SIZE,
    borderRadius: POWER_BTN_SIZE / 2,
    backgroundColor: '#fff',
    borderColor: '#ededed',
    borderWidth: 1,
  },
});


export default connect(({ cloudState }: ReduxState) => ({
  singleColors: parseCloudSingleColors(cloudState.singleColors || ''),
  groupColors: parseCloudGroupColors(cloudState.groupColors || []),
  light: cloudState.lightColors || '',
}))(withTheme(HomeMainWhiteView));

