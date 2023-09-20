import React, { Component } from 'react';
import { View, StyleSheet, ViewStyle, Image, TouchableOpacity } from 'react-native';
import { Utils, TYText, TabBar } from 'tuya-panel-kit';
import Res from '../../../../res';
import DimmerPanel from './dimmer-panel';
import BasicColors from './basic-colors';
import { showGlobalToast, translateSToLimit, translateSToOriginal } from './dimmer-utils';
import MyColors, { MY_COLORS_DATA, SINGLE_COLORS_CNT_MAX } from './my-colors';

const { convertX: cx, width: winWidth } = Utils.RatioUtils;

const DIMMER_TYPE_TAB_WIDTH = Math.round(winWidth * 0.45);
const DIMMER_TYPE_TAB_HEIGHT = cx(46);
const DIMMER_PADDING = cx(4);
const DIMMER_TYPE_ITEM_HEIGHT = DIMMER_TYPE_TAB_HEIGHT - DIMMER_PADDING * 2;
const DIMMER_TYPE_ITEM_WIDTH = (DIMMER_TYPE_TAB_WIDTH - DIMMER_PADDING * 2) / 2;

interface DimmerPanelUnitsProps {
  style?: ViewStyle | ViewStyle[];
  onlySelected: boolean;
  isColour: boolean;
  h: number;
  s: number;
  t: number;
  b: number;
  singleColors;
  groupColors;
  lightLength;
  sLimit: boolean;
  onSwitch(isColour: boolean);
  onChange: (data: EditColorData, complete: boolean) => void;
  onMyColorSelected: (d: MY_COLORS_DATA, single: boolean) => void;
  onMyColorEditting: (editting: boolean) => void;
  onAddColor: (data: EditColorData) => void;
}

export interface EditColorData {
  isColour: boolean;
  h: number;
  s: number;
  t: number;
  b: number;
}

interface DimmerPanelUnitsState {
}

// 点击颜色方块展开的颜色编辑器
export default class DimmerPanelUnits extends Component<DimmerPanelUnitsProps, DimmerPanelUnitsState> {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  /** 白光和彩光调色切换的标签页数据 */
  dimmer_tabs = [
    {
      key: 'white',
      title: <Image style={{ width: cx(24), height: cx(24) }} source={Res.tab_white} />,
      tabStyle: { alignItems: 'center', justifyContent: 'center' },
      textStyle: { fontSize: cx(12) },
    },
    {
      key: 'color',
      title: <Image style={{ width: cx(24), height: cx(24) }} source={Res.tab_color} />,
      tabStyle: { alignItems: 'center', justifyContent: 'center' },
      textStyle: { fontSize: cx(12) },
    },
  ];

  _handleDimmerType = (value: string) => {
    const { onSwitch } = this.props;
    onSwitch( value === 'color' ? true : false);
  }

  /** 渲染白光和彩光调色切换的标签页 */
  _renderDimmerTabs = () => {
    const activeColor = this.props.isColour;
    return (
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: cx(24), justifyContent: 'space-between', marginTop: cx(22) }}>
        <TYText style={{ fontSize: cx(24), marginLeft: -cx(7), color: '#000', fontWeight: '400' }}> {'Setting'} </TYText>
        <View style = {styles.dimmerTypeView}>
          <TouchableOpacity style={activeColor ? styles.dimmerTypeItem : styles.dimmerTypeItemActive} onPress={() => this._handleDimmerType('white')}>
            <Image style={styles.dimmerTypeItemImage} source={Res.tab_white} />
          </TouchableOpacity>
          <TouchableOpacity style={activeColor ? styles.dimmerTypeItemActive : styles.dimmerTypeItem} onPress={() => this._handleDimmerType('color')}>
            <Image style={styles.dimmerTypeItemImage} source={Res.tab_color} />
          </TouchableOpacity>
        </View>
        {/*<TabBar
          type="radio"
          tabs={this.dimmer_tabs}
          activeKey={this.props.isColour ? 'color' : 'white'}
          onChange={value => this._handleDimmerType(value)}
          style={{
            width: Math.round(winWidth * 0.45),
            height: cx(46),
            borderRadius: cx(23),
            backgroundColor: '#EDEDED',
          }}
        />*/}
      </View>
    );
  }

  _handleBasicColor = (isColour: boolean, newh: number, news: number, newt: number) => {
    const { h, s, t, b, sLimit } = this.props;
    const tmps = isColour ? (sLimit ? translateSToLimit(newh, news) : news) : s;

    const color = {
      isColour,
      h: isColour ? Math.round(newh) : h,
      s: tmps,
      t: isColour ? t : Math.round(newt),
      b
    };

    this.props.onChange(color, true);
  }

  /** 渲染基础颜色 */
  _renderBasicColors = () => {
    return (
      <View style={{ width: '100%', paddingHorizontal: cx(24) }}>
        <BasicColors
          style={{ flex: 1 }}
          isColour={this.props.isColour}
          onSelectedChanged={this._handleBasicColor}
        />
      </View>
    )
  }

  _handleDimmerChange = (data: EditColorData, complete: boolean) => {
    const { h, s, t, sLimit, onChange } = this.props;
    const tmps = data.isColour ? (sLimit ? translateSToLimit(data.h, data.s) : Math.round(data.s)) : s;
    const color = {
      isColour: data.isColour,
      h: data.isColour ? Math.round(data.h) : h,
      s: tmps,
      t: data.isColour ? t : Math.round(data.t),
      b: Math.round(data.b),
    }
    onChange(color, complete);
  };

  _handleBrightChange = (b: number, complete: boolean) => {
    /** props 中传入的饱和度是已经转换过的，无需再做转换 */
    const { isColour, h, s, t, onChange } = this.props;
    const color = { isColour, h, s, t, b: Math.round(b) };
    onChange(color, complete);
  }

  _handleAddSingleColor = () => {
    const { isColour, h, s, t, b, onAddColor } = this.props;
    const color = { isColour, h, s, t, b };

    if (this.props.singleColors.length >= SINGLE_COLORS_CNT_MAX) {
      onAddColor(color);
      showGlobalToast('First color is replaced!', true);
    } else {
      onAddColor(color);
      showGlobalToast('Add a success', false);
    }
  }

  _renderDimmerPanel = () => {
    const { isColour, h, s, t, b, sLimit } = this.props;
    return (
      <DimmerPanel
        style={{}}
        disabled={false}
        isColour={isColour}
        h={h}
        s={sLimit ? translateSToOriginal(h, s) : s}
        t={t}
        b={b}
        showAddBtn={!this.props.onlySelected}
        onChange={this._handleDimmerChange}
        onBrightChange={this._handleBrightChange}
        onAddColor={this._handleAddSingleColor}
      />
    );
  }

  handleMyColorSelected = (d: MY_COLORS_DATA, single: boolean) => {
    if (d.data.length <= 0 || d.data.length !== d.stops.length) {
      return;
    }

    if (single) {
      const { isColour, h, s, t, b } = d.data[0];
      const color = { isColour, h, s: this.props.sLimit ? translateSToLimit(h, s) : Math.round(s), t, b };
      this.props.onChange(color, true);
    } else {
      this.props.onMyColorSelected(d, single);
    }
  }

  handleMyColorEditting = (editting: boolean) => {
    this.props.onMyColorEditting(editting);
  }


  _renderMyColors = () => {
    const { onlySelected, singleColors, groupColors, lightLength } = this.props;
    return (
      <MyColors
        style={{ width: winWidth - cx(42), marginHorizontal: cx(21), marginBottom: cx(22) }}
        isSingle={onlySelected}
        lightCnt={lightLength}
        singleColors={singleColors}
        groupColors={groupColors}
        onSelectedChanged={this.handleMyColorSelected}
        onEditting={this.handleMyColorEditting}
      />
    );
  }

  render() {
    return (
      <View style={[styles.container]}>
          {this._renderDimmerTabs()}
          {this._renderBasicColors()}
          {this._renderDimmerPanel()}
          {this._renderMyColors()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: winWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmerTypeView: {
    width: DIMMER_TYPE_TAB_WIDTH,
    height: DIMMER_TYPE_TAB_HEIGHT,
    borderRadius: DIMMER_TYPE_TAB_HEIGHT * 0.5,
    backgroundColor: '#EDEDED',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dimmerTypeItem: {
    width: DIMMER_TYPE_ITEM_WIDTH,
    height: DIMMER_TYPE_ITEM_HEIGHT,
    borderRadius: DIMMER_TYPE_ITEM_HEIGHT * 0.5,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dimmerTypeItemActive: {
    width: DIMMER_TYPE_ITEM_WIDTH,
    height: DIMMER_TYPE_ITEM_HEIGHT,
    borderRadius: DIMMER_TYPE_ITEM_HEIGHT * 0.5,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dimmerTypeItemImage: {
    width: cx(24),
    height: cx(24),
  }

});
