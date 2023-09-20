/* eslint-disable @typescript-eslint/no-empty-function */
import color from 'color';

import React, { Component } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Slider, Utils, TYText, TYSdk } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;

interface BrightSliderProps {
  accessibilityLabel: string;
  min: number;
  max: number;
  value: number;
  sliderColor: string;
  mode: string;
  onValueChange: (value: number, mode: string) => void;
  onSlidingComplete: (value: number, mode: string) => void;
  theme?: any;
  id?: string;
  sliderStyle?: StyleProp<ViewStyle>;
}

interface BrightSliderStates {
  touch: boolean;
}

export default class BrightSlider extends Component<BrightSliderProps, BrightSliderStates> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    accessibilityLabel: 'BrightSlider',
    min: 0,
    max: 100,
    onValueChange: (v: number, mode: string) => {},
    onSlidingComplete: (v: number, mode: string) => {},
    theme: {
      fontColor: '#fff',
    },
    id: '',
    sliderStyle: null,
  };

  constructor(props: BrightSliderProps) {
    super(props);
    this.state = {
      touch: false,
    };
  }


  setInstance = (name: string) => (ref: TYText) => {
    this[`_ref_${name}`] = ref;
  };

  getInstance = (name: string) => this[`_ref_${name}`];


  handleValueChange = (v: number) => {
    const { onValueChange, mode } = this.props;
    this.setState({touch: true});
    onValueChange(v, mode);
  };

  handleComplete = (v: number) => {
    const { onSlidingComplete, mode } = this.props;
    this.setState({touch: false});
    onSlidingComplete(v, mode);
  };

  thumbInnerRef: View;

  updateThumbInnerStyle(style: StyleProp<ViewStyle>) {
    if (this.thumbInnerRef) {
      this.thumbInnerRef.setNativeProps({ style });
    }
  }

  updateSliderBarColor = (color: string) => {
    this.updateThumbInnerStyle({
      backgroundColor: color,
    });    
  };

  render() {
    const {
      theme: { fontColor },
      min,
      max,
      value,
      sliderColor,
    } = this.props;

    return (
      <View
        style={[{width: '100%', backgroundColor: 'transparent', justifyContent: 'center',}]}
      >
        {/* 亮度滑动条 */}
        <Slider.Horizontal
          theme={{
            trackRadius: this.state.touch ? 8 : 2,
            trackHeight: this.state.touch ? 25 : 5,
            thumbTintColor: '#00FF00',
            maximumTrackTintColor: '#9fc5ea',
          }}
          trackStyle={this.state.touch ? styles.trackStyleTouch : styles.trackStyle}
          canTouchTrack={true}
          value={value}
          maximumValue={max}
          minimumValue={min}
          style={styles.slider}
          thumbTintColor={"#EFEFEF"}
          thumbTouchSize={{ width: 38, height: 38 }}
          thumbStyle={this.state.touch ? styles.thumbStyleTouch : styles.thumbStyle}
          type="normal"
          renderMinimumTrack={() => (
            <View
              ref={(ref: View) => {
                this.thumbInnerRef = ref;
              }}
              style={{
                height: this.state.touch ? 25 : 5,
                borderRadius: 0,
                backgroundColor: sliderColor,
                marginHorizontal: 0,
              }}
            />
          )}
          onValueChange={this.handleValueChange}
          onSlidingComplete={this.handleComplete}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  slider: {
    marginLeft: 5,
    marginRight: 3
  },
  sliderTouch: {
    marginTop: -18,
    marginBottom: 18,
    marginLeft: 5,
    marginRight: 3
  },
  trackStyle: {
    height: 5,
    borderRadius: 2,
  },
  trackStyleTouch: {
    height: 25,
    borderRadius: 8,
  },
  thumbStyle: {
    width:5,
    height:5,
    borderRadius: cx(2),
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  thumbStyleTouch: {
    width:35,
    height:35,
    borderRadius: cx(18),
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

});
