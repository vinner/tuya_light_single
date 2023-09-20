/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import { ColorParser } from '../../../utils';

const { winWidth } = Utils.RatioUtils;

// 每行的颜色方块数量
const basicColors = [
  { isColor: true, hue:   0, saturation:  10, kelvin:0 },
  { isColor: true, hue:  50, saturation:  30, kelvin:0 },
  { isColor: true, hue: 100, saturation:  50, kelvin:0 },
  { isColor: true, hue: 150, saturation:  80, kelvin:0 },
  { isColor: true, hue: 200, saturation: 100, kelvin:0 },
  { isColor: true, hue: 250, saturation:  50, kelvin:0 },
  { isColor: true, hue: 300, saturation:  80, kelvin:0 },
  { isColor: true, hue:   0, saturation:  10, kelvin:0 },
  { isColor: true, hue:  50, saturation:  30, kelvin:0 },
  { isColor: true, hue: 100, saturation:  50, kelvin:0 },
  { isColor: true, hue: 150, saturation:  80, kelvin:0 },
  { isColor: true, hue: 200, saturation: 100, kelvin:0 },
  { isColor: true, hue: 250, saturation:  50, kelvin:0 },
  { isColor: false, hue: 0, saturation:  0, kelvin:5000 },
];

interface BasicColorProps {
  theme: any;
  onChange: (isColor: boolean, h: number, s: number, k: number) => void;
}

interface BasicColorState {
  activeIdx: number;
}

export default class BasicColors extends Component<BasicColorProps,BasicColorState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    theme: {
      fontColor: '#fff',
      themeColor: '#39A9FF',
    },
    onChange: null,
  };

  constructor(props: BasicColorProps) {
    super(props);
    this.state = {
      activeIdx: -1,
    };
  }

  /* 预置的颜色，选择时取色控件需要显示相应的颜色 */
  _handleColorSelected = (index) => {
    this.setState({activeIdx: index});
    this.props.onChange(
      basicColors[index].isColor,
      basicColors[index].hue,
      basicColors[index].saturation,
      basicColors[index].kelvin
      );
  };

  /* 渲染预置颜色列表按键 */
  render() {
    const color_map = basicColors;
    const sel_index = this.state.activeIdx;

    return (
      <View style={styles.color_view}>
        {
          color_map.map((item, index) => {
            let backgroundColor;
            if (item.isColor) {
              backgroundColor = ColorParser.hsv2rgba(item.hue, item.saturation * 10, 1000);
            } else {
              const rgb = Utils.ColorUtils.color.kelvin2rgb(item.kelvin);
              const whiteHsb = Utils.ColorUtils.color.rgb2hsb(...rgb);
              backgroundColor = ColorParser.hsv2rgba(whiteHsb[0], whiteHsb[1] * 10, 1000);
            }

            return (
              <View style={styles.color_item}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.color_item_sel_view, sel_index === index && {backgroundColor: '#fff'}]}
                  onPress={() => this._handleColorSelected(index)}
                >
                  <View style={[styles.color_item_view, {backgroundColor}]} />
                </TouchableOpacity>
              </View>
            );
          })
        }
      </View>
    );
  }
}

const CNT_PRE_LINE = 7;
const COLOR_VIEW_MARGIN_H = 20;
const COLOR_VIEW_MARGIN_V = 0;
const COLOR_ITEM_RADIUS = 4;

const COLOR_VIEW_WIDTH = winWidth - (COLOR_VIEW_MARGIN_H * 2);
const COLOR_VIEW_HEIGHT = COLOR_VIEW_WIDTH / CNT_PRE_LINE * 2;

const COLOR_ITEM_SIZE = COLOR_VIEW_WIDTH / CNT_PRE_LINE;
const COLOR_ITEM_VIEW_SIZE = COLOR_ITEM_SIZE - 18;
const COLOR_ITEM_VIEW_SEL_SIZE = COLOR_ITEM_SIZE - 14;

const styles = StyleSheet.create({
  color_view: {
    width: COLOR_VIEW_WIDTH,
    height: COLOR_VIEW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: COLOR_VIEW_MARGIN_H,
    marginVertical: COLOR_VIEW_MARGIN_V,
  },
  color_item: {
    width: COLOR_ITEM_SIZE,
    height: COLOR_ITEM_SIZE,
    borderRadius: COLOR_ITEM_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  color_item_sel_view: {
    width: COLOR_ITEM_VIEW_SEL_SIZE,
    height: COLOR_ITEM_VIEW_SEL_SIZE,
    borderRadius: COLOR_ITEM_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',

  },
  color_item_view: {
    width: COLOR_ITEM_VIEW_SIZE,
    height: COLOR_ITEM_VIEW_SIZE,
    borderRadius: COLOR_ITEM_RADIUS,
  },
});
