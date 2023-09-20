import _ from 'lodash';
import React from 'react';
import {
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { TYText } from 'tuya-panel-kit';
import { Utils } from 'tuya-panel-kit';
import { showGlobalToast } from '../dimmer/dimmer-utils';

const {
  ThemeUtils: { withTheme },
} = Utils;

const { convertX: cx } = Utils.RatioUtils;

interface TabSelectorProps {
  theme?: any;
  accessibilityLabel?: string;
  style?: ViewStyle | ViewStyle[];
  tabDatas;
  tab: string;
  onChange: (value) => void;
};

interface TabSelectorStates {
  tab: string;
}

class TabSelector extends React.Component<TabSelectorProps, TabSelectorStates> {
  constructor(props: TabSelectorProps) {
    super(props);

    this.state = {
      tab: props.tabDatas[0].key,
    }
  }

  /*
  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps): void {
    if (nextProps.tab !== this.props.tab) {
      this.setState({ tab: nextProps.tab });
    }
  }
  */

  render() {
    const { style, tabDatas, tab, onChange } = this.props;
    const {  } = this.state;
    let id = tabDatas.findIndex(t => t.key === tab);
    return (
      <View style={[style, { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]} >
        {
          tabDatas.map((d, i) => {
            const active = id === i ? true : false;
            return (
              <TouchableOpacity
                style={{ justifyContent: 'center', alignItems: 'center' }}
                onPress={() => onChange(d.key)}
              >
                <TYText style={{ fontSize: cx(14), color: active ? '#00AD3C' : '#808489' }}> {d.title} </TYText>
                <View style={{ width: cx(32), height: 2, marginTop: cx(11), backgroundColor: active ? '#00AD3C': 'transparent' }}/>
              </TouchableOpacity>
            );
          })
        }
      </View>
    );
  }
}

export default withTheme(TabSelector);