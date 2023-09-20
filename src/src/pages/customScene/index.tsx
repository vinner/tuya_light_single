/* eslint-disable @typescript-eslint/no-empty-function */
import _ from 'lodash';
import color from 'color';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Image, TouchableOpacity, ScrollView, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Utils, TYSdk, TYText, Tips } from 'tuya-panel-kit';
import { lampPutDpData } from '../../api';
import { ReduxState } from '../../models';
import SceneColourSelector from './scene-colour-selector';
import SceneSpeedSelector from './scene-speed-selector';
import Strings from '../../i18n';
import { ColorParser, randomHsb, mapTempToKelvin, mapKelvinToTemp } from '../../utils';
import { WHITEPARAM } from '../../config';
import TopBar from '../../components/topbar';
import DpCodes from '../../config/dpCodes';
import {
  defaultThemeScenes,
  defaultCustomScenes,
} from '../../config/scenes';
import SupportUtils from '../../utils/support';
import Res from '../../res';
import NameEditor from './name-editor';
import SliderSelector from '../../components/SliderSelector';
import icons from '../../res/iconfont';
import Popup from '../../components/popup';

const { convertX: cx, convertY: cy, winWidth } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;
const { controlCode: controlDataCode, sceneCode: sceneValueCode } = DpCodes;
const { isSupportColour, isSupportWhite, isSupportBright, isSupportTemp } = SupportUtils;
const TYNative = TYSdk.native;

const LIST_ITEM_HEIGHT = cy(50);
const LIST_ITEM_MARGIN_TOP = 24;

const TIP_POS_Y = (LIST_ITEM_HEIGHT + LIST_ITEM_MARGIN_TOP) * 2 - 20;
const TIP_ITEM_HEIGHT = 50;
const TIP_WIDTH = winWidth / 3;
const TIP_HEIGHT = TIP_ITEM_HEIGHT * 3;

interface SceneData {
  name: string;
  value: string;
}

interface SceneColor {
  isColour: boolean;
  hsb: number[];
  whiteHsb: number[];
  kelvin: number;
  whiteBrightness: number;
}

interface CustomSceneProps {
  id: string | number | any;
  title: string;
  isEdit: boolean;
  value: string;
  initFlag: boolean;
  sceneValue?: string;
  sceneDatas: SceneData[];
  onComplete: (value: string, sceneDatas)=>void;
  theme?: any;
}
interface CustomSceneState {
  isBuiltIn: boolean;
  pic?: any;
  name: string;
  sceneNo: string | number;
  flashMode: number;
  flashSpeed: number;
  // 默认给一个颜色
  colours: SceneColor[];
  showMode: boolean;
  bright: number;
  nameEditting: boolean;
  scrollEnabled: boolean;
}

class CustomScene extends Component<CustomSceneProps, CustomSceneState> {
  constructor(props: CustomSceneProps) {
    super(props);
    const {
      theme: {
        global: { fontColor, themeColor },
      },
    } = props;
    // 默认给一个白光
    let kelvin = isSupportTemp() ? WHITEPARAM.KELVIN_MAX : WHITEPARAM.KELVIN_MIN;
    const whiteBrightness = 100;
    let whiteRgb = Utils.ColorUtils.color.kelvin2rgb(kelvin);
    if (!isSupportTemp()) {
      kelvin = 0;
      whiteRgb = Utils.ColorUtils.color.kelvin2rgb(2500);
    }

    const [whiteHue, whiteSaturation] = Utils.ColorUtils.color.rgb2hsb(...whiteRgb);

    const num = props.value.slice(0, 2);
    const id = parseInt(num, 16) - 0x61;
    const picSource = Res[`dp_scene_custom_${id}`]

    const defaultState: CustomSceneState = {
      isBuiltIn: false,
      pic: picSource,
      name: '',
      sceneNo: parseInt(num),
      flashMode: 0,
      flashSpeed: 40,
      bright: 100,
      showMode: false,
      nameEditting: false,
      scrollEnabled: true,
      // 默认给一个颜色
      colours: [
        {
          isColour: isSupportColour(),
          hsb: randomHsb(),
          whiteHsb: [whiteHue, whiteSaturation, whiteBrightness],
          kelvin,
          whiteBrightness,
        },
      ],
    };

    if (!props.isEdit) {
      this.state = defaultState;
    } else {
      this.state = this.mapSceneDataToState(
        { sceneValue: props.value, sceneDatas: props.sceneDatas },
        defaultState
      );
    }
    this._theme = {
      FONT_COLOR: fontColor,
      THEME_COLOR: themeColor,
      BORDER_COLOR: color(fontColor).alpha(0.3).rgbString(),
      ICON_BG_COLOR: color(themeColor).alpha(0.1).rgbString(),
    };
  }

  componentWillUpdate(nextProp, __) {
    if (nextProp.initFlag !== this.props.initFlag || nextProp.value !== this.props.value) {
      //TYSdk.native.simpleTipDialog('handleInit ' + nextProp.initFlag, () => {});
      this.handleInit(nextProp);
    }
  }

  _theme: {
    FONT_COLOR: string;
    THEME_COLOR: string;
    BORDER_COLOR: string;
    ICON_BG_COLOR: string;
  };

  _coloursRef: SceneColourSelector;

  // todo return type
  mapSceneDataToState(
    {
      sceneValue,
      sceneDatas,
    }: {
      sceneValue: string;
      sceneDatas: SceneData[];
    },
    defaultState?: CustomSceneState
  ): CustomSceneState {
    // sigmesh下切换场景值，数据只有场景号
    let newSceneValue = sceneValue;
    if (sceneValue.length <= 2) {
      return defaultState!;
    }
    const decodedSceneData = ColorParser.decodeSceneData(newSceneValue);
    // 变换方式和变换速度暂时统一
    const sceneNo = _.get(decodedSceneData, 'sceneNum');
    const scenes = _.get(decodedSceneData, 'scenes') || [];
    const flashMode = _.get(decodedSceneData, 'scenes[0].m');
    const flashSpeed = _.get(decodedSceneData, 'scenes[0].f');
    const sceneData = sceneDatas.find(d => +d.value.slice(0, 2) === +sceneNo);
    const picNum = parseInt(`${sceneNo}`, 16) - 0x61;
    const pic = Res[`dp_scene_custom_${picNum}`];
    const name = _.get(sceneData, 'name') || '';
    const colours = scenes.map(({ h, s, v, k, b }) => {
      const isColour = !k && !b;
      // 在彩光时，色温取100%，确保切换到白光色温为100%
      let kelvin = isColour ? WHITEPARAM.KELVIN_MAX : mapTempToKelvin(k);
      let whiteRgb = Utils.ColorUtils.color.kelvin2rgb(kelvin);
      if (!isSupportTemp()) {
        kelvin = 0;
        whiteRgb = Utils.ColorUtils.color.kelvin2rgb(WHITEPARAM.KELVIN_MIN);
      }
      const [whiteHue, whiteSaturation] = Utils.ColorUtils.color.rgb2hsb(...whiteRgb);
      return {
        isColour,
        hsb: isColour ? [h, s / 10, v / 10 || 1] : randomHsb(), // 亮度最小值需要为1(在保存时如果不为彩光会被置为0)
        whiteHsb: [whiteHue, whiteSaturation, b / 10],
        kelvin,
        // 在彩光时，亮度取100%，确保切换到白光亮度为100%
        whiteBrightness: !isColour ? b / 10 : 100, // 亮度最小值需要为1(在保存时如果不为白光会被置为0)
      };
    });
    const bright = colours.length <= 0 ? 100 : colours[colours.length - 1].whiteBrightness;
    return {
      isBuiltIn: false, //isSupportColour() || sceneNo <= 3,
      pic,
      name,
      sceneNo,
      flashMode,
      flashSpeed,
      bright,
      colours,
      showMode: false,
      nameEditting: false,
      scrollEnabled: true,
    };
  }

  name: string = '';
  layout_width: number = 0;
  layout_height: number = 0;


  _handleNameChange = (value: string) => {
    this.setState({nameEditting: false, name: value});
  };

  _handleLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    this.layout_width = layout.width;
    this.layout_height = layout.height;
  };

  _handleCommonAct = () => {
    if (this.state.showMode) {
      this.setState({showMode: false});
    }
  };

  _handleEditSceneName = () => {
    this._handleCommonAct();
    this.setState({nameEditting: true});
  };

  _handleColorChange = _.throttle((colours: SceneColor[], curColour: SceneColor, complete: boolean) => {
    this._handleCommonAct();
    if (controlDataCode && curColour && curColour.hsb) {
      const { isColour, hsb, whiteBrightness, kelvin } = curColour;
      const h = isColour ? hsb[0] : 0;
      const s = isColour ? hsb[1] * 10 : 0;
      const v = isColour ? hsb[2] * 10 : 0;
      const b = isColour ? 0 : whiteBrightness * 10;
      let k = Math.round(mapKelvinToTemp(kelvin));
      if (isColour) k = 0;
      else if (!isSupportTemp()) k = 1000;
      const encodeControlColor = ColorParser.encodeControlData(1, h, s, v, b, k);
      lampPutDpData({ [controlDataCode]: encodeControlColor });
    }
    this.setState({ colours });
    this.handleScrollDisable(complete);
  }, 150);

  _handleShowFlashMode = () => {
    //this.setState({showMode: !this.state.showMode});
    const data = [0, 3, 1, 2].map((key: number) => ({
      key,
      value: key,
      title: Strings.getDpLang(sceneValueCode, `flashMode__${key}`),
    }));
    Popup.list({
      title: Strings.getDpLang(sceneValueCode, 'flashMode'),
      value: this.state.flashMode,
      dataSource: data,
      showTitleDivider: false,
      footerType: 'singleCancel',
      cancelText: Strings.getLang('cancel'),
      cancelTextStyle: {color: '#fff', fontWeight: 'bold'},
      cancelButtonStyle: { backgroundColor: '#04001e', borderRadius: 30, marginHorizontal: cx(10), },
      onSelect: (v: number) => {
        Popup.close();
        this._handleFlashModeChange(v);
      },  
    }); 
  };

  _handleFlashModeChange = (v: string | number) => {
    const mode = +v;
    // 非静态模式下，至少二个颜色
    const { colours } = this.state;
    if (mode !== 0 && colours!.length < 2) {
      const kelvin = isSupportTemp() ? WHITEPARAM.KELVIN_MAX : WHITEPARAM.KELVIN_MIN;
      const rgb = Utils.ColorUtils.color.kelvin2rgb(kelvin);
      const whiteHsb = Utils.ColorUtils.color.rgb2hsb(...rgb);
      colours!.push({
        isColour: isSupportColour(),
        hsb: randomHsb(),
        whiteHsb,
        kelvin,
        whiteBrightness: 100,
      });
    }
    this.setState({ flashMode: mode, colours });
  };

  _handleBrightChange = (value: number, complete: boolean) => {
    this._handleCommonAct();
    this.handleScrollDisable(complete);

    if (complete) {
      this.setState({ bright: Math.round(value) });
    }
  };

  _handleFlashSpeedChange = (value: number, complete: boolean) => {
    this._handleCommonAct();
    this.handleScrollDisable(complete);

    if (complete) {
      this.setState({ flashSpeed: Math.round(value) });
    }
  };

  _handleDeleteScene = () => {
    this._handleCommonAct();
    const { sceneDatas } = this.props;
    const { sceneNo } = this.state;
    const newSceneDatas = [...sceneDatas];
    let defaultSceneData = defaultThemeScenes[0];
    let firstValue = defaultSceneData.value;  
    defaultSceneData = defaultCustomScenes[parseInt(`${sceneNo}`, 16) - 0x61];

    // 也要把数组中的对象浅拷贝一份，否则修改会影响到initState
    const id = _.findIndex(newSceneDatas, d => +d.value.slice(0, 2) === +this.state.sceneNo);
    newSceneDatas[id] = defaultSceneData;

    typeof this.props.onComplete === 'function' ? this.props.onComplete(firstValue, newSceneDatas) : {};
  };

  _handleSubmit = async () => {
    this._handleCommonAct();
    if (!this.state.name) {
      // 判空
      return TYNative.simpleTipDialog(
        Strings.getLang(!this.state.name ? 'nameNotEmpty' : 'coloursNotEmpty'),
        () => {}
      );
    }
    if (typeof this._handleColorChange.cancel === 'function') {
      this._handleColorChange.cancel();
    }

    const { sceneDatas } = this.props;

    // 根据亮度和模式生成颜色数据
    const kelvin = 9000;
    const whiteBrightness = this.state.bright;
    const whiteRgb = Utils.ColorUtils.color.kelvin2rgb(9000);
    const [whiteHue, whiteSaturation] = Utils.ColorUtils.color.rgb2hsb(...whiteRgb);

    // 需要两个颜色数据，一个用户设置亮度的颜色数据，和一个灭灯的颜色数据（即亮度为0）
    const colours: SceneColor[] = [
      {
        isColour: false,
        hsb: [0, 0, 0],
        whiteHsb: [whiteHue, whiteSaturation, 0],
        kelvin,
        whiteBrightness: 0,
      },
      {
        isColour: false,
        hsb: [0, 0, 0],
        whiteHsb: [whiteHue, whiteSaturation, whiteBrightness],
        kelvin,
        whiteBrightness,
      },
    ];

    const sceneData = colours.map(
      ({ isColour, hsb, kelvin, whiteBrightness }: SceneColor) => {
        const [h, s, v] = hsb;
        let k = Math.round(mapKelvinToTemp(kelvin));
        if (isColour) k = 0;
        else if (!isSupportTemp()) k = 1000;
        return {
          h: isColour ? h : 0,
          s: isColour ? s * 10 : 0,
          v: isColour ? v * 10 : 0,
          b: isColour ? 0 : whiteBrightness * 10,
          k,
          m: this.state.flashMode,
          f: this.state.flashSpeed,
          t: this.state.flashSpeed,
        };
      }
    );
    // 静态模式下只取一种颜色
    const value = ColorParser.encodeSceneData(
      this.state.flashMode === 0 ? [sceneData[sceneData.length - 1]] : sceneData,
      parseInt(`${this.state.sceneNo}`)
    );

    const newSceneDatas: SceneData[] = [...sceneDatas];

    // 也要把数组中的对象浅拷贝一份，否则修改会影响到initState
    const sceneNo = _.findIndex(newSceneDatas, d => +d.value.slice(0, 2) === +this.state.sceneNo);
    const newSceneData = { ...newSceneDatas[sceneNo] };

    newSceneData.name = this.state.name;
    newSceneData.value = value;
    newSceneDatas[sceneNo] = newSceneData;

    typeof this.props.onComplete === 'function' ? this.props.onComplete(value, newSceneDatas) : {};
  };

  _renderTitle() {
    return (
      <View>
        <TYText style={styles.diyText}> {'Diy'} </TYText>
        <NameEditor
          value={this.state.name}
          onChange={value => this._handleNameChange(value)}
        />
      </View>
    );
  }

  _renderListSection({
    key,
    title,
    value,
    onPress,
  }: {
    key: string;
    title: string;
    value: string;
    onPress: (params?: any) => void;
  }) {
    const { FONT_COLOR } = this._theme;
    const dimmedColor = color(FONT_COLOR).alpha(0.9).rgbString();
    return (
      <View style={[styles.section, styles.section__listItem]}>
        <TouchableOpacity
          accessibilityLabel={`CustomScene_${key}`}
          style={styles.row}
          activeOpacity={0.8}
          onPress={onPress}
        >
          <TYText style={[styles.text, { color: FONT_COLOR }]}>{title}</TYText>
          <View style={styles.row__right}>
            <TYText style={[styles.text, { color: dimmedColor, marginRight: cx(9) }]}>
              {value}
            </TYText>
            <Image source={Res.arrow} />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  scrollView : ScrollView;

  handleInit = (nextProp) => {
    if (nextProp.isEdit) {
      //TYSdk.native.simpleTipDialog('edit: ' + nextProp.value + ',' + nextProp.sceneDatas, () => {});
      this.setState(this.mapSceneDataToState(
          { sceneValue: nextProp.value, sceneDatas: nextProp.sceneDatas }));
    } else {
      let kelvin = isSupportTemp() ? 5000 : 0;
      const whiteBrightness = 100;
      let whiteRgb = Utils.ColorUtils.color.kelvin2rgb(kelvin);
      if (!isSupportTemp()) {
        kelvin = 0;
        whiteRgb = Utils.ColorUtils.color.kelvin2rgb(2500);
      }
      const [whiteHue, whiteSaturation] = Utils.ColorUtils.color.rgb2hsb(...whiteRgb);
      const num = nextProp.value.slice(0, 2);

      this.setState({
        isBuiltIn: false,
        name: '',
        sceneNo: parseInt(num),
        flashMode: 0,
        flashSpeed: 40,
        // 默认给一个颜色
        colours: [
          {
            isColour: isSupportColour(),
            hsb: randomHsb(),
            whiteHsb: [whiteHue, whiteSaturation, whiteBrightness],
            kelvin,
            whiteBrightness,
          },
        ],
        });
    }

    this.scrollView.scrollTo({x: 0, y: 0, animated: false});
  }

  handleScrollDisable = (enable: boolean) => {
    this.state.scrollEnabled !== enable && 
    this.setState({ scrollEnabled: enable});
  }

  handleTopBarBack = () => {
    typeof this.props.onComplete === 'function' ? this.props.onComplete('', []) : {};
  }

  /* 渲染顶部控制栏 */
  renderTopBar = () => {
    return (
      <TopBar
        title={TYSdk.devInfo.name}
        backhandle={this.handleTopBarBack}
        setting={false}
      />
    );
  }

  render() {
    const { isEdit } = this.props;
    const { flashSpeed, flashMode, isBuiltIn, colours } = this.state;
    const { FONT_COLOR, THEME_COLOR, BORDER_COLOR } = this._theme;
    const isStatic = flashMode === 0;

    return (
      <View style={styles.root}>
        <View style={styles.container} onLayout={this._handleLayout}>
          {this.renderTopBar()}
          <ScrollView
            ref={(ref: ScrollView) => {this.scrollView = ref}}
            accessibilityLabel="CustomScene_ScrollView"
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollView]}
            scrollEnabled={this.state.scrollEnabled}
          >
            {/* 场景名称 */}
            {this._renderTitle()}

            <View style={[styles.border__bottom, { backgroundColor: BORDER_COLOR }]} />

            {/* 场景颜色变换方式 */}
            {this._renderListSection({
              key: 'EditFlashMode',
              title: Strings.getDpLang(sceneValueCode, 'flashMode'),
              value: Strings.getDpLang(sceneValueCode, `flashMode__${this.state.flashMode}`),
              onPress: this._handleShowFlashMode,
            })}

            <View style={{ paddingHorizontal: 20 }}>
              <TYText style={{ fontSize:16, color: '#000', paddingLeft: 10, marginVertical: 20 }}>{'Brightness control'}</TYText>
              <SliderSelector
                    minValue={1}
                    maxValue={100}
                    value={this.state.bright}
                    onSlidingComplete={this._handleBrightChange}
                  />
            </View>

            <View style={{ paddingHorizontal: 20, marginBottom: 40 }}>
              <TYText style={{ fontSize:16, color: '#000', paddingLeft: 10, marginVertical: 20 }}>{'Blink rate'}</TYText>
              <SliderSelector
                    disabled={isStatic}
                    minValue={40}
                    maxValue={100}
                    value={flashSpeed}
                    iconLeft={icons.speed}
                    onSlidingComplete={this._handleFlashSpeedChange}
                  />
            </View>
          </ScrollView>

          {/* 提交 */}
          <View
            style={{flexDirection:'row', backgroundColor:'transparent', alignItems: 'center', justifyContent: 'space-evenly', marginVertical: 24}}
          >
            <TouchableOpacity
              accessibilityLabel="CustomScene_Submit"
              activeOpacity={0.8}
              style={[styles.section, styles.section__submit]}
              onPress={this._handleSubmit}
            >
              <TYText style={[styles.text, { color: '#fff', fontSize: cx(18) }]}>
                {Strings.getLang('submit')}
              </TYText>
            </TouchableOpacity>
          </View>
        </View>   
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  topbarTitle: {
    backgroundColor: 'transparent',
    fontSize: cx(20),
    color: '#000',
    fontWeight: 'bold',
  },
  scrollView: {
    alignSelf: 'stretch',
    paddingBottom: 20,
  },
  diyText: {
    fontSize: 30,
    color: '#000',
    paddingLeft: cx(17),
    marginVertical: 30,
    fontWeight: 'bold',
  },
  section: {
    marginTop: LIST_ITEM_MARGIN_TOP,
    backgroundColor: 'transparent',
  },
  section__pic: {
    width: cx(100),
    height: cx(100),
    borderRadius: cx(50),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  section__reset: {
    position: 'absolute',
    top: 24,
    right: cx(16),
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: cx(10),
    borderRadius: 15,
  },
  section__listItem: {
    alignSelf: 'stretch',
    height: LIST_ITEM_HEIGHT,
    marginHorizontal: cx(16),
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: LIST_ITEM_HEIGHT / 2 - 3,
    backgroundColor: color('#f6f6f6').alpha(0.8).rgbString(),
    paddingLeft: cx(18),
    paddingRight: cx(18),
  },
  row__right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: cx(16),
  },
  border__bottom: {
    flex: 1,
    height: cx(1),
    marginTop: 3,
    marginBottom: cx(18),
    marginHorizontal: cx(20),
  },
  section__delete: {
    marginTop: 10,
    width: cx(120),
    height: cy(40),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#c83333',
    borderRadius: cx(25),
  },
  section__submit: {
    marginTop: 10,
    width: winWidth - 70,
    height: cy(50),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#04001e',
    borderRadius: cy(25),
  },
  tips: {
    position: 'absolute',
    top: TIP_POS_Y,
    right: 30
  },
  tips_content: {
    width: TIP_WIDTH,
    height: TIP_HEIGHT,
    borderRadius: 16,
  },
  tip_item: {
    width: '100%',
    height: TIP_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip_text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default connect(({ cloudState }: ReduxState) => ({
  sceneDatas: cloudState.sceneDatas || [],
}))(withTheme(CustomScene));
