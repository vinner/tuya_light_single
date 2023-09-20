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
  cnt: number;
  id: number;
  show: boolean;
};

interface BottomSliderStates {
  id: number;
}

class BottomSlider extends React.Component<BottomSliderProps, BottomSliderStates> {
  constructor(props: BottomSliderProps) {
    super(props);

    this.state = {
      id: props.id,
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.show !== this.props.show) {
      return true;
    } else {
      return false;
    }
  }

  componentWillReceiveProps(nextProps): void {
    if (nextProps.id !== this.props.id) {
      this.startWaveAnimation(nextProps.id);
    }
  }

  waveAnim = new Animated.Value(0);;

  /* 开始进入或退出编辑界面的动画 */
  startWaveAnimation = (targetId: number) => {
    const { cnt, id } = this.props;
    let startId = id;
    let endId = targetId;

    const startValue = startId / (cnt - 1);
    const endValue = endId / (cnt - 1);
    
    this.waveAnim.setValue(startValue);
    Animated.timing(this.waveAnim, {
      toValue: endValue,
      duration: 500,
      easing: Easing.bezier(.22,.62,.6,.9),
    }).start();
  };

  render() {
    const { style, cnt, id, show } = this.props;
    this.waveAnim.setValue(id / (cnt - 1));

    const viewBg = show ? '#EDEDED' : 'transparent';
    const itemBg = show ? '#00AD3C' : 'transparent';

    return (
      <View style={[style, { width: cx(48), height: cx(4), borderRadius: cx(2), backgroundColor: viewBg }]} >
        <Animated.View
          accessibilityLabel="HomeScene_Custom_Editor"
          style={[
            { width: cx(16), height: cx(4), borderRadius: cx(2), backgroundColor: itemBg },
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