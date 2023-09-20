import _ from 'lodash';
import React from 'react';
import {
  View,
  LayoutChangeEvent,
  ViewStyle,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
// @ts-ignore
import { IconFont, TYText, Utils, Collapsible, TYSdk } from 'tuya-panel-kit';
import icons from '../../../../res/iconfont';
import { getWhiteRgba, getColorRgba } from '../../../../utils';
import { COLOR_DATA, saveCloudSingleColor, saveCloudGroupColors, } from './dimmer-utils';

const {
  ThemeUtils: { withTheme },
} = Utils;

const { convertX: cx } = Utils.RatioUtils;

export const SINGLE_COLORS_CNT_MAX = 7;
export const GROUP_COLORS_CNT_MAX = 7;

const GROUP_COLORS_BASE_CNT = 2;

export interface MY_COLORS_DATA {
  data: COLOR_DATA[];
  stops: number[];
  lightCnt: number;
};

interface MyColorsProps {
  theme?: any;
  accessibilityLabel?: string;
  style?: ViewStyle | ViewStyle[];
  isSingle: boolean;
  lightCnt: number;
  singleColors: COLOR_DATA[];
  groupColors: MY_COLORS_DATA[];
  onSelectedChanged: (colors: MY_COLORS_DATA, single: boolean) => void;
  onEditting: (editting: boolean) => void;
};

interface MyColorStates {
  layoutWidth: number;
  singleSize: number;
  itemSize: number;
  editting: boolean;
  selected: boolean[];
  collapsed: boolean;
}

class MyColors extends React.Component<MyColorsProps, MyColorStates> {
  constructor(props: MyColorsProps) {
    super(props);

    this.state = {
      layoutWidth: 0,
      singleSize: 0,
      itemSize: 0,
      editting: false,
      selected: [],
      collapsed: true,
    }
  }

  _handleLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    const singleSize = layout.width / SINGLE_COLORS_CNT_MAX;
    const itemSize = layout.width / (SINGLE_COLORS_CNT_MAX * 3 - 1) * 2;
    this.setState({ layoutWidth: layout.width, itemSize, singleSize, });
  };

  _handlePress = (index: number, single: boolean) => {
    const { onSelectedChanged, singleColors, groupColors, lightCnt } = this.props;
    const { editting, selected } = this.state;
    const colors = single ? singleColors : groupColors;
    const id = single ? index : index + singleColors.length;

    if (index < 0 || index >= colors.length) {
      return;
    }

    if (editting) {
      const newSelected = [...selected];
      newSelected[id] = !newSelected[id];
      this.setState({selected: newSelected});
    } else {
      if (single) {
        const c: MY_COLORS_DATA = {
          data: [ singleColors[index] ],
          stops: [100],
          lightCnt,
        };
        onSelectedChanged(c, true);
      } else {
        onSelectedChanged(groupColors[index], false);
      }
    }
  }

  _handleGroupSinglePress = (color: COLOR_DATA) => {
    const c: MY_COLORS_DATA = {
      data: [ color ],
      stops: [100],
      lightCnt: this.props.lightCnt,
    };
    this.props.onSelectedChanged(c, true);
  }

  _handleEdit = () => {
    const { singleColors, groupColors } = this.props;

    if (this.state.editting) {
      this.setState({
        editting: false,
      });
    } else {
      (singleColors.length > 0 || groupColors.length > 0) &&
      this.setState({
        editting: true,
        selected: new Array(singleColors.length + groupColors.length).fill(false),
      });

      setTimeout(() => {
        this.props.onEditting(true);
      }, 500)
    }
  }

  _handleDelete = () => {
    // TODO 删除颜色
    const { selected } = this.state;
    const { singleColors, groupColors } = this.props;

    if (selected.indexOf(true) >= 0) {
      const newSingleColors = singleColors.filter((_s, i) => selected[i] === false);
      const newGroupColors = groupColors.filter((_g, i) => selected[singleColors.length + i] === false);
      newSingleColors.length !== singleColors.length && saveCloudSingleColor(newSingleColors);
      newGroupColors.length !== groupColors.length && saveCloudGroupColors(newGroupColors);
      this.setState({ collapsed: true });
    }
    this.setState({ editting: false });
  }

  renderTitle = () => {
    const showEdit = this.props.isSingle ? false : true;
    return (
      <View
        style={{ flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'space-between', marginBottom: cx(22) }}
      >
        <TYText style={{ fontSize: cx(24), marginLeft: -cx(2), color: '#000', fontWeight: '400' }}> {'My colors'} </TYText>
        {
          showEdit &&
          <TouchableOpacity
            onPress={this._handleEdit}
          >
            <IconFont d={icons.edit2} size={cx(22)} fill={'#000'} stroke={'#000'} />
          </TouchableOpacity>
        }
      </View>
    );
  }

  renderSingleItems = () => {
    const { singleColors } = this.props;
    const { itemSize, editting, selected } = this.state;
    const touchSize = itemSize + 8;
    const viewSize = itemSize;

    return (
      <View
        style={{ alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', marginBottom: cx(15) }}
      >
        {
          _.times(SINGLE_COLORS_CNT_MAX, i => {
            if (singleColors.length > i) {
              const c = singleColors[i];
              const bg = c.isColour ? getColorRgba(c.h, c.s, c.b)
              : getWhiteRgba(c.t, c.b);

              return (
                <TouchableOpacity
                  style={{
                    width: touchSize,
                    height: touchSize,
                    borderRadius: touchSize * 0.5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    borderColor: '#00AD3C',
                    borderWidth: (editting && selected[i]) ? 1 : 0,
                  }}
                  onPress={() => this._handlePress(i, true)}
                >
                  <View style={{ width: viewSize, height: viewSize, borderRadius: viewSize * 0.5, backgroundColor: bg }}/>
                </TouchableOpacity>

              );
            } else {
              return (
                <View
                  style={{
                    width: touchSize,
                    height: touchSize,
                    borderRadius: touchSize * 0.5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                  }}
                />
              );
            }
          })
        }
      </View>
    );
  }
  
  calItemWidth = (s: number, n: number, w: number, lightCnt: number) => {
    const cnt = Math.floor(lightCnt * s / 100);
    return w * cnt / n;
  }

  renderGroupItem = (index: number) => {
    const { singleColors, groupColors } = this.props;
    const { layoutWidth, itemSize, editting, selected } = this.state;
    const touchSize = itemSize + 8;
    const viewWidthRemind = itemSize * 1;   /** 首尾两个颜色保证最小宽度 */
    const viewWidth = layoutWidth - 8;      /** 所有的颜色总长度 */
    const viewSize = itemSize;              /** 颜色的高度 */

    const c = groupColors[index];
    const s = c.stops;
    let sw = this.calItemWidth(s[0], c.lightCnt, viewWidth, c.lightCnt);
    let ew = this.calItemWidth(s[s.length - 1], c.lightCnt, viewWidth, c.lightCnt);
    sw = sw < viewWidthRemind ? viewWidthRemind : sw;
    ew = ew < viewWidthRemind ? viewWidthRemind : ew;

    if (this.props.isSingle) {
      return (
        <View
          style={{
            width: layoutWidth,
            height: touchSize,
            borderRadius: touchSize * 0.5,
            backgroundColor: 'transparent',
            borderColor: '#00AD3C',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            marginBottom: cx(15),
            borderWidth: (editting && selected[index + singleColors.length]) ? 1 : 0,
          }}
        >
          {
            c.data.map((d, j)=> {
              const bg = d.isColour ? getColorRgba(d.h, d.s, d.b) : getWhiteRgba(d.t, d.b);
              const w = j === 0 ? sw : j === c.data.length - 1 ? ew
                        : this.calItemWidth(c.stops[j], c.lightCnt - 2, (viewWidth - sw - ew), c.lightCnt);
              return (
                <TouchableOpacity
                  style={{
                    width: w,
                    height: viewSize,
                    borderTopLeftRadius: j === 0 ? viewSize * 0.5 : 0,
                    borderBottomLeftRadius: j === 0 ? viewSize * 0.5 : 0,
                    borderTopRightRadius: (j === c.data.length - 1) ? viewSize * 0.5 : 0,
                    borderBottomRightRadius: (j === c.data.length - 1) ? viewSize * 0.5 : 0,
                    backgroundColor: bg,
                  }}
                  onPress={() => this._handleGroupSinglePress(d)}
                />
              );
            })
          }
        </View>
      )
    } else {
      return (
        <TouchableOpacity
          style={{
            width: layoutWidth,
            height: touchSize,
            borderRadius: touchSize * 0.5,
            backgroundColor: 'transparent',
            borderColor: '#00AD3C',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            marginBottom: cx(15),
            borderWidth: (editting && selected[index + singleColors.length]) ? 1 : 0,
          }}
          onPress={() => this._handlePress(index, false)}
        >
          {
            c.data.map((d, j)=> {
              const bg = d.isColour ? getColorRgba(d.h, d.s, d.b) : getWhiteRgba(d.t, d.b);
              const w = j === 0 ? sw : j === c.data.length - 1 ? ew
                        : this.calItemWidth(c.stops[j], c.lightCnt - 2, (viewWidth - sw - ew), c.lightCnt);
              return (
                <View
                  style={{
                    width: w,
                    height: viewSize,
                    borderTopLeftRadius: j === 0 ? viewSize * 0.5 : 0,
                    borderBottomLeftRadius: j === 0 ? viewSize * 0.5 : 0,
                    borderTopRightRadius: (j === c.data.length - 1) ? viewSize * 0.5 : 0,
                    borderBottomRightRadius: (j === c.data.length - 1) ? viewSize * 0.5 : 0,
                    backgroundColor: bg,
                  }}
                />
              );
            })
          }
        </TouchableOpacity>
      )
    }
  }

  renderGroupItemsBase = () => {
    const { groupColors } = this.props;
    const cnt = groupColors.length < GROUP_COLORS_BASE_CNT ? groupColors.length : GROUP_COLORS_BASE_CNT;

    return (
      <View style={{ alignItems: 'center', justifyContent: 'space-between' }} >
        {_.times(cnt, i => this.renderGroupItem(i))}
      </View>
    );
  }

  renderGroupItemsMore = () => {
    const { groupColors } = this.props;
    const cnt = groupColors.length - GROUP_COLORS_BASE_CNT;

    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Collapsible
          collapsed={this.state.collapsed}
          align="center"
        >
          <View style={{ alignItems: 'center', justifyContent: 'space-between' }} >
            { _.times(cnt, i => this.renderGroupItem(GROUP_COLORS_BASE_CNT + i)) }
          </View>
        </Collapsible>
        <TouchableOpacity
          style={{ flexDirection: 'row', marginVertical: cx(14), alignItems: 'center', justifyContent: 'center' }}
          onPress={() => this.setState({ collapsed: !this.state.collapsed })}
        >
          <TYText style={{color: '#00AD3C', fontSize: cx(14)}}> {'More'} </TYText>
          <IconFont d={ this.state.collapsed ? icons.down : icons.up} size={cx(14)} fill={'#00AD3C'} stroke={'#00AD3C'} />
        </TouchableOpacity>
      </View>
    );
  }

  renderOptButtons = () => {
    return (
      <View style={styles.btns_panel} >
        <TouchableOpacity style={[styles.btn, styles.btn_center]} onPress={() => this.setState({ editting: false })}>
          <TYText style={styles.btn_text_confirm}> {'Confirm'} </TYText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={this._handleDelete}>
          <TYText style={styles.btn_text_delete}> {'Delete'} </TYText>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const { style, singleColors, groupColors } = this.props;
    const { editting }  = this.state;

    return (
      <View
        style={[style]}
        onLayout={this._handleLayout}
      >
        {this.renderTitle()}
        {singleColors && singleColors.length > 0 && this.renderSingleItems()}
        {groupColors && groupColors.length > 0 && this.renderGroupItemsBase()}
        {groupColors && groupColors.length > GROUP_COLORS_BASE_CNT && this.renderGroupItemsMore()}
        {editting && this.renderOptButtons()}
      </View>
    );
  }
}

export default withTheme(MyColors);

const styles = StyleSheet.create({
  btns_panel: {
    flexDirection: 'row',
    flex: 1,
    marginVertical: cx(20),
    marginHorizontal: cx(20),
  },
  btn: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn_center: {
    borderRightWidth: 1,
    borderRightColor: '#DADADA',
  },
  btn_text_confirm: {
    fontSize: cx(14),
    color: '#000',
  },
  btn_text_delete: {
    fontSize: cx(14),
    color: '#FF3F33',
  },

});