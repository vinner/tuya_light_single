import _ from 'lodash';
import React from 'react';
import {
  View,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { Utils } from 'tuya-panel-kit';

const {
  ThemeUtils: { withTheme },
} = Utils;

const { convertX: cx } = Utils.RatioUtils;

interface BottomSliderProps {
  theme?: any;
  accessibilityLabel?: string;
  style?: ViewStyle | ViewStyle[];
  tabDatas;
  tab: string;
};

interface BottomSliderStates {
  tab: string;
}

class BottomSlider extends React.Component<BottomSliderProps, BottomSliderStates> {
  constructor(props: BottomSliderProps) {
    super(props);

    this.state = {
      tab: props.tabDatas[0].key,
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps): void {
    if (nextProps.tab !== this.props.tab) {
      this.startWaveAnimation(nextProps.tab);
    }
  }

  waveAnim = new Animated.Value(0);;

  /* 开始进入或退出编辑界面的动画 */
  startWaveAnimation = (targetTab: string) => {
    const { tabDatas, tab } = this.props;
    let startId = 0;
    let endId = 0;

    tabDatas.map((t, i) => {
      (t.key === tab) && (startId = i);
      (t.key === targetTab) && (endId = i);
    })

    const startValue = startId / (tabDatas.length - 1);
    const endValue = endId / (tabDatas.length - 1);
    
    this.waveAnim.setValue(startValue);
    Animated.timing(this.waveAnim, {
      toValue: endValue,
      duration: 500,
      easing: Easing.bezier(.22,.62,.6,.9),
    }).start();
  };

  render() {
    const { style, tabDatas, tab } = this.props;

    let id = 0;
    tabDatas.map((t, i) => {(t.key === tab) && (id = i) })
    this.waveAnim.setValue(id / (tabDatas.length - 1));

    return (
      <View style={[style, { width: cx(48), height: cx(4), borderRadius: cx(2), backgroundColor:'#EDEDED' }]} >
        <Animated.View
          accessibilityLabel="HomeScene_Custom_Editor"
          style={[
            { width: cx(16), height: cx(4), borderRadius: cx(2), backgroundColor:'#00AD3C' },
            {
              transform: [
                {
                  translateX: this.waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, cx(32)],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    );
  }
}

export default withTheme(BottomSlider);