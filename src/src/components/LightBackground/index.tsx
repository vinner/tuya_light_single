/* eslint-disable @typescript-eslint/no-empty-function */
import _, { times } from 'lodash';
import color from 'color';
import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Utils, RadialGradient, TYSdk } from 'tuya-panel-kit';
import Res from '../../res';

const { convertX: cx, convertY: cy } = Utils.RatioUtils;

const TIMER_INTERVAL = 1000;
const TIMER_CNT = 100;
const BRIGHT_LOW = 300;

export enum LIGHT_MODE {
  BRIGHT = 0,
  FLASH,
  BREATH,
};

interface LIGHT_POSITION {
  x: number;    // 灯最上方中间部位在背景中所在的X坐标比例，取值[0-1]
  y: number;    // 灯最上方中间部位在背景中所在的y坐标比例，取值[0-1]
}

interface LightBackgroundProps {
  accessibilityLabel: string;
  style: StyleProp<ViewStyle>;
  power: boolean;
  width: number;
  height: number;
  lightWidth: number;
  lightHeight: number;
  lightNum: number;
  lightPositions: LIGHT_POSITION[];
  bright: number;
  mode: LIGHT_MODE;
  theme?: any;
}

interface LightBackgroundState {
  bright: number;
}

export default class LightBackground extends Component<LightBackgroundProps, LightBackgroundState> {

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    accessibilityLabel: 'SwitchListItem',
    power: true,
    width: 100,
    height: 100,

    theme: {
      fontColor: '#fff',
    },
  };

  constructor(props: LightBackgroundProps) {
    super(props);

    this.state = {
      bright: this.props.bright,
    }

    this.startTimer(props);
  }

  shouldComponentUpdate(nextProps: LightBackgroundProps, nextState: LightBackgroundState) {
    if (nextProps.bright !== this.props.bright
        || nextProps.power !== this.props.power
        || nextProps.mode != this.props.mode){
      this.startTimer(nextProps);
      return true;
    }

    if (this.state.bright !== nextState.bright) {
      return true;
    }

    return false;
  }

  timer;
  timerBrightInt = 1;
  timerPos = 0;

  startTimer = (props: LightBackgroundProps) => {
    const { bright, mode, power } = props;

    this.stopTimer();

    this.timerBrightInt = props.bright > BRIGHT_LOW ? (props.bright - BRIGHT_LOW) / (TIMER_CNT / 2) : 0;;
    this.timerPos = 0;

    if (!power) {
      this.setState({bright: 0});
    } else if (mode === LIGHT_MODE.FLASH) {
      const b = bright <= BRIGHT_LOW ? BRIGHT_LOW : bright;

      this.timer = setInterval(() => {
        this.setState({
          bright: this.state.bright !== 0 ? 0 : b,
        });
      }, TIMER_INTERVAL);  
    } else if (mode === LIGHT_MODE.BREATH) {
      this.timer = setInterval(() => {
        this.timerPos < (TIMER_CNT / 2) ?
        this.setState({ bright: this.timerBrightInt * ((TIMER_CNT / 2) - this.timerPos) + BRIGHT_LOW})
        : this.setState({ bright: this.timerBrightInt * (this.timerPos - (TIMER_CNT / 2))  + BRIGHT_LOW});

        this.timerPos = (this.timerPos + 1) % TIMER_CNT;
      }, TIMER_INTERVAL / TIMER_CNT);
    } else {
      this.setState({bright: bright >= BRIGHT_LOW ? bright : BRIGHT_LOW});
    }
  };

  stopTimer = () => {
    clearInterval(this.timer);
  };

  renderLights =() => {
    const { power, width, height, lightWidth, lightHeight, lightNum, lightPositions } = this.props;
    const { bright } = this.state;
    const cnt = Math.min(lightNum, lightPositions.length);

    const op_min = 0;
    const op_mid = 0.3;
    const op_M = 0; //0.4;
    const vw = lightWidth * 3;
    const vh = lightHeight * 2;
    const c = '#ffb400';
    const op = power ? (bright / 1000 * (1 - op_M) + op_M) : 0;
    const opm = power ? (bright / 1000 * (op_mid - op_min) + op_min) : 0;

    return (
      _.times(cnt, i => {
        const left = width * lightPositions[i].x - lightWidth * 0.5;
        const top = height * lightPositions[i].y;
        return (
          <View
            style={{
              position: 'absolute',
              left,
              top,
              width: lightWidth,
              height: lightHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: vw,
                height: vh,
                borderRadius: 30,
                //backgroundColor: '#00ff00',
              }}
            >
              <RadialGradient
                gradientId="Gradient1"
                style={{
                  width: vw,
                  height: vh,
                  marginTop: 12,
                }}
                stops={[
                  {
                    offset: '0%',
                    stopColor: c,
                    stopOpacity: `${op}`,
                  },
                  {
                    offset: '50%',
                    stopColor: c,
                    stopOpacity: `${opm}`,
                  },
                  {
                    offset: '100%',
                    stopColor: c,
                    stopOpacity: `${op_min}`,
                  },
                ]}
                rx="50%"
                ry="50%"
                fx="50%"
                fy="50%"
                cx="50%"
                cy="50%"
              />
            </View>
            <ImageBackground
              style={{position:'absolute', top: 0, left: 0, width: lightWidth, height: lightHeight }}
              source={Res.light_bg}          
            />
          </View>  
        );
      })
    );
  }

  render() {
    const {
      style,
      width,
      height,
    } = this.props;

    return (
      <View style={style}>
        <ImageBackground
          style={{ position: 'absolute', width, height }}
          source={Res.dimmer_bg}
        />
        {this.renderLights()}
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

  timer_item: {
    backgroundColor:'transparent',
    marginHorizontal: cx(22),
    paddingVertical: cy(20),
  },

  timer_item_title1: {
    color:'#04001E',
    fontSize: cx(28),
    marginLeft: cx(3),
    marginTop: cx(0),
  },

  timer_item_title2: {
    color: color('#04001E').alpha(0.6).rgbString(),
    fontSize: cx(12),
    marginLeft: cx(5),
    marginTop: cx(10),
  },

  timer_item_title3: {
    color:'#000',
    fontSize: cx(16),
    marginLeft: cx(3),
    marginTop: cx(10),
    marginBottom: cx(15),
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      {
        translateX: 0,
      },
      {
        translateY: 0,
      },
    ],
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