import _ from 'lodash';
import React from 'react';
import {
  Image,
  View,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
  PanResponderGestureState,
  PanResponder,
  PanResponderInstance,
} from 'react-native';
import { Utils, TYSdk, TYText } from 'tuya-panel-kit';
import Res from '../../res';
import { LightLayoutParams } from '../../config'
import { getColorRgba, getWhiteRgba } from '../../utils';

/* 灯串面板显示参数 */
const {
  itemWidth,        // 每个灯的宽度
  itemHeight,       // 每个灯的高度
  itemCntPreLine,   // 每一行显示的灯的个数
  itemColorWidth,   // 灯中颜色显示的宽度
  itemColorHeight,  // 灯中颜色显示的高度
  itemColorOffsetX, // 灯中颜色显示的偏移坐标X
  itemColorOffsetY, // 灯中颜色显示的偏移坐标Y
  checkHeight: checkSize,
  brihtHeight,
  bottomHeight,
} = LightLayoutParams;

const {
  ThemeUtils: { withTheme },
} = Utils;

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

const MOVE_RESHOLD_X = 10;
const MOVE_RESHOLD_Y = 10;
const lineWidth = cx(15);

export interface COLOR_DATA {
  isColour: boolean;
  h: number;
  s: number;
  t: number;
  b: number;
}

interface Props {
  theme?: any;
  itemNumber: number;           // 灯的数量
  lightColors: COLOR_DATA[];    // 灯的颜色
  states: boolean[];            // 灯的选择状态
  disabled?: boolean;
  onSelectedStart: () => void;
  onSelectedChanged: (states: boolean[]) => void;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
};

interface States {
  states: boolean[];
};

class LightLayout extends React.Component<Props, States> {
  panStart: boolean;
  panStartIndex: number;
  panCheck: boolean;
  isMoveX: boolean;
  isMoveY: boolean;
  _panResponder: PanResponderInstance;

  constructor(props: Props) {
    super(props);
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: e => {this.handleGrant(e)},
      onPanResponderMove: this.handleMove,
      onPanResponderRelease: e => {this.handleRelease(e)},
      onMoveShouldSetPanResponderCapture: () => false,
      onShouldBlockNativeResponder: () => false,
    });

    this.state = {
      states: props.states,
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.states !== this.state.states) {
      this.state = {
        states: nextProps.states
      }
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: States) {

    if (nextProps.states !== this.state.states ||
        nextState.states !== this.state.states ||
        nextProps.itemNumber !== this.props.itemNumber ||
        nextProps.lightColors !== this.props.lightColors
      ) {
      return true;
    }
    return false;
  }

  /* 根据坐标值计算灯的ID，-1 表示坐标不在灯上 */
  calPoisiton = (x, y) => {
    const { itemNumber } = this.props;
    const index = Math.floor(y / itemHeight) * itemCntPreLine + Math.floor(x / itemWidth);
    return index >= itemNumber ? -1 : index;
  }

  handleGrant = (e: GestureResponderEvent) => {
    const { itemNumber } = this.props;
    const { locationX, locationY } = e.nativeEvent;
    const { states } = this.state;

    const index = this.calPoisiton(locationX, locationY);
    if (index < 0 || index >= itemNumber) {
      return;
    }
    this.panCheck = !states[index];
    this.panStartIndex = index;
  }

  handleMove = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { dx, dy } = gestureState;
    const { itemNumber } = this.props;
    const { states } = this.state;
    const { locationX, locationY } = e.nativeEvent;

    if (this.isMoveY) {
      return;
    }

    if (!this.isMoveX && Math.abs(dy) > MOVE_RESHOLD_Y) {
      this.isMoveY = true;
      return;
    }

    if (!this.isMoveX){
      if (Math.abs(dx) < MOVE_RESHOLD_X) {
        return;
      }
      this.isMoveX = true;
    } 

    const index = this.calPoisiton(locationX, locationY);
    if (index < 0 || index >= itemNumber) {
      return;
    }

    if (!this.panStart) {
      this.props.onSelectedStart && this.props.onSelectedStart();
      this.panStart = true;
    }

    if (states[index] !== this.panCheck || states[this.panStartIndex] !== this.panCheck) {
      const newStates = [...states];
      newStates[index] = this.panCheck;
      newStates[this.panStartIndex] = this.panCheck;
      this.setState({states: newStates});
    }
  }

  handleRelease = (e: GestureResponderEvent) => {
    const { itemNumber } = this.props;
    const { states } = this.state;
    const { locationX, locationY } = e.nativeEvent;
    const newStates = [...states];

    /** 判断是否单击 */
    if (!this.isMoveX && !this.isMoveY) {
      const index = this.calPoisiton(locationX, locationY);
      if (index >= 0 && index < itemNumber) {
        newStates[index] = !states[index];
      }
    }
  
    this.panStart = false;
    this.isMoveX = false;
    this.isMoveY = false;
    this.props.onSelectedChanged && this.props.onSelectedChanged(newStates);
  }

  renderLightItem = (state: boolean, color: COLOR_DATA) => {
    const lightHeight = itemHeight - checkSize - brihtHeight - bottomHeight;
    const bright = color.b;
    const bg = color.isColour ? getColorRgba(color.h, color.s, color.b)
              : getWhiteRgba(color.t, color.b);
    
    return (
      <View style={{width: itemWidth, height: itemHeight, marginLeft: -1, alignItems: 'center', justifyContent: 'flex-start'}}>
        <View
          style={{
            width: itemColorWidth,
            height: itemColorHeight,
            position: 'absolute',
            top: itemColorOffsetY,
            left: itemColorOffsetX,
            backgroundColor: bg,
          }}
        />
        <View style={{ width: itemWidth, height: checkSize, justifyContent: 'center', alignItems: 'center' }}>
          <Image style={{ width: cx(16), height: cx(16) }} source={state? Res.check : Res.uncheck} />
        </View>
        <Image
          style={{ width: itemWidth, height: lightHeight, resizeMode: 'stretch' }}
          source={Res.light_new}
        />
        <View style={{ width: itemWidth, height: brihtHeight, alignItems: 'center', justifyContent: 'center' }}>
          <TYText style={{ color: '#020914', fontSize: cx(11) }}> {`${Math.floor(bright / 10)}%`} </TYText>
        </View>
      </View>
    );
  }

  render() {
    const { itemNumber, style, accessibilityLabel, lightColors } = this.props;
    const { states } = this.state;
    const num = itemNumber;
    const lights = new Array(num).fill(0);
    const lineCnt = Math.ceil(itemNumber /  itemCntPreLine) - 1;

    const layoutWidth = itemWidth * itemCntPreLine;
    const layoutHeight = Math.ceil(itemNumber /  itemCntPreLine) * itemHeight;

    const pointSize = 10;
    const startTop = checkSize - pointSize * 0.5 + 1;
    const startLeft = - pointSize + 2;
    const endTop = lineCnt * itemHeight + checkSize - pointSize * 0.5 + 1;
    const endLeft = ((itemNumber - 1) % itemCntPreLine + 1) * itemWidth - (itemCntPreLine - 1) - 2;

    //TYSdk.native.simpleTipDialog('c: ' + JSON.stringify(lightColors), () => {});
    return (
      <View style={{width: layoutWidth, height: layoutHeight, alignItems: 'center'}}>
        {/** 渲染每一行灯的连接线 */}
        {_.times(lineCnt, i => {
            const top = i * itemHeight + checkSize;
            return (
              <Image
                style={{ width: layoutWidth + lineWidth * 2 - (itemCntPreLine - 1), height: itemHeight + 2, resizeMode: 'stretch', position: 'absolute', left: -lineWidth, top }}
                source={Res.light_new_line}
              />
            );
          })
        }
        {/** 渲染所有的灯体 */}
        <View
          style={[styles.light_root, style]}
          accessibilityLabel={accessibilityLabel}
          pointerEvents='box-only'
          {...this._panResponder.panHandlers}
        >
          {lights.map((_, index) => {
            const c = states.length > index ? states[index] : false;
            return (this.renderLightItem(c, lightColors[index]));
          })}
        </View>
        {/** 首尾两个圆点 */}
        <View
          style={{
            position: 'absolute',
            top: startTop,
            left: startLeft,
            backgroundColor: '#000',
            width: pointSize,
            height: pointSize,
            borderRadius: pointSize * 0.5,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: endTop,
            left: endLeft,
            backgroundColor: '#000',
            width: pointSize,
            height: pointSize,
            borderRadius: pointSize * 0.5,
          }}
        />
      </View>
    );
  }
}

export default withTheme(LightLayout);

const styles = StyleSheet.create({
  light_root: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
