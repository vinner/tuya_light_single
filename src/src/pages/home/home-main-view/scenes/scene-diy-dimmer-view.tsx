import _, {  } from 'lodash';
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  PanResponderInstance,
} from 'react-native';
import { Utils, TYText, } from 'tuya-panel-kit';
import { EditColorData } from '../dimmer/dimmer-panel';
import DimmerPanelUnits from '../dimmer/dimmer-panel-units';
import { COLOR_DATA } from '../dimmer/dimmer-utils';
import { MY_COLORS_DATA } from '../dimmer/my-colors';

const {
  ThemeUtils: { withTheme },
} = Utils;

const { convertX: cx, winWidth, winHeight } = Utils.RatioUtils;

interface SceneDiyDimmerProps {
  theme?: any;
  accessibilityLabel?: string;
  color: EditColorData
  singleColors: COLOR_DATA[];
  groupColors: MY_COLORS_DATA;
  lightLength: number;
  onColorChange: (data: EditColorData) => void;
};

interface SceneDiyDimmerStates {
  editColor: EditColorData;
}

class SceneDiyDimmer extends React.Component<SceneDiyDimmerProps, SceneDiyDimmerStates> {
  scrollViewRef: ScrollView;
  _panResponder: PanResponderInstance;

  constructor(props: SceneDiyDimmerProps) {
    const { isColour, h, s, t, b } = props.color;
    super(props);

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onShouldBlockNativeResponder: () => false,
    });

    this.state = {
      editColor: { isColour, h, s, t, b },
    }
  }

  handleColorChange = (data: EditColorData, complete: boolean) => {
    // @ts-ignore
    this.scrollViewRef.setNativeProps({ scrollEnabled: complete });
    this.setState({ editColor: data });
    this.props.onColorChange(data);
  }

  handleColorSwitch = (isColour: boolean) => {
    const { h, s, t, b } = this.state.editColor;
    const newEditColor = {isColour, h, s, t, b};
    this.setState({ editColor: newEditColor });
    this.props.onColorChange(newEditColor);
  }

  handleMyColorSelected = (d: MY_COLORS_DATA, single: boolean) => {
    if (d.data.length <= 0 || d.data.length !== d.stops.length || !single) {
      return;
    }

    this.setState({ editColor: d.data[0] });
    this.props.onColorChange(d.data[0]);
  }

  renderDimmerPanelUnits = () => {
    const { editColor } = this.state;
    return (
      <ScrollView
        ref={(ref: ScrollView) => {
          this.scrollViewRef = ref;
        }}
        accessibilityLabel="Diy_ScrollView"
        style={{ width: winWidth, height: winHeight * 0.65 }}
        scrollEnabled={true}
        >
        <View
          pointerEvents='box-none'
          {...this._panResponder.panHandlers}  
        >
        <DimmerPanelUnits
          isColour={editColor.isColour}
          h={editColor.h}
          s={editColor.s}
          t={editColor.t}
          b={editColor.b}
          sLimit={false}
          singleColors={this.props.singleColors}
          groupColors={this.props.groupColors}
          lightLength={this.props.lightLength}
          onlySelected={true}
          onChange={this.handleColorChange}
          onSwitch={this.handleColorSwitch}
          onMyColorSelected={this.handleMyColorSelected}
          onMyColorEditting={() => {}}
          onAddColor={() => {}}
        />
        </View>
      </ScrollView>
    );
  }

  renderConfirmBtm = () => {
    return (
      <View style={styles.confirmView}>
        <TouchableOpacity style={styles.confirmBtn}  onPress={() => close()}>
          <TYText style={styles.confirmText}> {'Confirm'} </TYText>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View>
        {this.renderDimmerPanelUnits()}
        {/*this.renderConfirmBtm()*/}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  editor: {
    width: '100%',
    height: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#fff',
  },
  confirmView: {
    width: winWidth,
    height: cx(54),
    paddingHorizontal: cx(24),
    marginBottom: cx(34),
    marginTop: cx(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtn: {
    width: winWidth - cx(48),
    height: cx(54),
    backgroundColor: '#04001E',
    borderRadius: cx(27),
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: cx(14),
    color: '#FFFFFF',
  },
});

export default withTheme(SceneDiyDimmer);