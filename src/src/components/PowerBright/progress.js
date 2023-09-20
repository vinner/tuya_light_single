import PropTypes from 'prop-types';
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet, View, ViewPropTypes, TouchableOpacity } from 'react-native';
import Gesture from './gesture';
import PathCustom from './path-custom';
import Gradient from './gradient';
import ProgressCircle from './circle';
import { TYSdk } from 'tuya-panel-kit';
import { TYText, IconFont, Button } from 'tuya-panel-kit';
import icons from '../../res/iconfont';

export default class Progress extends Gesture {
  static propTypes = {
    ...Gesture.propTypes,
    /**
     * 渐变ID
     */
    gradientId: PropTypes.string,
    /**
     * 进度条样式
     */
    style: ViewPropTypes.style,
    /**
     * 具体值
     */
    value: PropTypes.number,
    /**
     * 开始角度
     */
    startDegree: PropTypes.number,
    /**
     * 在开始的角度上增加的角度
     */
    andDegree: PropTypes.number,
    /**
     * 最小值
     */
    min: PropTypes.number,
    /**
     * 最大值
     */
    max: PropTypes.number,
    /**
     * 步长
     */
    stepValue: PropTypes.number,
    /**
     * 大于具体值的不透明度
     */
    backStrokeOpacity: PropTypes.number,
    /**
     * 小于具体值的不透明度
     */
    foreStrokeOpacity: PropTypes.number,
    /**
     * 进度条渲染的高度
     */
    scaleHeight: PropTypes.number,
    /**
     * 进度条是否可以手势滑动
     */
    disabled: PropTypes.bool,
    /**
     * 大于具体值的颜色
     */
    backColor: PropTypes.string,
    /**
     * 小于具体值的颜色
     */
    foreColor: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.arrayOf(
        PropTypes.shape({
          offset: PropTypes.string.isRequired,
          stopColor: PropTypes.string.isRequired,
          stopOpacity: PropTypes.string.isRequired,
        })
      ),
    ]),
    /**
     * 值改变的回调
     * @param {number} value - 具体值
     */
    onValueChange: PropTypes.func,
    /**
     * 滑动结束的回调
     * @param {number} value - 具体值
     */
    onSlidingComplete: PropTypes.func,
    /**
     * 渐变起始点的x轴坐标
     */
    x1: PropTypes.string,
    /**
     * 渐变终点的x轴坐标
     */
    x2: PropTypes.string,
    /**
     * 渐变起始点的y轴坐标
     */
    y1: PropTypes.string,
    /**
     * 渐变终点的y轴坐标
     */
    y2: PropTypes.string,
    /**
     * thumb小圆球的填充色
     */
    thumbFill: PropTypes.string,
    /**
     * thumb小圆球边框宽度
     */
    thumbStrokeWidth: PropTypes.number,
    /**
     * thumb小圆球的边框色
     */
    thumbStroke: PropTypes.string,
    /**
     * thumb小圆球的半径
     */
    thumbRadius: PropTypes.number,
    /**
     * 是否需要最大值的thumb
     */
    needMaxCircle: PropTypes.bool,
    /**
     * 是否需要最小值的thumb
     */
    needMinCircle: PropTypes.bool,
    /**
     * 轨道不满360度开始的圆环颜色
     */
    startColor: PropTypes.string,
    /**
     * 轨道不满360度开始的圆环颜色
     */
    endColor: PropTypes.string,
    /**
     * 圆环中心自定义内容
     */
    renderCenterView: PropTypes.element,

    dy: PropTypes.number,
  };

  static defaultProps = {
    ...Gesture.defaultProps,
    gradientId: 'Progress',
    value: 50,
    startDegree: 135,
    andDegree: 270,
    min: 0,
    max: 100,
    stepValue: 0,
    scaleHeight: 9,
    disabled: false,
    backColor: '#E5E5E5',
    foreColor: '#FF4800',
    onValueChange() {},
    onSlidingComplete() {},
    style: null,
    backStrokeOpacity: 1,
    foreStrokeOpacity: 1,
    x1: '0%',
    y1: '0%',
    x2: '100%',
    y2: '0%',
    thumbFill: '#fff',
    thumbStroke: '#fff',
    thumbStrokeWidth: 2,
    thumbRadius: 2,
    needMaxCircle: true,
    needMinCircle: false,
    startColor: null,
    endColor: null,
    renderCenterView: null,
    dy: 0,
  };

  constructor(props) {
    super(props);
    this.fixDegreeAndBindToInstance(props);
    this.state = {
      value: props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.fixDegreeAndBindToInstance(nextProps);
    if (this.state.value !== nextProps.value) {
      this.setState({
        value: nextProps.value,
      });
    }
  }

  fixDegreeAndBindToInstance(props) {
    const { startDegree, andDegree, scaleHeight } = props;
    this.startDegree = startDegree % 360;
    if (andDegree >= 360) {
      this.andDegree = 360;
    } else {
      this.andDegree = andDegree;
    }
    if (startDegree !== 0 || !this.andDegree !== 0) {
      this.endDegree =
        (startDegree + this.andDegree) % 360 === 0 ? 360 : (startDegree + this.andDegree) % 360;
    } else {
      this.endDegree = 0;
    }

    const { r } = this.getCircleInfo();
    const innerRadius = r - scaleHeight;
    const startAngle = ((startDegree % 360) * Math.PI) / 180;
    this.dy = r + innerRadius * Math.sin(startAngle) - 25;

    // 基础圆环路径
    this.backScalePath = this.createSvgPath(this.andDegree, this.dy);
    const {
      progressStartX: startX,
      progressStartY: startY,
      progressX: endX,
      progressY: endY,
    } = this.getCirclePosition(this.backScalePath);
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    // 具体值对应的角度
    const deltaDeg = this.mapValueToDeltaDeg(props);
    // 小于具体值的路径
    this.foreScalePath = this.createSvgPath(deltaDeg, this.dy);
    const { progressStartX, progressStartY, progressX, progressY } = this.getCirclePosition(
      this.foreScalePath
    );
    this.startProgressX = progressStartX;
    this.startProgressY = progressStartY;
    this.progressX = progressX;
    this.progressY = progressY;
  }

  onStartShouldSetResponder({ nativeEvent: { locationX, locationY } }) {
    return this.shouldSetResponder(locationX, locationY + this.dy);
  }

  shouldSetResponder(x0, y0) {
    const { scaleHeight, disabled, thumbRadius } = this.props;
    if (disabled) {
      return false;
    }
    const { r } = this.getCircleInfo();
    const { x, y } = this.getXYRelativeCenter(x0, y0);
    const len = Math.sqrt(
      (x - thumbRadius) * (x - thumbRadius) + (y - thumbRadius) * (y - thumbRadius)
    );
    const innerR = r - scaleHeight;
    const should = this.shouldUpdateScale(x0, y0);
    const finalShould = should && len <= r + thumbRadius && len >= innerR - thumbRadius;
    return finalShould;
  }

  shouldUpdateScale(x, y) {
    const { startDegree, endDegree } = this;
    const deg = this.getDegRelativeCenter(x, y);
    let should;
    if (startDegree < endDegree) {
      should = deg >= startDegree && deg <= endDegree;
    } else {
      should = deg >= startDegree || deg <= endDegree % 360;
    }
    return should;
  }

  onMoveShouldSetResponder() {
    return false;
  }

  onGrant(e, gestureState) {
    const { onValueChange } = this.props;
    this.eventHandle(gestureState, onValueChange);
  }

  onMove(e, gestureState) {
    const { onValueChange } = this.props;
    this.eventHandle(gestureState, onValueChange);
  }

  onRelease(e, gestureState) {
    const { onSlidingComplete } = this.props;
    this.eventHandle(gestureState, onSlidingComplete, true);
  }

  eventHandle({ locationX, locationY }, fn, isRelease = false) {
    const { startDegree } = this;
    const { needMaxCircle } = this.props;
    const deg = this.getDegRelativeCenter(locationX, locationY + this.dy);
    const isInArea = this.shouldUpdateScale(locationX, locationY + this.dy);
    if (isInArea) {
      let deltaDeg = deg - startDegree;
      if (deltaDeg < 0) {
        deltaDeg = deg + 360 - startDegree;
      }
      const value = this.mapDeltaDegToValue(deltaDeg);

      this.foreScalePath = this.createSvgPath(deltaDeg, this.dy);
      const { progressX, progressY } = this.getCirclePosition(this.foreScalePath);
      if (needMaxCircle) {
        this.progressX = progressX;
        this.progressY = progressY;
      }
      this.setState({
        value,
      });
      if (typeof fn === 'function') fn(value);
    }
    if (isRelease && !isInArea) {
      const { value } = this.state;
      if (typeof fn === 'function') fn(value);
    }
  }

  getCirclePosition = path => {
    const startIndex = path.indexOf(' A');
    const progressStartIndex = path.indexOf(' ');
    const progressStartX = Number(path.substring(1, progressStartIndex));
    const progressStartY = Number(path.substring(progressStartIndex + 1, startIndex));
    const circleIndex = path.lastIndexOf(' 1 ');
    const needStr = path.substring(circleIndex + 3);
    const needIndex = needStr.indexOf(' ');
    const progressX = Number(needStr.substring(0, needIndex));
    const progressY = Number(needStr.substring(needIndex + 1));
    return { progressStartX, progressStartY, progressX, progressY };
  };

  getLayoutFromStyle(style) {
    const { width = 125, height = 125 } = StyleSheet.flatten(style) || {};
    return {
      width,
      height,
    };
  }

  // 获取圆环的半径信息
  getCircleInfo() {
    const { width, height } = this.getLayoutFromStyle(this.props.style);
    const size = Math.min(width, height);
    const r = size / 2;
    const cx = r;
    const cy = r;
    return {
      r,
      cx,
      cy,
    };
  }

  getXYRelativeCenter(x, y) {
    const { cx, cy } = this.getCircleInfo();
    return {
      x: x - cx,
      y: y - cy,
    };
  }

  getDegRelativeCenter(x, y) {
    const { thumbRadius } = this.props;
    const { x: _x, y: _y } = this.getXYRelativeCenter(x - thumbRadius, y - thumbRadius);
    let deg = (Math.atan2(_y, _x) * 180) / Math.PI;
    if (deg < 0) {
      deg += 360;
    }
    return parseInt(deg, 10);
  }

  // 进度条渲染线目的角度
  mapDeltaDegToScaleCount(deltaDeg) {
    if (deltaDeg >= this.andDegree) {
      return this.andDegree;
    }
    return deltaDeg;
  }

  mapDeltaDegToValue(deltaDeg) {
    const angle = this.mapDeltaDegToScaleCount(deltaDeg);
    const { min, max, stepValue } = this.props;

    if (stepValue) {
      const deltaValue = (angle * (max - min)) / stepValue;
      const value = Math.round(deltaValue / this.andDegree);
      return Math.max(min, Math.min(max, value * stepValue + min));
    }
    const deltaValue = max - min;
    const value = (angle * deltaValue) / this.andDegree;
    return Math.max(min, Math.min(max, value + min));
  }

  // 具体值对应的角度
  mapValueToDeltaDeg(props) {
    const { min, max, value } = props;
    return ((value - min) * this.andDegree) / (max - min);
  }

  // 计算路径路径
  createSvgPath(deltaDeg = 0, dy = 0) {
    const { r } = this.getCircleInfo();
    const { startDegree } = this;
    const { scaleHeight } = this.props;
    const innerRadius = r - scaleHeight;
    const countDegree = this.mapDeltaDegToScaleCount(deltaDeg);
    const endDegree = (countDegree + startDegree) % 360;
    const startAngle = ((startDegree % 360) * Math.PI) / 180;
    const endAngle = (endDegree * Math.PI) / 180;
    const _x1 = r + innerRadius * Math.cos(startAngle);
    const _y1 = r + innerRadius * Math.sin(startAngle);
    const _x2 = r + innerRadius * Math.cos(endAngle);
    const _y2 = r + innerRadius * Math.sin(endAngle);
    const num = countDegree;
    if (countDegree === 360) {
      const middleDegree = (this.mapDeltaDegToScaleCount(startDegree + 180) * Math.PI) / 180;
      const middleX = r + innerRadius * Math.cos(middleDegree);
      const middleY = r + innerRadius * Math.sin(middleDegree);
      const path = `M${_x1} ${_y1} A${innerRadius} ${innerRadius} 0 ${
        num > 180 ? (startDegree === 270 ? 0 : 1) : 0
      } 1 ${middleX} ${middleY} A${innerRadius} ${innerRadius} 0 ${
        num > 180 ? 1 : 0
      } 1 ${_x2} ${_y2}`;
      return path;
    }

    const path = `M${_x1} ${_y1-dy} A${innerRadius} ${innerRadius} 0 ${
      num > 180 ? 1 : 0
    } 1 ${_x2} ${_y2-dy}`;
    return path;
  }

  powerPress() {
    TYSdk.native.simpleTipDialog('press', () => {});
  }

  render() {
    const responder = this.getResponder();
    const {
      backColor,
      backStrokeOpacity,
      foreStrokeOpacity,
      foreColor,
      style,
      gradientId,
      scaleHeight,
      x1,
      x2,
      y1,
      y2,
      thumbFill,
      thumbStrokeWidth,
      thumbStroke,
      thumbRadius,
      needMaxCircle,
      needMinCircle,
      startColor,
      endColor,
      renderCenterView,
    } = this.props;
    const { r } = this.getCircleInfo();
    const size = r * 2;
    const isGradient = foreColor && typeof foreColor === 'object';

    return (
      <View
        {...responder}
        style={[
          style,
          {
            width: size + 2 * thumbRadius,
            height: size + 2 * thumbRadius - this.dy,
          },
        ]}
      >
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, }}>
          <TYText style={{ fontSize: 18, color: '#fff', }}> {'Low'} </TYText>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <TYText style={{ fontSize: 27, color: '#fff', width: 60, textAlign: 'right' }}> {`${Math.floor(this.state.value)}`} </TYText>
            <TYText style={{ fontSize: 27, color: '#fff' }}> {`%`} </TYText>
          </View>
          <TYText style={{ fontSize: 18, color: '#fff', }}> {'High'} </TYText>
        </View>
        <View style={{ position:'absolute' }}>
        <Svg
          viewBox={`${-thumbRadius} ${-thumbRadius} ${size + 2 * thumbRadius} ${size +
            2 * thumbRadius - this.dy}`}
          width={size + 2 * thumbRadius}
          height={size + 2 * thumbRadius - this.dy}
        >
          {isGradient && (
            <Gradient
              gradientId={gradientId}
              x1={x1}
              x2={x2}
              y1={y1}
              y2={y2}
              foreColor={foreColor}
            />
          )}
          <Path
            d={this.backScalePath}
            x="0"
            y="0"
            fill="none"
            stroke={isGradient ? `url(#${gradientId})` : foreColor}
            //stroke={backColor}
            strokeWidth={scaleHeight}
            strokeOpacity={backStrokeOpacity}
          />
          {this.andDegree < 360 && (
            <ProgressCircle
              cx={this.startX}
              cy={this.startY}
              r={scaleHeight / 2 - 1}
              fill={startColor}
              stroke={startColor}
            />
          )}
          {this.andDegree < 360 && (
            <ProgressCircle
              cx={this.endX}
              cy={this.endY}
              r={scaleHeight / 2 - 1}
              fill={endColor}
              stroke={endColor}
            />
          )}

          <PathCustom
            isGradient={false}
            path={this.foreScalePath}
            strokeOpacity={foreStrokeOpacity}
            strokeWidth={scaleHeight}
            gradientId={gradientId}
            foreColor={backColor}
          />
          {needMaxCircle && (
            <ProgressCircle
              cx={this.progressX}
              cy={this.progressY}
              r={thumbRadius}
              fill={isGradient ? `url(#${gradientId})` : thumbFill}
              strokeWidth={thumbStrokeWidth}
              stroke={isGradient ? `url(#${gradientId})` : thumbStroke}
            />
          )}
          {needMinCircle && (
            <ProgressCircle
              cx={this.startProgressX}
              cy={this.startProgressY}
              r={thumbRadius}
              fill={thumbFill}
              strokeWidth={thumbStrokeWidth}
              stroke={thumbStroke}
            />
          )}
        </Svg>
        </View>
        {renderCenterView}
      </View>
    );
  }
}
