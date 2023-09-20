/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useEffect, useRef, useState } from 'react';
import throttle from 'lodash/throttle';
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView, Image, LayoutChangeEvent } from 'react-native';
import { Utils, TYSdk, TYText, IconFont, TabBar } from 'tuya-panel-kit';
import { useSelector } from '../../../../models';
import { lampPutDpData, saveSceneEditing } from '../../../../api';
import Res from '../../../../res';
import icons from '../../../../res/iconfont';
import DpCodes from '../../../../config/dpCodes';
import TopBar from '../../../../components/topbar';
import SliderSelector from '../../../../components/SliderSelector';
import {
  lampSceneValue,
  getSceneValueId,
  tabDatas,
  getSceneTabKeyById,
  getSceneDatasByTab,
  parseCloudDiyScenes,
  parseSceneValue,
  setSLimit,
} from './scene-utils'

import { SCENE_ENTRY } from './scene-config';
import BottomSlider from './bottom-slider';
import SceneDiy from './scene-diy-view';
import { parseCloudSingleColors, parseCloudGroupColors, detectSLimit, } from '../dimmer/dimmer-utils';
import Tab_selector from './tab_selector';

const { withTheme } = Utils.ThemeUtils;
const { convertX: cx, convertY: cy, width: winWidth } = Utils.RatioUtils;
const { sceneCode: sceneValueCode, powerCode, functionLevelCode } = DpCodes;

const ITEM_CNT_PRELINE = 4;
const ITEM_MARGIN_H = cx(24);
const ITEM_INTERVAL = cx(15);
const ITEM_TEXT_MARGIN_TOP = cx(8);
const ITEM_FONT_SIZE = cx(10);
const ITEM_MARING_BOTTOM = cx(24);
const ITEM_IMAGE_SIZE = (winWidth - ITEM_MARGIN_H * 2 - ITEM_INTERVAL * (ITEM_CNT_PRELINE - 1)) / ITEM_CNT_PRELINE;
const ITEM_VIEW_WIDTH = ITEM_IMAGE_SIZE + ITEM_INTERVAL;
const ITEM_VIEW_MARGIN_H = ITEM_MARGIN_H - ITEM_INTERVAL * 0.5;

const POWER_BUTTON_SIZE = cx(56);

interface MainSceneViewProps {
  theme?: any;
}

const MainSceneView: React.FC<MainSceneViewProps> = ({
  theme: {
    global: {  },
  },
}) => {
  const flatListRef = useRef<FlatList<unknown>>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const power = useSelector(state => state.dpState[powerCode]) as boolean;
  const sceneValue = useSelector(state => state.dpState[sceneValueCode]) as string || '';
  const funcLevel = useSelector(state => state.dpState[functionLevelCode]) as string || '';

  const diyScenes = useSelector(state => state.cloudState.diyScenes) || [];
  const cloudSingleColors = useSelector(state => state.cloudState.singleColors) || '';
  const cloudGroupColors = useSelector(state => state.cloudState.groupColors) || [];
  const [currSceneId, setCurrSceneId] = useState<number>(getSceneValueId(sceneValue));
  const [tab, setTab] = useState<string>(getSceneTabKeyById(currSceneId));
  const [tabBarLayout, setTabbarLayout] = useState({width: 0, height: 0});
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
  const [diySceneDatas, setDiySceneDatas] = useState<SCENE_ENTRY[]>([]);

  useEffect(() => {
    //scrollToSelected();
    setSLimit(detectSLimit(funcLevel));
    return () => {
      /* 退出页面后关闭事件监听 */
      saveSceneEditing(false);
    };
  }, []);

  useEffect(() => {
    setDiySceneDatas(parseCloudDiyScenes(diyScenes));
  }, [diyScenes])

  /* 点击切换场景的回调函数 */
  const handleScenePress = (item: SCENE_ENTRY) => {
    if (!power) {
      return;
    }

    if (item.value.id === currSceneId) {
      return;
    }

    /* 优先更新界面，优化用户体验 */
    setCurrSceneId(item.value.id);
    lampSceneValue(item.value);
  };

  const renderItem = ({item, index}) => {
    const first = (index % ITEM_CNT_PRELINE === 0) ? true : false;
    const end = (index % ITEM_CNT_PRELINE === (ITEM_CNT_PRELINE - 1)) ? true : false;
    const active = (item.value.id === currSceneId) ? true : false;

    return (
      <View
        style={[
          styles.itemView,
          {
            marginLeft: first ? ITEM_VIEW_MARGIN_H : 0,
            marginRight: end ? ITEM_VIEW_MARGIN_H : 0,
          }
        ]}>
        <TouchableOpacity
          accessibilityLabel="HomeScene_SceneView_Select"
          activeOpacity={0.9}
          style={[styles.iconTouch, active && styles.iconActive ]}
          onPress={() => handleScenePress(item)}
        >
          <Image style={styles.itemImage} source={item.image} />
        </TouchableOpacity>

        <TYText style={active ? styles.itemTextActive : styles.itemText} numberOfLines={1}> {item.title} </TYText>
      </View>
    );
  };

  /* 渲染场景列表，传入参数为
   * title - 列表标题；
   * editable - 是否需要显示可编辑按键；
   * addable - 是否需要显示新增按键
   * dataSource - 需要显示在列表中的元素数据
   */
  const renderFlatList = (data: SCENE_ENTRY[]) => {
    const d = [...data];
    return (
      <FlatList
        accessibilityLabel="HomeScene_SceneView_FlatListRef"
        ref={flatListRef}
        initialScrollIndex={0}
        numColumns={4}
        data={d}
        renderItem={renderItem}
        keyExtractor={(_, idx) => `${idx}`}
      />
    );
  };

  const handlerPower = () => throttle(() => {
      lampPutDpData({ [powerCode]: !power });
    }, 200); 


  /* 渲染顶部控制栏 */
  const renderTopBar = () => {
    return (
      <TopBar
        title={TYSdk.devInfo.name}
        backhandle={undefined}
      />
    );
  }
  
  const _handleTabbarLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    setTabbarLayout({ width: layout.width, height: layout.height });
  };

  const renderSceneTabs = () => {
    const tabWidth = tabBarLayout.width / tabDatas.length;
    return (
      <View style={{ width: '100%', marginTop: cx(15), alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
        <View style={{ width: '67%', height: cx(30), marginLeft: cx(24), marginTop: cx(12) }} onLayout={_handleTabbarLayout}>
          <Tab_selector tabDatas={tabDatas} tab={tab} onChange={value => setTab(value)}/>
        </View>
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

  const renderBottomSlider = () => {
    return (
      <BottomSlider
        style={{marginBottom: cx(16), marginTop: cx(10)}}
        tabDatas={tabDatas}
        tab={tab}
      />
    );
  }

  const renderPowerOffView = () => {
    const width = winWidth * 0.26;
    const height = width * 0.816;
    return (
      <View style={{ flex: 1, alignSelf: 'stretch' }}>
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
      </View>
    )
  }

  const handleSceneUpdate = (complete: boolean) => {
    setScrollEnabled(complete);
  }

  const renderTabView = (key: string) => {
    const tab = getSceneDatasByTab(key);
    if (tab.key === 'diy') {
      //TYSdk.native.simpleTipDialog('renderDiyTabView', () => {});
      return (
        <SceneDiy
          diyDatas={diySceneDatas}
          currSceneId={currSceneId}
          singleColors={parseCloudSingleColors(cloudSingleColors)}
          groupColors={parseCloudGroupColors(cloudGroupColors)}
          lightLength={2}
          onItemSelected={handleScenePress}
          onParamsChange={handleSceneUpdate}
        />
      );
    } else {
      return renderFlatList(tab.datas);
    }
  }

  const handleSpeedChange = (v: number, complete: boolean) => {
    if (complete) {
      const value = parseSceneValue(sceneValue);
      if (value) {
        value.interval = Math.floor(v);
        value.time =   Math.floor(v);
        lampSceneValue(value);
      }
    }
  }

  const renderSpeedTest = () => {
    const value = parseSceneValue(sceneValue);
    const time = value ? value.time : 50;
    return (
      <View style={{ width: winWidth - cx(48), marginHorizontal: cx(24)}}>
        <SliderSelector
          minValue={1}
          maxValue={100}
          value={time}
          onSlidingComplete={handleSpeedChange}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.container]}>
        {renderTopBar()}
        {renderSceneTabs()}
        { power &&
        <ScrollView
          ref={scrollViewRef}
          accessibilityLabel="CustomScene_ScrollView"
          style={[styles.scrollView]}
          contentContainerStyle={[styles.scrollView]}
          scrollEnabled={scrollEnabled}
          >
          {renderTabView(tab)}
        </ScrollView>
        }
        {!power && renderPowerOffView()}
        {/*power && renderSpeedTest()*/}
        {renderBottomSlider()}
      </View>
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
  container: {
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    alignSelf: 'stretch',
    paddingTop: cx(10),
  },
  powerView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: POWER_BUTTON_SIZE,
    height: POWER_BUTTON_SIZE,
    marginRight: cx(24),
    borderRadius: POWER_BUTTON_SIZE / 2,
    borderColor: '#ededed',
    borderWidth: 1,
  },
  itemView:{
    width: ITEM_VIEW_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ITEM_MARING_BOTTOM,
  },
  itemImage: {
    width: ITEM_IMAGE_SIZE - 4,
    height: ITEM_IMAGE_SIZE - 4,
    borderRadius: ITEM_IMAGE_SIZE * 0.5 - 2,
  },
  itemText: {
    marginTop: ITEM_TEXT_MARGIN_TOP,
    fontSize: ITEM_FONT_SIZE,
    color: '#020914',
  },
  itemTextActive: {
    marginTop: ITEM_TEXT_MARGIN_TOP,
    fontSize: ITEM_FONT_SIZE,
    color: '#00AD3C',
  },
  iconTouch: {
    width: ITEM_IMAGE_SIZE,
    height: ITEM_IMAGE_SIZE,
    borderRadius: ITEM_IMAGE_SIZE * 0.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconActive: {
    backgroundColor: '#00AD3C',
  },
});

export default withTheme(MainSceneView);
