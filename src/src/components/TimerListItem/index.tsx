/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { Utils, TYText, SwitchButton, TYSdk, IconFont } from 'tuya-panel-kit';
import Res from '../../res';

const { convertX: cx, convertY: cy, width: winWidth } = Utils.RatioUtils;
const DEL_WIDTH = 100;
const SWITCH_WIDTH = 100;
const PRESS_ITEM = 1;
const PRESS_SWITCH = 2;
const PRESS_DEL = 3;

const ANI_MAX = 5;
const MOVE_RESHOLD_X = 10;
const MOVE_RESHOLD_Y = 10;

interface TimerListItemProps {
  accessibilityLabel: string;
  time: string;
  power: string;
  state: boolean;
  deleteShow: boolean;
  onValueChange: (value: boolean) => void;
  onPress: () => void;
  theme?: any;
};

export default class TimerListItem extends Component<TimerListItemProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    accessibilityLabel: 'SwitchListItem',
    time: '',
    power: false,
    state: true,
    deleteShow: false,
    onValueChange: (v: boolean) => {},
    onPress: () => {},
    theme: {
      fontColor: '#fff',
    },
  };

  _panResponder: PanResponderInstance;
  pressItem: number;
  isMoveX: boolean;
  isMoveY: boolean;

  constructor(props: TimerListItemProps) {
    super(props);
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.shouldSetResponder,
      onMoveShouldSetPanResponder: this.shouldSetResponder,
      onPanResponderGrant: this._handleResponderGrant,
      onPanResponderMove: this._handleResponderMove,
      onPanResponderRelease: this._handleResponderRelease,
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: this._handleResponderRelease,
      // onStartShouldSetResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onShouldBlockNativeResponder: () => false,
    });
    this.state = {
      cx: 0,
      delete_show: false,
    };
    this.pressItem = PRESS_ITEM;
  }

  setInstance = (name: string) => (ref: TYText) => {
    this[`_ref_${name}`] = ref;
  };

  getInstance = (name: string) => this[`_ref_${name}`];

  shouldComponentUpdate(nextProps: TimerListItemProps) {
      return true;
  }

  _moveTo(
    dx: number,
    dy: number,
    release: boolean
  ) {

    if (this.isMoveY || this.isMoveX){
      return;
    }

    if (Math.abs(dy) > MOVE_RESHOLD_Y) {
      this.isMoveY = true;
      return;
    }

    if (Math.abs(dx) > MOVE_RESHOLD_X) {
      this.isMoveX = true;
    } else {
      return;
    }
  }

  shouldSetResponder = (e: GestureResponderEvent) => {
    //TYSdk.native.simpleTipDialog('should start', () => {});
    return true;
  };

  _handleResponderGrant = (e: GestureResponderEvent) => {
    const { pageX, target } = e.nativeEvent;

    this.isMoveX = false;
    this.isMoveY = false;

    if (pageX > winWidth - SWITCH_WIDTH) {
      this.pressItem = PRESS_SWITCH;
    } else {
      this.pressItem = PRESS_ITEM;
    }
  };

  _handleResponderMove = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    const { dx, dy } = gestureState;
    this._moveTo(dx, dy, false);
  };

  _handleResponderRelease = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (!this.isMoveX && !this.isMoveY) {
      switch (this.pressItem) {
        case PRESS_ITEM:
          this.props.onPress();
          return;
        case PRESS_SWITCH:
          this.props.onValueChange(!this.props.state);
          break;
      }
    }
  };

  render() {
    const {
      time,
      power,
      state,
      onValueChange,
      onPress,
    } = this.props;

    return (
      <View 
        style={styles.container}
        pointerEvents="box-only"
        {...this._panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.root}
          onPress={onPress}
        >
          <View style={styles.timeView}>
            <TYText style={styles.title}> {'Time'} </TYText>
            <View style={{ flexDirection:'row', paddingTop: 5, alignItems: 'flex-end' }}>
              <TYText style={styles.text}> {time} </TYText>
              <TYText style={styles.text2}> {'am'} </TYText>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <TYText style={styles.title}> {'State'} </TYText>
            <TYText style={styles.text}> {power ? 'ON' : 'OFF'} </TYText>
          </View>

          <SwitchButton
            value={state}
            onValueChange={v => onValueChange(v)}
            style={{ marginRight: 14 }}
            thumbStyle={{
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0,
              shadowRadius: 0,
              elevation: 0,
              }}
            theme={{ onTintColor: '#05001d', onThumbTintColor: '#FFF' }}
          />
          <Image source={Res.arrow} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  root: {
    flex: 1,
    marginHorizontal: cx(22),
    borderBottomColor: '#f0edf1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: cx(20),
    alignItems: 'center',
  },
  title: {
    fontSize: cx(12)
  },
  timeView: {
    width: '35%',
  },
  text: {
    fontSize: cx(18),
    fontWeight: 'bold',
  },
  text2: {
    fontSize: cx(12),
  },
});