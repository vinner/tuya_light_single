import _ from 'lodash';
import React from 'react';
import {
  View,
  LayoutChangeEvent,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { TYText, Utils } from 'tuya-panel-kit';
import { getColorRgba, getWhiteKelvinRgba, mapKelvinToTemp } from '../../../../utils';

const {
  ThemeUtils: { withTheme },
} = Utils;

const { convertX: cx } = Utils.RatioUtils;

const COLORS = [
  { h: 0,   s: 1000, },
  { h: 39,  s: 1000, },
  { h: 60,  s: 1000, },
  { h: 120, s: 1000, },
  { h: 180, s: 1000, },
  { h: 240, s: 1000, },
  { h: 277, s: 867,  },
];

const WHITES = [
  { k: 2700, title: 'Warm' },
  { k: 4000, title: 'Neutral' },
  { k: 5500, title: 'Cool' },
];

interface BasicColorsProps {
  theme?: any;
  accessibilityLabel?: string;
  style?: ViewStyle | ViewStyle[];
  isColour: boolean;
  onSelectedChanged: (isColor: boolean, h: number, s: number, t: number) => void;
};

interface BasicColorStates {
  colorItemSize: number;
  whiteItemWidth: number;
  whiteItemHeight: number;
}

class BasicColors extends React.Component<BasicColorsProps, BasicColorStates> {
  constructor(props: BasicColorsProps) {
    super(props);

    this.state = {
      colorItemSize: 0,
      whiteItemWidth: 0,
      whiteItemHeight: 0,
    }
  }

  _handleLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    const colorSize = layout.width / (COLORS.length * 3 - 1) * 2;
    const whiteWidth = (layout.width - colorSize * 0.5 * (WHITES.length - 1)) / WHITES.length;
    const whiteHeight = colorSize * 1.5;
    this.setState({ colorItemSize: colorSize, whiteItemWidth: whiteWidth, whiteItemHeight: whiteHeight });
  };

  renderItems = () => {
    const { isColour, onSelectedChanged } = this.props;
    const { colorItemSize, whiteItemWidth, whiteItemHeight } = this.state;

    const items = isColour ? COLORS : WHITES;
    const height = isColour ? colorItemSize : whiteItemHeight;
    const width = isColour ? colorItemSize : whiteItemWidth;

    return (
      items.map(c => {
        const bg = isColour ? getColorRgba(c.h, c.s, 1000) : getWhiteKelvinRgba(c.k, 1000);
        const h = isColour ? c.h : 0;
        const s = isColour ? c.s : 0;
        const t = isColour ? 0 : mapKelvinToTemp(c.k);
        return (
          <TouchableOpacity
            style={{
              width,
              height,
              borderRadius: height * 0.5,
              backgroundColor: bg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => onSelectedChanged(isColour, h, s, t)}
          >
            {!isColour &&
              <TYText style={{ fontSize:cx(12), color: '#04001E'}}> {c.title} </TYText>
            }
          </TouchableOpacity>
        )
      })
    );
  }

  render() {
    const { style, isColour } = this.props;
    const { colorItemSize, whiteItemHeight } = this.state;

    const totalHeight = cx(86);
    const itemHeight = isColour ? colorItemSize : whiteItemHeight;
    const margin = (totalHeight - itemHeight) * 0.5;

    return (
      <View
        style={[style, { alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', marginVertical: margin }]}
        onLayout={this._handleLayout}
      >
        {this.renderItems()}
      </View>
    );
  }
}

export default withTheme(BasicColors);