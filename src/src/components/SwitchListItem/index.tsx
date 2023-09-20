/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Component } from 'react';
import {
  View,
  Image,
  StyleProp,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { Utils, TYText, SwitchButton, TYSdk, IconFont } from 'tuya-panel-kit';
import icons from '../../res/iconfont';
import Res from '../../res';

const { convertX: cx, width: winWidth } = Utils.RatioUtils;
const DEL_WIDTH = 100;
const SWITCH_WIDTH = 100;
const PRESS_ITEM = 1;
const PRESS_SWITCH = 2;
const PRESS_DEL = 3;

const ANI_MAX = 5;
const MOVE_RESHOLD_X = 5;
const MOVE_RESHOLD_Y = 5;

const ITEM_HEIGHT = cx(88);

interface SwitchListItemProps {
  accessibilityLabel: string;
  key: string;
  value: boolean;
  deleteShow: boolean;
  onValueChange: (value: boolean) => void;
  onDeleteShow: (value: boolean) => void;
  onPress: () => void;
  onDelete: () => void;
  onMoveStart: () => void;
  onMoveComplete: () => void;
  theme?: any;
  style: StyleProp<ViewStyle>;
  renderContentView;
}

interface SwitchListItemState {
  cx: number;
  delete_show: boolean;
}

export default class SwitchListItem extends Component<SwitchListItemProps, SwitchListItemState> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    accessibilityLabel: 'SwitchListItem',
    key: '',
    value: true,
    deleteShow: false,
    onValueChange: (v: boolean) => {},
    onDeleteShow: (v: boolean) => {},
    onPress: () => {},
    onDelete: () => {},
    onMoveStart: () => {},
    onMoveComplete: () => {},
    theme: {
      fontColor: '#fff',
    },
    style: null,
    renderContentView: null,
  };

  _panResponder: PanResponderInstance;
  cx: number;
  itemRef: View;
  delRef: View;
  delete_show: boolean;
  delete_self: boolean;
  endX: number;
  pressItem: number;
  isMoveX: boolean;
  isMoveY: boolean;
  timer;
  ani_cnt: number;

  constructor(props: SwitchListItemProps) {
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
    this.cx = 0;
    this.delete_show = false;
    this.pressItem = PRESS_ITEM;
  }

  setInstance = (name: string) => (ref: TYText) => {
    this[`_ref_${name}`] = ref;
  };

  getInstance = (name: string) => this[`_ref_${name}`];

  shouldComponentUpdate(nextProps: SwitchListItemProps, nextState: SwitchListItemState) {
    if (nextProps.deleteShow !== this.props.deleteShow){
      this.resetItemStyle(nextProps.deleteShow);
    }

    if (nextProps.renderContentView !== this.props.renderContentView || nextProps.value !== this.props.value) {
      return true;
    }

    return false;
  }

  resetItemStyle(deleteShow: boolean) {
    if (deleteShow) {
      this.updateItemStyle({transform: [{translateX: -DEL_WIDTH}]});
      this.updateDelStyle({transform: [{translateX: -DEL_WIDTH}], width: DEL_WIDTH});
    } else {
      this.updateItemStyle({transform: [{translateX: 0}]});
      this.updateDelStyle({transform: [{translateX: 0}], width: 0});
    }
  }

  _moveTo(
    dx: number,
    dy: number,
    release: boolean
  ) {

    if (this.isMoveY){
      return;
    }

    if (!this.isMoveX) {
      if (Math.abs(dy) > MOVE_RESHOLD_Y) {
        this.isMoveY = true;
        return;
      }

      if (Math.abs(dx) > MOVE_RESHOLD_X) {
        this.isMoveX = true;
        this.props.onMoveStart();
      } else {
        return;
      }
    }

    const x = dx + this.endX;

    if (x < 0) {
      this.cx  = x;
      this.delete_show = (Math.abs(x) > DEL_WIDTH);
      this.updateItemStyle({transform: [{translateX: x }]});
      this.updateDelStyle({transform: [{translateX: x}], width: -x});
    }
    else if (this.cx <= 0) {
      this.cx = 0;
      this.delete_show = false;
      this.updateItemStyle({transform: [{translateX: 0}]});
      this.updateDelStyle({transform: [{translateX: 0}], width: 0});
    }
  }

  shouldSetResponder = (e: GestureResponderEvent) => {
    //TYSdk.native.simpleTipDialog('should start', () => {});
    return true;
  };

  _handleResponderGrant = (e: GestureResponderEvent) => {
    const { pageX, target } = e.nativeEvent;

    if (this.delete_show) {
      this.endX = -DEL_WIDTH;
    } else {
      this.endX = 0;
    }
    this.isMoveX = false;
    this.isMoveY = false;
    this.delete_self = false;

    if (this.delete_show && pageX >= winWidth - DEL_WIDTH) {
      this.pressItem = PRESS_DEL;
    } else if ((this.delete_show && pageX < winWidth - DEL_WIDTH && pageX > winWidth - SWITCH_WIDTH - DEL_WIDTH) ||
      (!this.delete_show && pageX > winWidth - SWITCH_WIDTH)) {
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
    const { dx, moveX } = gestureState;
    const x = dx + this.endX < 0 ? dx + this.endX : 0;
    this.cx = this.isMoveX ? x : 0;

    if (!this.isMoveX && !this.isMoveY) {
      switch (this.pressItem) {
        case PRESS_ITEM:
          this.delete_show = false;
          this.props.onDeleteShow(false);
          this.props.onPress();
          return;
        case PRESS_SWITCH:
          this.props.onValueChange(!this.props.value);
          break;
        case PRESS_DEL:
          this.delete_show = false;
          this.props.onDeleteShow(false);
          this.props.onDelete();
          return;
      }
    }

    this.props.onDeleteShow(this.delete_show);
    if (this.isMoveX && this.delete_show && moveX < MOVE_RESHOLD_X) {
      this.delete_self = true;
    }

    this.startTimer();
    this.props.onMoveComplete();
  };

  startTimer = () => {
    this.ani_cnt  = ANI_MAX;

    this.timer = setInterval(() => {
      if (this.ani_cnt < 0) {
        clearInterval(this.timer);

        if (this.delete_self) {
          this.delete_self = false;
          this.props.onDelete();
          this.resetItemStyle(this.props.deleteShow);
        }
        return;
      }

      const startX = this.cx;
      const endX = this.delete_self ? -(winWidth) : this.delete_show ? -DEL_WIDTH : 0;
      const s = (startX - endX) / ANI_MAX * this.ani_cnt + endX;
      const w = -s;

      this.ani_cnt --;

      this.updateItemStyle({transform: [{translateX: s}]});
      this.updateDelStyle({transform: [{translateX: s}], width: w});
    }, 1);
  };

  stopTimer = () => {
    clearInterval(this.timer);
  };

  updateItemStyle(style: StyleProp<ViewStyle>) {
    if (this.itemRef) {
      this.itemRef.setNativeProps({ style });
    }
  }

  updateDelStyle(style: StyleProp<ViewStyle>) {
    if (this.delRef) {
      this.delRef.setNativeProps({ style });
    }
  }

  render() {
    const {
      style,
      value,
      deleteShow,
      onValueChange,
      onPress,
      onDelete,
      renderContentView,
    } = this.props;

    const dx = deleteShow ? -DEL_WIDTH : 0;
    const dw = -dx;

    //TYSdk.native.simpleTipDialog('item render: ' + dw, () => {});

    return (
      <View 
        style={styles.container}
        pointerEvents="box-only"
        {...this._panResponder.panHandlers}
      >
        <View
          accessibilityLabel="HomeScene_Custom_Editor"
          ref={(ref: View) => {
            this.itemRef = ref;
          }}
          style={[
            {
              width: '100%',
              transform: [
                {
                  translateX: dx
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[this.props.style, styles.item]}
            activeOpacity={0.9}
            onPress={onPress}
          >
            {renderContentView}
            <SwitchButton
              value={value}
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

        {/* 删除按键 */}
        <View
          accessibilityLabel="HomeScene_Custom_Editor"
          ref={(ref: View) => {
            this.delRef = ref;
          }}
          style={[
            {
              width: dw,
              transform: [
                {
                  translateX: dx,
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[this.props.style, styles.del, {paddingHorizontal: 20}]}
            activeOpacity={0.9}
            onPress={onDelete}
          >
              <IconFont d={icons.delete2} size={28} fill={'#fff'} stroke={'#fff'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  del: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff0000',
    marginLeft: 0,
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
