import color from 'color';
import React, { Component } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import Res from '../../../res';
import { mapTempToKelvin, mapKelvinToTemp } from '../../../utils';
import { WHITEPARAM } from '../../../config';
import HuePicker from '../../../components/HuePicker';

const { color: Color } = Utils.ColorUtils;
const { convertX: cx, convertY: cy, width: winWidth } = Utils.RatioUtils;

const SINGLE_SCENE_WIDTH = winWidth * 0.6;
const SINGLE_SCENE_HEIGHT = SINGLE_SCENE_WIDTH + 20;

const PICKER_WIDTH = SINGLE_SCENE_WIDTH;
const PICKER_HEIGHT = PICKER_WIDTH;

interface ColourEditorProps {
  theme: {
    fontColor: string;
    themeColor: string;
  };
  isCold: boolean;
  isSupportColor: boolean;
  isSupportWhite: boolean;
  isSupportWhiteTemp: boolean;
  isSupportWhiteBright: boolean;
  scrollAnimatecd?: boolean;
  scrollEnalbe?: boolean;
  isColour: boolean;
  hsb: number[];
  kelvin: number;
  whiteBrightness: number;
  onDelete?: () => void;
  onChange: (data: EditColorData, complete: boolean) => void;
}

interface EditColorData {
  isColour: boolean;
  hsb: number[];
  whiteHsb: number[];
  kelvin: number;
  whiteBrightness: number;
}

interface ColourEditorState {
  isColour: boolean;
  hsb: number[];
  whiteHsb: number[];
  kelvin: number;
  whiteBrightness: number;
}

// 点击颜色方块展开的颜色编辑器
export default class ColourEditor extends Component<ColourEditorProps, ColourEditorState> {
  static defaultProps = {
    scrollAnimatecd: true,
    scrollEnalbe: true,
  };

  flatList;

  constructor(props) {
    super(props);
    const { isSupportColor, isColour } = props;
    const whiteHsb = this.calcWhiteHsb(props.kelvin, props.whiteBrightness);
    this.state = {
      isColour: isSupportColor && isColour,
      hsb: props.hsb,
      whiteHsb,
      kelvin: props.kelvin,
      whiteBrightness: props.whiteBrightness,
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps: ColourEditorProps) {
    const { isColour, hsb, kelvin, whiteBrightness } = this.props;

    if (isColour !== nextProps.isColour) {
      this.setState({
        isColour: nextProps.isSupportColor && nextProps.isColour,
      });
    }

    if (hsb !== nextProps.hsb) {
      this.setState({ hsb: nextProps.hsb });
    }

    if (kelvin !== nextProps.kelvin) {
      const whiteHsb = this.calcWhiteHsb(nextProps.kelvin, nextProps.whiteBrightness);
      this.setState({
        whiteHsb,
        kelvin: nextProps.kelvin,
      });
    }

    if (whiteBrightness !== nextProps.whiteBrightness) {
      this.setState({
        whiteBrightness: nextProps.whiteBrightness,
      });
    }
  }

  componentDidUpdate() {
  }

  shouldComponentUpdate(_: ColourEditorProps, nextState: ColourEditorState) {
    const { isColour, hsb, whiteHsb, kelvin, whiteBrightness } = this.state;
    return (
      isColour !== nextState.isColour ||
      hsb !== nextState.hsb ||
      whiteHsb !== nextState.whiteHsb ||
      kelvin !== nextState.kelvin ||
      whiteBrightness !== nextState.whiteBrightness
    );
  }

  calcWhiteHsb(k: number, b: number) {
    const { isCold, isSupportWhiteTemp } = this.props;
    let kelvin = k;
    if (!isSupportWhiteTemp) {
      kelvin = isCold ? WHITEPARAM.KELVIN_MAX : WHITEPARAM.KELVIN_MIN;
    }
    const rgb = Utils.ColorUtils.color.kelvin2rgb(kelvin);
    const [h, s] = Utils.ColorUtils.color.rgb2hsb(...rgb);
    return [h, s, b];
  }

  _handleHueChange = (hueValue: number, saturationValue: number) => {
    const { onChange } = this.props;
    const { isColour, hsb, whiteHsb, kelvin, whiteBrightness } = this.state;

    if (hueValue < 0 || saturationValue < 0) {
      onChange({
        isColour,
        hsb,
        whiteHsb,
        kelvin,
        whiteBrightness,
      }, false);
      return;
    }

    const newHsb = [...hsb];
    newHsb[0] = hueValue;
    newHsb[1] = saturationValue / 10;
    onChange({
      isColour,
      hsb: newHsb,
      whiteHsb,
      kelvin,
      whiteBrightness,
    }, false);
  };

  _handleHueComplete = (hueValue: number, saturationValue: number) => {
    const { onChange } = this.props;
    this.setState(({ isColour, hsb, whiteHsb, kelvin, whiteBrightness }) => {
      const newHsb = [...hsb];
      newHsb[0] = hueValue;
      newHsb[1] = saturationValue / 10;
      onChange({
        isColour,
        hsb: newHsb,
        whiteHsb,
        kelvin,
        whiteBrightness,
      }, true);
      return { hsb: newHsb };
    });
  };

  handleTempChange = (_, __, tempValue: number) => {
    const { onChange } = this.props;
    const { isColour, hsb, whiteBrightness, kelvin, whiteHsb } = this.state;

    if (tempValue < 0) {
      onChange({
        isColour,
        hsb,
        whiteHsb,
        kelvin,
        whiteBrightness,
      }, false);
      return;
    }

    const newValue = mapTempToKelvin(tempValue);
    const rgb = Color.kelvin2rgb(newValue);
    const newHsb = Color.rgb2hsb(...rgb);
    whiteHsb[2] = whiteBrightness;
    onChange({
      isColour,
      hsb,
      whiteHsb: newHsb,
      kelvin: newValue,
      whiteBrightness,
    }, false);
  };

  handleTempComplete = (_, __, tempValue: number) => {
    const newValue = mapTempToKelvin(tempValue);
    const rgb = Color.kelvin2rgb(newValue);
    const newHsb = Color.rgb2hsb(...rgb);

    const { onChange } = this.props;
    this.setState(({ isColour, hsb, whiteBrightness }) => {
      const whiteHsb = newHsb;
      const kelvin = newValue;
      whiteHsb[2] = whiteBrightness;
      onChange({
        isColour,
        hsb,
        whiteHsb,
        kelvin,
        whiteBrightness,
      }, true);
      return { whiteHsb, kelvin };
    });
  };

  _toggleSelector = (value: boolean) => () => {
    const { onChange } = this.props;
    const { isColour, hsb, kelvin, whiteHsb, whiteBrightness } = this.state;
    if (value === isColour) {
      return;
    }
    this.setState({ isColour: value });
    const newWhiteHsb = [...whiteHsb];
    newWhiteHsb[2] = whiteBrightness;
    onChange({
      isColour: value,
      hsb,
      whiteHsb: newWhiteHsb,
      kelvin,
      whiteBrightness,
    }, true);
  };

  _renderSelectSection = () => {
    const {
      theme: { fontColor: C1, themeColor: C2 },
      isSupportColor,
      isSupportWhite,
    } = this.props;

    const { isColour } = this.state;
    const borderColor = color(C1).alpha(0.3).rgbString();
    const iconBgColor = color(C1).alpha(0.1).rgbString();
    const activeIconBgColor = color(C2).alpha(0.5).rgbString();
    return (
      <View style={[styles.row, { width: '100%', marginTop: 30 }]}>
        <View
          style={[styles.row, styles.colourSelector, { borderColor, backgroundColor: iconBgColor }]}
        >
          {isSupportColor && (
            <TouchableOpacity
              accessibilityLabel="CustomScene_ColourEditor_ColourTab"
              activeOpacity={0.9}
              style={[styles.colourBox, isColour && { backgroundColor: activeIconBgColor }]}
              onPress={this._toggleSelector(true)}
            >
              <Image source={Res.colour} />
            </TouchableOpacity>
          )}
          {isSupportWhite && (
            <TouchableOpacity
              accessibilityLabel="CustomScene_ColourEditor_WhiteTab"
              activeOpacity={0.9}
              style={[styles.colourBox, !isColour && { backgroundColor: activeIconBgColor }]}
              onPress={this._toggleSelector(false)}
            >
              <Image source={Res.temp} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  /* 渲染彩光和白光取色控件 */
  _renderPickSection() {
    const { hsb, kelvin, isColour } = this.state;
    const [hue, saturation] = hsb;

    return (
      <View style={[styles.pickerView]}>
        {isColour &&
          <View style={styles.pickerView} >
            <HuePicker
              hue={hue}
              saturation={saturation * 10}
              temp={0}
              radius={PICKER_HEIGHT * 0.5}
              thumbRadius={20}
              thumbInnerRadius={18}
              onValueChange={this._handleHueChange}
              onComplete={this._handleHueComplete}
            />
          </View>
          }
          {!isColour &&
          <View style={styles.pickerView} >
            <HuePicker
              type='white'
              hue={0}
              saturation={0}
              temp={mapKelvinToTemp(kelvin)}
              tempMin={WHITEPARAM.TEMP_MIN}
              tempMax={WHITEPARAM.TEMP_MAX}
              radius={PICKER_HEIGHT * 0.5}
              thumbRadius={20}
              thumbInnerRadius={18}
              onValueChange={this.handleTempChange}
              onComplete={this.handleTempComplete}
            />
          </View>
          }
      </View>
    );
  }

  render() {
    const {
      isSupportColor,
      isSupportWhite,
    } = this.props;
    if (!isSupportColor && !isSupportWhite) {
      return null;
    }

    return (
      <View style={styles.container}>
        <View style={[styles.content, { backgroundColor: 'transparent' }]}>
          {/* 彩光、白光、删除选择区域 */}
          {this._renderSelectSection()}
          {/* Slider区域 */}
          {this._renderPickSection()}
        </View>
      </View>
    );
  }
}

const SLIDER_WIDTH = cx(316);
const SLIDER_HEIGHT = Math.max(6, cy(6));

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },

  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  pickerView: {
    width: SINGLE_SCENE_WIDTH,
    height: SINGLE_SCENE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#00ff00'
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',//'space-between',
    marginRight: 5,
  },

  colourSelector: {
    borderRadius: Math.max(40, cx(40)) / 2,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },

  colourBox: {
    width: Math.max(58, cx(58)),
    height: Math.max(40, cx(40)),
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteBox: {
    height: cy(30),
    borderRadius: cy(15),
    paddingHorizontal: cx(14),
  },

  text: {
    fontSize: cx(12),
    color: '#fff',
  },

  sliderBox: {
    height: cy(180),
    justifyContent: 'space-around',
    //marginVertical: cy(30),
  },

  slider: {
    width: SLIDER_WIDTH,
    height: cx(28),
    justifyContent: 'center',
  },

  sliderTrack: {
    justifyContent: 'center',
    width: SLIDER_WIDTH,
    height: SLIDER_HEIGHT,
    borderRadius: SLIDER_HEIGHT / 2,
  },

  sliderThumb: {
    width: cx(24),
    height: cx(24),
    borderRadius: cx(12),
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 1.5,
    elevation: 1,
  },

  scrollContent: {
    height: SINGLE_SCENE_HEIGHT,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },

  iconActive: {
    backgroundColor: '#fff',
  },

  thumbStyle: {
    backgroundColor: 'transparent',
  },
});
