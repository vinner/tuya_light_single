import _, {  } from 'lodash';
import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Utils, TYText, Collapsible, IconFont, TYSdk } from 'tuya-panel-kit';
import { SCENE_ENTRY, flash_mode_configs } from './scene-config';
import Res from '../../../../res';
import icons from '../../../../res/iconfont';
import SliderSelector from '../../../../components/SliderSelector';
import { getColorRgba, getWhiteRgba, randomHsb } from '@utils';
import { EditColorData } from '../dimmer/dimmer-panel';
import SceneDiyDimmer from './scene-diy-dimmer-view';
import Popup from '../../../../components/popup';
import {
  lampSceneValue, saveCloudDiyScene,
} from './scene-utils'

const {
  ThemeUtils: { withTheme },
} = Utils;

const { convertX: cx, winWidth, } = Utils.RatioUtils;

const ITEM_CNT_PRELINE = 4;
const ITEM_MARGIN_H = cx(24);
const ITEM_INTERVAL = cx(15);
const ITEM_TEXT_MARGIN_TOP = cx(8);
const ITEM_FONT_SIZE = cx(10);
const ITEM_MARING_BOTTOM = cx(24);
const ITEM_IMAGE_SIZE = (winWidth - ITEM_MARGIN_H * 2 - ITEM_INTERVAL * (ITEM_CNT_PRELINE - 1)) / ITEM_CNT_PRELINE;
const ITEM_VIEW_WIDTH = ITEM_IMAGE_SIZE + ITEM_INTERVAL;
const ITEM_VIEW_MARGIN_H = ITEM_MARGIN_H - ITEM_INTERVAL * 0.5;

const FLASH_MODE_ITEM_WIDTH = (winWidth - cx(57)) * 0.5;
const FLASH_MODE_ITEM_HEIGHT = cx(44);

const COLOR_CNT_MAX = 7;
const COLOR_MARGIN_H = cx(20);
const COLOR_INTERVAL = cx(7);
const COLOR_VIEW_SIZE = (winWidth - COLOR_MARGIN_H * 2 - COLOR_INTERVAL * (COLOR_CNT_MAX - 1)) / COLOR_CNT_MAX;
const COLOR_ITEM_SIZE = COLOR_VIEW_SIZE - cx(8);


interface SceneDiyProps {
  theme?: any;
  accessibilityLabel?: string;
  style?: ViewStyle | ViewStyle[];
  diyDatas: SCENE_ENTRY[];
  currSceneId: number;
  singleColors;
  groupColors;
  lightLength;
  onItemSelected: (item) => void;
  onParamsChange: (complete: boolean) => void;
};

interface SceneDiyStates {
  index: number;
  collapsed: boolean;
  editting: boolean;
  selected: boolean[];
  editColor: EditColorData;
  editIndex: number;
}

class SceneDiy extends React.Component<SceneDiyProps, SceneDiyStates> {
  constructor(props: SceneDiyProps) {
    super(props);

    const index = props.diyDatas.findIndex(d => d.value.id === props.currSceneId);
    this.state = {
      index,
      collapsed: true,
      editting: false,
      selected: new Array(COLOR_CNT_MAX).fill(false),
      editColor: { isColour: true, h: 0, s: 1000, t: 1000, b: 1000 },
      editIndex: -1,
    }
  }

  componentWillReceiveProps(nextProps: Readonly<SceneDiyProps>): void {
    if (nextProps.currSceneId !== this.props.currSceneId ||
        nextProps.diyDatas !== this.props.diyDatas) {
      this.setState({
        index: nextProps.diyDatas.findIndex(d => d.value.id === nextProps.currSceneId),
      })
    }
    //TYSdk.native.simpleTipDialog('rec: ' + JSON.stringify(nextProps.diyDatas), () => {});
  }

  handleItemPress = (item) => {
    this.props.onItemSelected(item);
  }

  renderItem = (item, index) => {
    const { currSceneId } = this.props;

    const first = (index % ITEM_CNT_PRELINE === 0) ? true : false;
    const end = (index % ITEM_CNT_PRELINE === (ITEM_CNT_PRELINE - 1)) ? true : false;
    const active = (item.value.id === currSceneId) ? true : false;

    return (
      <View
        style={[
          styles.itemView,
          {
            marginLeft: first ? ITEM_VIEW_MARGIN_H : 0,
            marginRight: end ? ITEM_VIEW_MARGIN_H : 0,
          }
        ]}>
        <TouchableOpacity
          accessibilityLabel="HomeScene_SceneView_Select"
          activeOpacity={0.9}
          style={[styles.iconTouch, active && styles.iconActive ]}
          onPress={() => this.handleItemPress(item)}
        >
          <Image style={styles.itemImage} source={item.image} />
        </TouchableOpacity>

        <TYText style={active ? styles.itemTextActive : styles.itemText}> {item.title} </TYText>
      </View>
    );
  };

  renderDiyItems = () => {
    return (
      <View style={{ width: '100%' }}>
        <View style={{ width: '100%', flexDirection: 'row' }}>
          {this.props.diyDatas.map((d, i) => this.renderItem(d, i))}
        </View>
        <View style={{ height: 0.5, width: '100%', backgroundColor: '#dcdadd' }}/>
      </View>
    );
  }

  renderTitle = (title: string) => {
    return (
      <TYText style={{ fontSize: cx(24), marginLeft: cx(17), fontWeight: '400', textAlign: 'left' }}> {title} </TYText>
    );
  }

  handleFlashModePress = (mode: number) => {
    const newDiyDatas = [...this.props.diyDatas]
    newDiyDatas[this.state.index].value.mode = mode;

    lampSceneValue(newDiyDatas[this.state.index].value);
    saveCloudDiyScene(newDiyDatas);
  }

  renderFlashModeItem = (title: string, mode: number) => {
    const { diyDatas } = this.props;
    const active = diyDatas[this.state.index].value.mode === mode ? true : false;
    return (
      <TouchableOpacity
        style={{
          width: FLASH_MODE_ITEM_WIDTH,
          height: FLASH_MODE_ITEM_HEIGHT,
          borderRadius: cx(22),
          borderWidth: 0.5,
          borderColor: active ? '#00AD3C' : '#DADADA',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: cx(16),
        }}
        onPress={() => this.handleFlashModePress(mode)}
      >
        <TYText style={{ fontSize: cx(12), color: active ? '#00AD3C' : '#020914' }}> {title} </TYText>
      </TouchableOpacity>
    )
  }

  renderFlashModeBase = () => {
    //TYSdk.native.simpleTipDialog('mode: ' + this.state.index + ',' + JSON.stringify(this.props.diyDatas[this.state.index]), () => {})
    const fc = flash_mode_configs; //.slice(0, 2);
    return (
      <View style={{ width: winWidth, flexDirection: 'row', flexWrap: 'wrap',  paddingHorizontal: cx(24), marginTop: cx(24), justifyContent: 'space-between' }}>
        {fc.map(f => this.renderFlashModeItem(f.title, f.mode))}
      </View>
    );
  }

  renderFlashModeMore = () => {
    const fc = flash_mode_configs.slice(2);
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Collapsible
          collapsed={this.state.collapsed}
          align="center"
        >
          <View style={{ width: winWidth, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: cx(24), justifyContent: 'space-between' }}>
            {fc.map(f => this.renderFlashModeItem(f.title, f.mode))}
          </View>
        </Collapsible>
        <TouchableOpacity
          style={{ flexDirection: 'row', marginVertical: cx(8), alignItems: 'center', justifyContent: 'center' }}
          onPress={() => this.setState({ collapsed: !this.state.collapsed })}
        >
          <TYText style={{color: '#00AD3C', fontSize: cx(14)}}> {'More'} </TYText>
          <IconFont d={ this.state.collapsed ? icons.down : icons.up} size={cx(14)} fill={'#00AD3C'} stroke={'#00AD3C'} />
        </TouchableOpacity>
      </View>
    );
  }

  scrollViewRef: ScrollView;

  handleColorChange = (data: EditColorData) => {
    this.setState({ editColor: data });
  }

  renderDimmerPanel = (color: EditColorData) => {
    return (
      <SceneDiyDimmer
        color={color}
        singleColors={this.props.singleColors}
        groupColors={this.props.groupColors}
        lightLength={this.props.lightLength}
        onColorChange={this.handleColorChange}
      />
    );
  }

  handleColorUpdate = () => {
    const { index, editIndex, editColor } = this.state;

    /** 添加颜色 */
    if (editIndex < 0) {
      const newDiyDatas = [...this.props.diyDatas];

      /** 判断颜色数量是否已经达到最大 */
      if (newDiyDatas[index].value.colors.length >= COLOR_CNT_MAX) {
        return;
      }

      newDiyDatas[index].value.colors.push(editColor);
      lampSceneValue(newDiyDatas[index].value);
      saveCloudDiyScene(newDiyDatas);
    } else {
      const newDiyDatas = [...this.props.diyDatas]
      newDiyDatas[index].value.colors[editIndex] = editColor;
      lampSceneValue(newDiyDatas[index].value);
      saveCloudDiyScene(newDiyDatas);
    }
  }

  handleAddColor = () => {
    this.setState({ editIndex: -1 });
    const hsb = randomHsb();
    const color: EditColorData = { isColour: true, h: hsb[0], s: 1000, t: 0, b: 1000 };
    Popup.custom({
      content: (this.renderDimmerPanel(color)),
      footerType: 'singleConfirm',
      confirmText: 'Confirm',
      confirmTextStyle: { color: '#fff', fontWeight: 'normal' },
      footerWrapperStyle: { marginBottom: cx(24) },
      showTitleDivider: false,
      onMaskPress: ({ close }) => close(),
      onConfirm: (_data, { close }) => {
        setTimeout(() => this.handleColorUpdate(), 500);
        close();
      },
    });
  }

  handleEditColor = (color: EditColorData) => {
    Popup.custom({
      content: (this.renderDimmerPanel(color)),
      footerType: 'singleConfirm',
      confirmText: 'Confirm',
      confirmTextStyle: { color: '#fff', fontWeight: 'normal' },
      footerWrapperStyle: { marginBottom: cx(24) },
      showTitleDivider: false,
      onMaskPress: ({ close }) => close(),
      onConfirm: (_data, { close }) => {
        setTimeout(() => this.handleColorUpdate(), 500);
        close();
      },
    });
  }
  
  handleColorPress = (index: number) => {
    const { editting, selected } = this.state;

    if (editting) {
      const newSelected = [...selected];
      newSelected[index] = !newSelected[index];
      this.setState({ selected: newSelected });
    } else {
      const color = this.props.diyDatas[this.state.index].value.colors[index];
      this.handleEditColor(color);
      this.setState({
        editColor: color,
        editIndex: index,
      })
    }
  }

  handleColorsDelete = () => {
    const { index, selected } = this.state;
    const newDiyDatas = [...this.props.diyDatas]
    const colors = [...newDiyDatas[index].value.colors];

    for (let i = colors.length - 1; i >= 0; i --) {
      if (selected[i]) {
        colors.splice(i, 1);
      }
    }

    /** 不可以删除所有的颜色 */
    if (colors.length > 0) {
      newDiyDatas[index].value.colors = colors;
      lampSceneValue(newDiyDatas[index].value);
      saveCloudDiyScene(newDiyDatas);        
    } else {
      // TODO
    }

    let newSelected = [...selected];
    newSelected.fill(false);
    this.setState({
      editting: false,
      selected: newSelected,
    })
  }

  renderColorsTitle = () => {
    return (
      <View style={{ width: winWidth, flexDirection: 'row', marginTop: cx(24), justifyContent: 'space-between' }} >
        {this.renderTitle('Scene Colors')}
        <TouchableOpacity
          style={{ height: '100%', width: '20%',  alignItems: 'flex-end', marginRight: cx(24) }}
          onPress={this.handleAddColor}
        >
          <Image
            style={{ width: cx(24), height: cx(25) }}
            source={Res.arrow}
          />
        </TouchableOpacity>
      </View>
    );
  }

  renderColorItem = (color, index) => {
    const bg = color.isColour ? getColorRgba(color.h, color.s, color.b) : getWhiteRgba(color.t, color.b);
    const active = this.state.selected[index];
    return (
      <TouchableOpacity
        style={{
          width: COLOR_VIEW_SIZE, 
          height: COLOR_VIEW_SIZE,
          borderRadius: COLOR_VIEW_SIZE * 0.5,
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: '#00AD3C',
          borderWidth: active ? 1 : 0,
          marginLeft: index === 0 ? COLOR_MARGIN_H : 0,
          marginRight: index === (COLOR_CNT_MAX - 1) ? COLOR_MARGIN_H : COLOR_INTERVAL,
        }}
        onPress={() => this.handleColorPress(index)}
      >
        <View style={{ width: COLOR_ITEM_SIZE, height: COLOR_ITEM_SIZE, borderRadius: COLOR_ITEM_SIZE * 0.5, backgroundColor: bg }}/>
      </TouchableOpacity>
    );
  }

  renderOptButtons = () => {
    const { editting } = this.state;

    if (editting) {
      return (
        <View style={styles.btns_panel}>
          <TouchableOpacity style={[styles.btn, styles.btn_center]} onPress={() => this.setState({ editting: false })}>
            <TYText style={styles.btn_text_confirm}> {'Cancel'} </TYText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={this.handleColorsDelete}>
            <TYText style={styles.btn_text_delete}> {'Delete'} </TYText>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.btns_panel}>
          <TouchableOpacity style={[styles.btn, styles.btn_center]} onPress={() => this.setState({ editting: true })}>
            <TYText style={styles.btn_text_confirm}> {'Edit'} </TYText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={this.handleAddColor}>
            <TYText style={styles.btn_text_add}> {'Add'} </TYText>
          </TouchableOpacity>
        </View>
      );
    }
  }

  renderColors = () => {
    const { diyDatas } = this.props;
    const { index } = this.state;

    if (index < 0 || index >= diyDatas.length) {
      return;
    }

    let newColors = [...diyDatas[index].value.colors];
    if (newColors.length > COLOR_CNT_MAX) {
      newColors.splice(COLOR_CNT_MAX);
    }

    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: winWidth, flexDirection: 'row', marginTop: cx(20) }}>
          {newColors.map((c, i) => this.renderColorItem(c, i)) }
        </View>
        {this.renderOptButtons()}
      </View>
    );
  }

  handleSpeed = (v: number, complete: boolean) => {
    this.props.onParamsChange(complete);

    if (complete) {
      const newDiyDatas = [...this.props.diyDatas]
      newDiyDatas[this.state.index].value.interval = v;
      newDiyDatas[this.state.index].value.time = v;
  
      lampSceneValue(newDiyDatas[this.state.index].value);
      saveCloudDiyScene(newDiyDatas);  
    }
  }

  renderBlinkRate = () => {
    const v = this.props.diyDatas[this.state.index].value.time;
    return (
      <View style={{ width: winWidth - cx(48), marginHorizontal: cx(24), marginBottom: cx(40)}}>
        <TYText style={{ fontSize: cx(14), color: '#04001E', marginBottom: cx(16), marginLeft: -cx(4), marginTop: cx(24) }}> {'Frequency'} </TYText>
        <SliderSelector
          imgLeft= {Res.slider_speed}
          minValue={1}
          maxValue={100}
          value={v}
          onSlidingComplete={this.handleSpeed}
        />
      </View>
    );
  }

  renderDiyPanel = () => {
    return (
      <View style={{ paddingTop: cx(32) }}>
        {this.renderTitle('Color Flash Mode')}
        {this.renderFlashModeBase()}
        {/*this.renderFlashModeMore()*/}
        {this.renderColorsTitle()}
        {this.renderColors()}
        {this.renderBlinkRate()}
      </View>
    );
  }

  render() {
    const { index } = this.state;
    return (
      <View style={{ width: '100%' }}>
        {this.renderDiyItems()}
        {index >= 0 && this.renderDiyPanel()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  container: {
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemView:{
    width: ITEM_VIEW_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: ITEM_MARING_BOTTOM,
  },
  itemImage: {
    width: ITEM_IMAGE_SIZE - 4,
    height: ITEM_IMAGE_SIZE - 4,
    borderRadius: ITEM_IMAGE_SIZE * 0.5 - 2,
  },
  itemText: {
    marginTop: ITEM_TEXT_MARGIN_TOP,
    fontSize: ITEM_FONT_SIZE,
    color: '#020914',
  },
  itemTextActive: {
    marginTop: ITEM_TEXT_MARGIN_TOP,
    fontSize: ITEM_FONT_SIZE,
    color: '#00AD3C',
  },
  iconTouch: {
    width: ITEM_IMAGE_SIZE,
    height: ITEM_IMAGE_SIZE,
    borderRadius: ITEM_IMAGE_SIZE * 0.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconActive: {
    backgroundColor: '#00AD3C',
  },
  btns_panel: {
    width: '70%',
    flexDirection: 'row',
    marginVertical: cx(20),
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
  btn_text_add: {
    fontSize: cx(14),
    color: '#00AD3C',
  },
});

export default withTheme(SceneDiy);