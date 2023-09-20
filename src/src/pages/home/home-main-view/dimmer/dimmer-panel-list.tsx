import React, { Component } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, ScrollView } from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import { getColorRgb, getWhiteRgb } from '../../../../utils';

const { convertX: cx } = Utils.RatioUtils;

const VIEW_MARGIN_H = cx(53);
const ITEM_HEIGHT = cx(32);
const ITEM_BORDER_RADIUS = cx(18);
const ITEM_MARGIN_B = cx(16);
const ITEM_CNT_PRELINE = 5;

interface DimmerPanelListProps {
  style?: ViewStyle | ViewStyle[];
  isColour: boolean;
  h: number;
  s: number;
  t: number;
  b: number;
  onChange: (data: EditColorData, complete: boolean) => void;
}

export interface EditColorData {
  isColour: boolean;
  h: number;
  s: number;
  t: number;
  b: number;
}

interface DimmerPanelListState {
  colorActiveId: number;
}

// 点击颜色方块展开的颜色编辑器
export default class DimmerPanelList extends Component<DimmerPanelListProps, DimmerPanelListState> {
  static defaultProps = {
    scrollEnalbe: true,
  };

  flatList;
  colorRef: View;

  constructor(props) {
    super(props);
    this.state = {
      colorActiveId: -1,
    };
  }

  _handlePress = (data: EditColorData, id: number) => {
    const { isColour, h, s, t, b } = data;

    this.setState({ colorActiveId: id })
    this.props.onChange({
      isColour,
      h,
      s,
      t,
      b,
    }, true);
  }

  _renderColorItem = (cs: COLORS_ENTRY, index: number) => {
    if (cs.colors.length <= 0) {
      return;
    }

    const  {colorActiveId } = this.state;
    const cw = Math.floor(67/cs.colors.length);
    const tw = 100 - cw * cs.colors.length;
    const cwt = `${cw}%`;
    const twt = `${tw}%`;
    let activeId = -1;
    
    return (
      <View style={styles.itemView} >
        <TYText style={{ width: twt, fontSize: cx(12), color: '#020914' }}> {cs.title} </TYText>
        {
          cs.colors.map((c, i) => {
            const bg = c.isColour ? getColorRgb(c.h, c.s, c.b) : getWhiteRgb(c.t, c.b);
            (ITEM_CNT_PRELINE * index + i) === colorActiveId && (activeId = i);
            return (
              <TouchableOpacity
                style={{
                  backgroundColor: bg,
                  width: cwt,
                  height: ITEM_HEIGHT,
                  marginLeft: -1,
                  borderTopLeftRadius: i === 0 ? ITEM_BORDER_RADIUS : 0,
                  borderBottomLeftRadius: i === 0 ? ITEM_BORDER_RADIUS : 0,
                  borderTopRightRadius: i === (cs.colors.length - 1) ? ITEM_BORDER_RADIUS : 0,
                  borderBottomRightRadius: i === (cs.colors.length - 1) ? ITEM_BORDER_RADIUS : 0,
                }}
                onPress={() => this._handlePress(c, ITEM_CNT_PRELINE * index + i)}
              />
            );
          })
        }
        {
          activeId >= 0 && (
            <View
              style={{
                width: cwt,
                height: ITEM_HEIGHT,
                borderTopLeftRadius: activeId === 0 ? ITEM_BORDER_RADIUS : 0,
                borderBottomLeftRadius: activeId === 0 ? ITEM_BORDER_RADIUS : 0,
                borderTopRightRadius: activeId === (cs.colors.length - 1) ? ITEM_BORDER_RADIUS : 0,
                borderBottomRightRadius: activeId === (cs.colors.length - 1) ? ITEM_BORDER_RADIUS : 0,
                backgroundColor: 'transparent',
                position: 'absolute',
                top: 0,
                left: `${tw + cw * activeId}%`,
                marginLeft: -1,
                borderColor: '#fff',
                borderWidth: 1,
              }}
            />
          )
        }
      </View>
    );
  }

  _handleScroll = (start: boolean) => {
    const { isColour, h, s, t, b, onChange } = this.props;
    onChange({
      isColour,
      h,
      s,
      t,
      b,
    }, start ? false : true);
  }

  render() {
    return (
      <View style={[this.props.style, styles.container]}>
        <ScrollView
          style={{ flex: 1, paddingRight: 5 }}
          onTouchStart={() => this._handleScroll(true)}
          onMomentumScrollEnd={() => this._handleScroll(false)}
        >
          { COLORS_LIST.map((c, i) => this._renderColorItem(c, i))}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: VIEW_MARGIN_H,
  },
  itemView: {
    flex: 1,
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    marginBottom: ITEM_MARGIN_B,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface COLORS_ENTRY {
  title: string;
  colors: EditColorData[];
}

const COLORS_LIST: COLORS_ENTRY[] = [
  {
    title: 'Sweet',
    colors: [
      {isColour: true, h: 351, s: 286, t: 0, b: 1000},
      {isColour: true, h: 350, s: 247, t: 0, b: 1000},
      {isColour: true, h: 330, s: 588, t: 0, b: 1000},
      {isColour: true, h: 333, s: 757, t: 0, b: 1000},
      {isColour: true, h: 328, s: 922, t: 0, b: 1000},
    ],
  },
  {
    title: 'Romantic',
    colors: [
      {isColour: true, h: 340, s: 489, t: 0, b: 859},
      {isColour: true, h: 322, s: 796, t: 0, b: 1000},
      {isColour: true, h: 348, s: 731, t: 0, b: 933},
      {isColour: true, h: 4, s: 895, t: 0, b: 933},
      {isColour: true, h: 0, s: 1000, t: 0, b: 1000},
    ],
  },
  {
    title: 'Mysterious',
    colors: [
      {isColour: true, h: 300, s: 118, t: 0, b: 933},
      {isColour: true, h: 260, s: 490, t: 0, b: 1000},
      {isColour: true, h: 259, s: 492, t: 0, b: 933},
      {isColour: true, h: 271, s: 812, t: 0, b: 1000},
      {isColour: true, h: 271, s: 815, t: 0, b: 804},
    ],
  },
  {
    title: 'Angry',
    colors: [
      {isColour: true, h: 0, s: 467, t: 0, b: 941},
      {isColour: true, h: 9, s: 722, t: 0, b: 1000},
      {isColour: true, h: 0, s: 512, t: 0, b: 804},
      {isColour: true, h: 348, s: 909, t: 0, b: 863},
      {isColour: true, h: 0, s: 1000, t: 0, b: 1000},
    ],
  },
  {
    title: 'vitality',
    colors: [
      {isColour: true, h: 60, s: 1000, t: 0, b: 1000},
      {isColour: true, h: 120, s: 1000, t: 0, b: 1000},
      {isColour: true, h: 240, s: 1000, t: 0, b: 1000},
      {isColour: true, h: 39, s: 1000, t: 0, b: 1000},
      {isColour: true, h: 0, s: 1000, t: 0, b: 1000},
    ],
  },
  {
    title: 'Fire',
    colors: [
      {isColour: true, h: 50, s: 455, t: 0, b: 1000},
      {isColour: true, h: 43, s: 855, t: 0, b: 1000},
      {isColour: true, h: 43, s: 857, t: 0, b: 933},
      {isColour: true, h: 32, s: 850, t: 0, b: 784},
      {isColour: true, h: 25, s: 857, t: 0, b: 824},
    ],
  },
  {
    title: 'Ocean 1',
    colors: [
      {isColour: true, h: 186, s: 84, t: 0, b: 929},
      {isColour: true, h: 184, s: 211, t: 0, b: 875},
      {isColour: true, h: 190, s: 440, t: 0, b: 820},
      {isColour: true, h: 212, s: 468, t: 0, b: 729},
      {isColour: true, h: 209, s: 258, t: 0, b: 882},
    ],
  },
  {
    title: 'Ocean 2',
    colors: [
      {isColour: true, h: 86, s: 30, t: 0, b: 929},
      {isColour: true, h: 173, s: 238, t: 0, b: 906},
      {isColour: true, h: 181, s: 321, t: 0, b: 843},
      {isColour: true, h: 199, s: 378, t: 0, b: 757},
      {isColour: true, h: 203, s: 439, t: 0, b: 420},
    ],
  },
  {
    title: 'Forest',
    colors: [
      {isColour: true, h: 67, s: 986, t: 0, b: 871},
      {isColour: true, h: 89, s: 367, t: 0, b: 824},
      {isColour: true, h: 84, s: 794, t: 0, b: 627},
      {isColour: true, h: 89, s: 878, t: 0, b: 384},
      {isColour: true, h: 150, s: 712, t: 0, b: 231},
    ],
  },
  {
    title: 'Gardens',
    colors: [
      {isColour: true, h: 122, s: 175, t: 0, b: 851},
      {isColour: true, h: 112, s: 597, t: 0, b: 604},
      {isColour: true, h: 110, s: 507, t: 0, b: 525},
      {isColour: true, h: 161, s: 667, t: 0, b: 400},
      {isColour: true, h: 117, s: 247, t: 0, b: 286},
    ],
  },
  {
    title: 'Mew',
    colors: [
      {isColour: true, h: 7, s: 130, t: 0, b: 992},
      {isColour: true, h: 316, s: 338, t: 0, b: 812},
      {isColour: true, h: 256, s: 227, t: 0, b: 796},
      {isColour: true, h: 223, s: 326, t: 0, b: 843},
      {isColour: true, h: 326, s: 175, t: 0, b: 988},
    ],
  },
  {
    title: 'Lightning',
    colors: [
      {isColour: true, h: 213, s: 326, t: 0, b: 745},
      {isColour: true, h: 233, s: 179, t: 0, b: 592},
      {isColour: true, h: 215, s: 338, t: 0, b: 580},
      {isColour: true, h: 221, s: 364, t: 0, b: 992},
      {isColour: true, h: 236, s: 425, t: 0, b: 443},
    ],
  },
  {
    title: 'Morandi 1',
    colors: [
      {isColour: true, h: 274, s: 216, t: 0, b: 455},
      {isColour: true, h: 325, s: 174, t: 0, b: 698},
      {isColour: true, h: 339, s: 126, t: 0, b: 714},
      {isColour: true, h: 347, s: 253, t: 0, b: 651},
      {isColour: true, h: 340, s: 198, t: 0, b: 416},
    ],
  },
  {
    title: 'Morandi 2',
    colors: [
      {isColour: true, h: 90, s: 146, t: 0, b: 643},
      {isColour: true, h: 225, s: 191, t: 0, b: 678},
      {isColour: true, h: 351, s: 83, t: 0, b: 898},
      {isColour: true, h: 29, s: 123, t: 0, b: 988},
      {isColour: true, h: 266, s: 77, t: 0, b: 816},
    ],
  },
  {
    title: 'Fluorescence',
    colors: [
      {isColour: true, h: 60, s: 904, t: 0, b: 984},
      {isColour: true, h: 328, s: 892, t: 0, b: 945},
      {isColour: true, h: 102, s: 893, t: 0, b: 988},
      {isColour: true, h: 283, s: 914, t: 0, b: 824},
      {isColour: true, h: 6, s: 831, t: 0, b: 949},
    ],
  },
];
