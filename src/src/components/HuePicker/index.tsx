/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import {
  View,
  Image,
  PanResponder,
  StyleSheet,
  ViewStyle,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
  StyleProp,
} from 'react-native';
import { Utils, TYSdk, } from 'tuya-panel-kit';

const MOVE_THRESHOLD = 5;
let tempCoordY: number = 0;

interface HuePickerProps {
  accessibilityLabel: string;
  type: string;
  style: StyleProp<ViewStyle>;
  disabled: boolean;
  moveDisable: boolean;
  radius: number;
  thumbRadius: number;
  thumbInnerRadius: number;
  hue: number;
  saturation: number;
  temp: number;
  tempMin: number;
  tempMax: number;
  onValueChange: (hue: number, saturation: number, temp: number) => void;
  onComplete: (hue: number, saturation: number, temp: number) => void;
}

export default class HuePicker extends Component<HuePickerProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    accessibilityLabel: 'HuePicker',
    type: 'rgb',
    style: null,
    disabled: false,
    moveDisable: false,
    radius: 132,
    thumbRadius: 10,
    thumbInnerRadius: 9,
    // eslint-disable-next-line global-require
    hue: 0,
    saturation: 0,
    temp: 0,
    tempMin: 0,
    tempMax: 0,
    onValueChange: (hue: number, saturation: number, temp: number) => {},
    onComplete: (hue: number, saturation: number, temp: number) => {},
  };

  ringBackground: number | string | React.ReactElement;
  isColor: boolean;

  constructor(props: HuePickerProps) {
    super(props);
    const { radius, thumbRadius } = props;
    this.cx = radius - thumbRadius;
    this.cy = radius - thumbRadius;
    // 可拖动圆球至原点的固定距离（令圆球始终在在色环中居中）
    this.fixedLength = radius - thumbRadius;
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.shouldSetResponder,
      onMoveShouldSetPanResponder: this.shouldSetResponder,
      onPanResponderGrant: this._handleResponderGrant,
      onPanResponderMove: this._handleResponderMove,
      onPanResponderRelease: this._handleResponderRelease,
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: this._handleResponderRelease,
      onMoveShouldSetPanResponderCapture: () => false,
      onShouldBlockNativeResponder: () => false,
    });

    this.isColor = this.checkIsColor();
    if (this.isColor) {
      this.ringBackground = this.props.type === 'rgb2' ? require('./hue2.png') : require('./hue.png');
    } else {
      this.ringBackground = require('./white.png');
    }
  }

  // eslint-disable-next-line react/no-deprecated
  componentWillReceiveProps(nextProps: HuePickerProps) {
    const { radius, thumbRadius } = nextProps;
    if (
      this.props.radius !== radius ||
      this.props.thumbRadius !== thumbRadius
    ) {
      this.cx = radius - thumbRadius;
      this.cy = radius - thumbRadius;
      this.fixedLength = radius - thumbRadius;
    }
  }

  checkIsColor() {
    return this.props.type !== 'white';
  }

  getRadianByCoord(xRelativeOrigin: number, yRelativeOrigin: number) {
    const { thumbRadius } = this.props;
    const xRelativeCenter = xRelativeOrigin - this.cx - thumbRadius;
    const yRelativeCenter = yRelativeOrigin - this.cy - thumbRadius;
    let rad = Math.atan2(yRelativeCenter, xRelativeCenter);
    if (xRelativeCenter > 0 && yRelativeCenter > 0) rad = Math.PI * 2 - rad;
    if (xRelativeCenter < 0 && yRelativeCenter > 0) rad = Math.PI * 2 - rad;
    if (xRelativeCenter < 0 && yRelativeCenter < 0) rad = Math.abs(rad);
    if (xRelativeCenter > 0 && yRelativeCenter < 0) rad = Math.abs(rad);
    if (xRelativeCenter === 0 && yRelativeCenter > 0) rad = (Math.PI * 3) / 2;
    if (xRelativeCenter === 0 && yRelativeCenter < 0) rad = Math.PI / 2;
    return rad;
  }

  getTempByCoord(xRelativeOrigin: number, yRelativeOrigin: number) {
    const { thumbRadius, tempMax, tempMin } = this.props;
    const xRelativeCenter = xRelativeOrigin - this.cx - thumbRadius;
    const yRelativeCenter = yRelativeOrigin - this.cy - thumbRadius;
    const distance = Math.sqrt(xRelativeCenter ** 2 + yRelativeCenter ** 2);
    let temp = 0;
    let ty = 0;

    if (distance <= this.fixedLength)
    {
      temp = Math.floor((this.fixedLength + xRelativeCenter) * (tempMax - tempMin) / (this.fixedLength * 2) + tempMin);
      ty = yRelativeCenter;
    }
    else
    {
      const dis = xRelativeCenter * this.fixedLength / distance;
      temp = Math.floor((this.fixedLength + dis) * (tempMax - tempMin) / (this.fixedLength * 2) + tempMin);
      ty = yRelativeCenter * this.fixedLength / distance;
    }
    return {temp, ty};
  }

  getCoordByTemp(temp: number, ty: number) {
    const { tempMin, tempMax } = this.props;
    const t = temp < tempMin ? tempMin : temp > tempMax ? tempMax : temp;
    const tx =  (t - tempMin) * this.fixedLength * 2 / (tempMax - tempMin) - this.fixedLength;

    const distance = Math.sqrt(tx ** 2 + ty ** 2);
    if (distance <= this.fixedLength) {
      return {x: this.cx + tx, y: this.cy + ty};
    }
    else
    {
      let dy =  Math.sqrt(this.fixedLength ** 2 - tx ** 2);
      dy = ty > 0 ? dy : -dy;
      return {x: this.cx + tx, y: this.cy + dy};
    }
  }

  transHueForBg (hue: number, dir: boolean) {
    return dir ? (450 - hue) % 360 : (450 - hue) % 360;
  }

  getHueByCoord(xRelativeOrigin: number, yRelativeOrigin: number) {
    // 0 ~ 2π
    const rad = this.getRadianByCoord(xRelativeOrigin, yRelativeOrigin);
    const hue = (rad * 180) / Math.PI;
    return this.transHueForBg(hue, true);
  }

  getSaturationByCoord(xRelativeOrigin: number, yRelativeOrigin: number) {
    const { radius, thumbRadius } = this.props;
    const xRelativeCenter = xRelativeOrigin - this.cx - thumbRadius;
    const yRelativeCenter = yRelativeOrigin - this.cy - thumbRadius;
    const distance = Math.sqrt(xRelativeCenter ** 2 + yRelativeCenter ** 2);

    if (distance >= radius)
    {
      return 1000;
    }
    else
    {
      return (distance) * 1000 / radius;
    }
  }

  getCoordByHueSaturation(hue: number, saturation: number) {
    const newHue = this.transHueForBg(hue, false);
    const rad = ((360 - newHue) * Math.PI) / 180;
    const len = saturation * this.fixedLength / 1000;
    const x = this.cx + len * Math.cos(rad);
    const y = this.cy + len * Math.sin(rad);
    return { x, y };
  }

  getColorInfoByHueSaturation(hue: number, saturation: number) {
    const { r, g, b } = Utils.ColorUtils.hsvToRgb(hue, saturation / 1000, 1);
    return {
      r,
      g,
      b,
      rgbString: `rgb(${r}, ${g}, ${b})`,
    };
  }

  thumbRef: View;
  thumbInnerRef: View;
  cx: number;
  cy: number;
  fixedLength: number;
  _panResponder: PanResponderInstance;
  xRelativeOriginStart: number;
  yRelativeOriginStart: number;
  isMove: boolean;

  shouldSetResponder = (e: GestureResponderEvent) => {
    if (this.props.disabled) {
      return false;
    }

    const { locationX, locationY } = e.nativeEvent;
    // 是否在可点击范围内
    const { radius, thumbRadius } = this.props;
    const xRelativeCenter = locationX - this.cx - thumbRadius;
    const yRelativeCenter = locationY - this.cy - thumbRadius;
    const len = Math.sqrt(xRelativeCenter ** 2 + yRelativeCenter ** 2);

    if (len <= radius) {
      return true;
    }
    return false;
  };

  _moveTo(
    xRelativeOrigin: number,
    yRelativeOrigin: number,
    callback: (hue: number, saturation: number, temp: number) => void
  ) {
    if (this.isColor) {
      const hue = Math.round(this.getHueByCoord(xRelativeOrigin, yRelativeOrigin));
      const saturation = Math.round(this.getSaturationByCoord(xRelativeOrigin, yRelativeOrigin));
      const { x = 0, y = 0 } = this.getCoordByHueSaturation(hue, saturation);
      const color = this.getColorInfoByHueSaturation(hue, saturation);
      this.updateThumbStyle({
        transform: [
          {
            translateX: x,
          },
          {
            translateY: y,
          },
        ],
      });
      //this.updateThumbInnerStyle({
      //  backgroundColor: color.rgbString,
      //});
      typeof callback === 'function' && callback(hue, saturation, 0);
    } else {
      const {temp, ty} = this.getTempByCoord(xRelativeOrigin, yRelativeOrigin);
      const { x = 0, y = 0 } = this.getCoordByTemp(temp, ty);
      this.updateThumbStyle({
        transform: [
          {
            translateX: x,
          },
          {
            translateY: y,
          },
        ],
      });
      tempCoordY = ty;
      typeof callback === 'function' && callback(0, 0, temp);
    }
  }

  _handleResponderGrant = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    this.xRelativeOriginStart = locationX;
    this.yRelativeOriginStart = locationY;
    this.isMove = false;
  };

  _handleResponderMove = (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { dx, dy } = gestureState;
    if (this.props.moveDisable) {
      if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
        this.isMove = true;
      }
      return;
    }

    const xRelativeOrigin = this.xRelativeOriginStart + dx;
    const yRelativeOrigin = this.yRelativeOriginStart + dy;
    this._moveTo(xRelativeOrigin, yRelativeOrigin, this.props.onValueChange);
  };

  _handleResponderRelease = (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { dx, dy } = gestureState;
    if (this.props.moveDisable)
    {
      if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
        this.isMove = true;
      }
    }

    const xRelativeOrigin = this.xRelativeOriginStart + dx;
    const yRelativeOrigin = this.yRelativeOriginStart + dy;

    if (!this.props.moveDisable ||!this.isMove) {
      this._moveTo(xRelativeOrigin, yRelativeOrigin, this.props.onComplete);
    }

    this.xRelativeOriginStart = 0;
    this.yRelativeOriginStart = 0;
  };

  updateThumbStyle(style: StyleProp<ViewStyle>) {
    if (this.thumbRef) {
      this.thumbRef.setNativeProps({ style });
    }
  }

  updateThumbInnerStyle(style: StyleProp<ViewStyle>) {
    if (this.thumbInnerRef) {
      this.thumbInnerRef.setNativeProps({ style });
    }
  }

  renderRingBackground() {
    const { radius } = this.props;

    if (typeof this.ringBackground === 'number') {
      return (
        <Image
          style={{
            width: radius * 2,
            height: radius * 2,
            borderRadius: radius,
          }}
          source={this.ringBackground}
        />
      );
    }
    if (React.isValidElement(this.ringBackground)) {
      return React.cloneElement(this.ringBackground, {
        style: {
          width: radius * 2,
          height: radius * 2,
          borderRadius: radius,
          ...this.ringBackground.props.style,
        },
      });
    }
  }

  render() {
    const {
      accessibilityLabel,
      style,
      disabled,
      radius,
      thumbRadius,
      thumbInnerRadius,
      hue,
      saturation,
      temp,
    } = this.props;
    const { x = 0, y = 0 } = this.isColor ?
                             this.getCoordByHueSaturation(hue, saturation) :
                             this.getCoordByTemp(temp, tempCoordY);
    const { rgbString } = this.getColorInfoByHueSaturation(hue, saturation);

    return (
      <View
        accessibilityLabel={accessibilityLabel}
        style={style}
        pointerEvents='box-only'
        {...this._panResponder.panHandlers}
      >
        {/* 圆环 */}
        <View style={[styles.sectionRing, { width: radius * 2, height: radius * 2 }]}>
          {this.renderRingBackground()}
        </View>

        {/* 圆球 */}
        <View
          ref={(ref: View) => {
            this.thumbRef = ref;
          }}
          style={[
            styles.sectionThumb,
            {
              width: thumbRadius * 2,
              height: thumbRadius * 2,
              borderRadius: thumbRadius,
              opacity: disabled ? 0 : 1,
              transform: [
                {
                  translateX: x,
                },
                {
                  translateY: y,
                },
              ],
            },
          ]}
        >
          <View
            ref={(ref: View) => {
              this.thumbInnerRef = ref;
            }}
            style={{
              width: thumbInnerRadius * 2,
              height: thumbInnerRadius * 2,
              borderRadius: thumbInnerRadius,
              backgroundColor: '#fff', //rgbString,
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sectionRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionThumb: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: '#04001E',
    transform: [
      {
        translateX: 0,
      },
      {
        translateY: 0,
      },
    ],
  },
});
