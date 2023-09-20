import React, { Component } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Utils, TYText, Tabs, IconFont } from 'tuya-panel-kit';
import { WHITEPARAM } from '../../../../config';
import HuePicker from '../../../../components/HuePicker';
import { getColorRgba, getWhiteRgba } from '../../../../utils';
import SliderSelector from '../../../../components/SliderSelector';
import icons from '../../../../res/iconfont';
import DimmerPanelList from './dimmer-panel-list';
import BottomSlider from './bottom-slider';

const { convertX: cx, convertY: cy, width: winWidth } = Utils.RatioUtils;

const SINGLE_SCENE_WIDTH = winWidth * 0.7;
const SINGLE_SCENE_HEIGHT = SINGLE_SCENE_WIDTH;

const COLOR_SIZE = SINGLE_SCENE_WIDTH * 0.15;

const PICKER_WIDTH = SINGLE_SCENE_WIDTH;
const PICKER_HEIGHT = PICKER_WIDTH;

const ARROW_WIDTH = cx(40);
const ARROW_HEIGHT = cx(50);
const ARROW_LEFT_POSITION_X = cx(12);
const ARROW_LEFT_POSITION_Y = (PICKER_HEIGHT - ARROW_HEIGHT) * 0.5;
const ARROW_RIGHT_POSITION_X = winWidth - ARROW_WIDTH - cx(12);
const ARROW_RIGHT_POSITION_Y = (PICKER_HEIGHT - ARROW_HEIGHT) * 0.5;

const COLOR_PANEL_CNT = 3;

interface DimmerPanelProps {
  style?: ViewStyle | ViewStyle[];
  disabled: boolean;
  isColour: boolean;
  h: number;
  s: number;
  t: number;
  b: number;
  showAddBtn: boolean;
  onChange: (data: EditColorData, complete: boolean) => void;
  onBrightChange: (b: number, complete: boolean) => void;
  onAddColor: () => void;
}

export interface EditColorData {
  isColour: boolean;
  h: number;
  s: number;
  t: number;
  b: number;
}

interface DimmerPanelState {
  isColour: boolean;
  h: number;
  s: number;
  t: number;
  b: number;
  colorActiveId: number;
}

// 点击颜色方块展开的颜色编辑器
export default class DimmerPanel extends Component<DimmerPanelProps, DimmerPanelState> {
  static defaultProps = {
    scrollEnalbe: true,
  };

  flatList;
  colorRef: View;

  constructor(props) {
    super(props);
    const { isColour } = props;
    this.state = {
      isColour: isColour,
      h: Math.round(props.h),
      s: Math.round(props.s),
      t: Math.round(props.t),
      b: Math.round(props.b),
      colorActiveId: 0,
    };
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps: DimmerPanelProps) {
    this.setState({
      isColour: nextProps.isColour,
      h: Math.round(nextProps.h),
      s: Math.round(nextProps.s),
      t: Math.round(nextProps.t),
      b: Math.round(nextProps.b),
    });
  }

  componentDidUpdate() {
  }

  shouldComponentUpdate(_: DimmerPanelProps, nextState: DimmerPanelState) {
    const { isColour, h, s, t, b, colorActiveId } = this.state;
    return (
      isColour !== nextState.isColour ||
      h !== nextState.h ||
      s !== nextState.s ||
      t !== nextState.t ||
      b !== nextState.b ||
      colorActiveId !== nextState.colorActiveId
    );
  }

  _handleHueComplete = (hueValue: number, saturationValue: number, complete: boolean) => {
    const { onChange } = this.props;
    const { isColour, h, s, t, b } = this.state;

    if (hueValue < 0 || saturationValue < 0) {
      onChange({
        isColour,
        h,
        s,
        t,
        b,
      }, complete);
      return;
    }

    /** 更新显示的颜色 */
    this.colorRef.setNativeProps(
      {style:{backgroundColor: getColorRgba(Math.round(hueValue), Math.round(saturationValue), 1000)}}
      );

    onChange({
      isColour,
      h: hueValue,
      s: saturationValue,
      t,
      b,
    }, complete);
  };

  handleTempComplete = (_, __, tempValue: number, complete: boolean) => {
    const { onChange } = this.props;
    const { isColour, h, s, t, b } = this.state;

    if (tempValue < 0) {
      onChange({
        isColour,
        h, s, t, b
      }, complete);
      return;
    }

    /** 更新显示的颜色 */
    this.colorRef.setNativeProps(
      {style:{backgroundColor: getWhiteRgba(tempValue, 1000)}}
      );

    onChange({
      isColour,
      h, s,
      t: tempValue,
      b,
    }, complete);
  };

  _handleTabSwitch(next: boolean) {
    if (next) {
      this.state.colorActiveId < COLOR_PANEL_CNT - 1 && this.setState({ colorActiveId: this.state.colorActiveId + 1 })
    } else {
      this.state.colorActiveId > 0 && this.setState({ colorActiveId: this.state.colorActiveId - 1 })
    }
  }

  // @ts-ignore
  handleRelease = (gestureState, index) => {
    this.setState({ colorActiveId: index });
  }

  /* 渲染彩光和白光取色控件 */
  _renderPickSection() {
    const { h, s, t, b, isColour, colorActiveId } = this.state;

    return (
      <View style={[styles.pickerView]}>
        {isColour &&
          <View style={{ width: winWidth, height: SINGLE_SCENE_HEIGHT }}>
            <Tabs.TabContent
              disabled={true}
              preload={false}
              activeIndex={colorActiveId}
              onRelease={this.handleRelease}
            >
              <View key={0} style={styles.pickerView} >
                <HuePicker
                  hue={h}
                  saturation={s}
                  temp={0}
                  radius={PICKER_HEIGHT * 0.5}
                  onValueChange={(h, s) => this._handleHueComplete(h, s, false)}
                  onComplete={(h, s) => this._handleHueComplete(h, s, true)}
                />
              </View>
              <View key={1} style={styles.pickerView} >
                <HuePicker
                  type={'rgb2'}
                  hue={h}
                  saturation={s}
                  temp={0}
                  radius={PICKER_HEIGHT * 0.5}
                  onValueChange={(h, s) => this._handleHueComplete(h, s, false)}
                  onComplete={(h, s) => this._handleHueComplete(h, s, true)}
                />
              </View>
              <DimmerPanelList
                style={{width: winWidth, height: SINGLE_SCENE_HEIGHT,}}
                isColour={isColour}
                h={h}
                s={s}
                t={t}
                b={b}
                onChange={(d, c) => this.props.onChange(d, c)}
              />
            </Tabs.TabContent>
            <TouchableOpacity
              style={{
                position: 'absolute',
                left: ARROW_LEFT_POSITION_X,
                top: ARROW_LEFT_POSITION_Y,
                width: ARROW_WIDTH,
                height: ARROW_HEIGHT,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={ () => this._handleTabSwitch(false)}
            >
              <IconFont
                d={icons.left}
                size={cx(22)}
                fill={colorActiveId > 0 ? '#000' : '#cecece'}
                stroke={colorActiveId > 0 ? '#000' : '#cecece'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                position: 'absolute',
                left: ARROW_RIGHT_POSITION_X,
                top: ARROW_RIGHT_POSITION_Y,
                width: ARROW_WIDTH,
                height: ARROW_HEIGHT,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={ () => this._handleTabSwitch(true)}
            >
              <IconFont
                d={icons.right}
                size={cx(22)}
                fill={colorActiveId < COLOR_PANEL_CNT - 1 ? '#000' : '#cecece'}
                stroke={colorActiveId < COLOR_PANEL_CNT - 1 ? '#000' : '#cecece'}
              />
            </TouchableOpacity>
          </View>
          }
          {!isColour &&
          <View style={styles.pickerView} >
            <HuePicker
              type='white'
              hue={0}
              saturation={0}
              temp={t}
              tempMin={WHITEPARAM.TEMP_MIN}
              tempMax={WHITEPARAM.TEMP_MAX}
              radius={PICKER_HEIGHT * 0.5}
              onValueChange={(h, s, t) => this.handleTempComplete(h, s, t, false)}
              onComplete={(h, s, t) => this.handleTempComplete(h, s, t, true)}
            />
          </View>
          }
          
      </View>
    );
  }

  _renderBottomSlider = () => {
    return (
      <BottomSlider
        style={{ marginTop: cx(16)}}
        cnt={COLOR_PANEL_CNT}
        id={this.state.colorActiveId}
        show={this.state.isColour ? true : false}
      />
    );
  }

  _renderColorView = () => {
    const { h, s, t, isColour } = this.state;
    const bg = isColour ? getColorRgba(h, s, 1000)
              : getWhiteRgba(t, 1000);
    return (
      <View
        ref={(ref: View) => {
          this.colorRef = ref;
        }}
        style={{            
          position: 'absolute',
          right: cx(22),
          top: 0,
          width: COLOR_SIZE,
          height: COLOR_SIZE,
          borderRadius: COLOR_SIZE * 0.5,
          backgroundColor: bg,
        }}
      />
    );
  }

  _handleAddSingleColor = () => {
    this.props.onAddColor && this.props.onAddColor();
  }

  _renderAddButton = () => {
    return (
      <TouchableOpacity
        style={{
          width: '50%',
          height: cx(32),
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: cx(16),
          borderColor: '#00AD3C',
          borderWidth: 1,
          marginVertical: cx(20),
        }}
        onPress={this._handleAddSingleColor}
      >
        <TYText style={{ fontSize: cx(12), color: '#00AD3C' }}> {'Add to My colors'} </TYText>
      </TouchableOpacity>
    )
  }

  _handleBrightComplete = (v: number, complete: boolean) => {
    const { onBrightChange } = this.props;
    onBrightChange(Math.floor(v * 10), complete);
  }

  _renderBrightBar = () => {
    const { b } = this.props;
    return (
      <View style={{ width: winWidth - cx(48), marginHorizontal: cx(24), marginTop: cx(10), marginBottom: cx(25)}}>
        <SliderSelector
          disabled={this.props.disabled}
          minValue={1}
          maxValue={100}
          value={ b / 10}
          onSlidingComplete={this._handleBrightComplete}
        />
      </View>
    );
  }

  render() {
    return (
      <View style={[this.props.style, styles.container]}>
        {/* Slider区域 */}
        {this._renderPickSection()}
        {this._renderBottomSlider()}
        {this.props.showAddBtn && this._renderAddButton()}
        {this._renderBrightBar()}
        {this.state.colorActiveId < 2 && this._renderColorView()}
      </View>
    );
  }
}

const SLIDER_WIDTH = cx(316);
const SLIDER_HEIGHT = Math.max(6, cy(6));

const styles = StyleSheet.create({
  container: {
    width: winWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pickerView: {
    width: winWidth,
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
