/* eslint-disable @typescript-eslint/no-empty-function */
import _ from 'lodash';
import color from 'color';
import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';
import { Utils, TYText } from 'tuya-panel-kit';
import SwitchListItem from '../SwitchListItem';
import Res from '../../res';
import { transTime2Value24, transTime2Str12, transTime2Str12Ampm } from '../../utils';

const { convertX: cx, convertY: cy, width: winWidth } = Utils.RatioUtils;

interface ItemState {
  delete_show: boolean;
}

export interface SwitchItemData {
  startTime: string;
  endTime: string;
  loops: string;
  power: boolean;
  startStatus: boolean;
  endStatus: boolean;
}

interface SwitchListProps {
  accessibilityLabel: string;
  data: SwitchItemData[];
  type: string;
  onValueChange: (index: number, value: boolean) => void;
  onPress: (index: number) => void;
  onDelete: (index: number) => void;
  onMoveStart: () => void;
  onMoveComplete: () => void;
  theme?: any;
}

interface SwitchListState {
  itemStates: ItemState[];
}

export default class SwitchList extends Component<SwitchListProps, SwitchListState> {

  itemStates: ItemState[] = [];

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    accessibilityLabel: 'SwitchListItem',
    data: [],
    type: 'group',
    onValueChange: (_index: number, _v: boolean) => {},
    onPress: (_index: number) => {},
    onDelete: (_index: number) => {},
    onMoveStart: () => {},
    onMoveComplete: () => {},
    theme: {
      fontColor: '#fff',
    },
  };

  constructor(props: SwitchListProps) {
    super(props);

    //TYSdk.native.simpleTipDialog("List:" + this.props.data.length + ',' + this.itemStates.length, () => {});
  }

  setInstance = (name: string) => (ref: TYText) => {
    this[`_ref_${name}`] = ref;
  };

  getInstance = (name: string) => this[`_ref_${name}`];

  reset_item_state() {
    this.itemStates.map(item => item.delete_show = false);
    this.setState({});
  }

  _handleItemState(index: number, delete_show: boolean) {
    this.itemStates[index] = {
      delete_show: delete_show,
    }
    this.setState({});
  }

  _handleItemDelete(index: number) {
    this.itemStates.splice(index, 1);
    this.props.onDelete(index);
    this.setState({});
  }

  _handleItemPress(index: number) {
    this.props.onPress(index);
  }

  /* 由定时循环规则转换成显示文字 */
  transLoopsToStr = (loops: string) => {
    const week = loops.split('');
    const weekStr = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fir.', 'Sat.'];
    const s = weekStr.filter((_w, index) => week[index] === '1');

    if (s.length === 0) {
      return 'No Loop';
    }

    if (s.length >= 7) {
      return 'Every Day';
    }

    return s.join('');
  }

  checkSecondDay = (startTime: string, endTime: string) => {
    return transTime2Value24(startTime)  > transTime2Value24(endTime);
  }

  renderContentView = (t: SwitchItemData) => {
    if (this.props.type === 'group') {
      const second = this.checkSecondDay(t.startTime, t.endTime);
      const title1 = `${t.startTime} - ${t.endTime}`;
      const title2 = this.transLoopsToStr(t.loops);

      return (
        <View style={{flex:1, flexDirection: 'column'}}>
          <View style={{ position: 'absolute', top: -cx(13),left: cx(71) }}>
            { second && <Image style={{ width: cx(12), height: cx(12) }} source={Res.timer_sec} />}
          </View>
          <TYText style={styles.timer_item_title1}> {title1} </TYText>
          <TYText style={[styles.timer_item_title2, { marginTop: cx(5) }]}> {title2} </TYText>
        </View>
      );
    } else {
      const time = transTime2Value24(t.startTime);
      const ampm = transTime2Str12Ampm(time);
      const timeStr = transTime2Str12(time);
      return (
        <View style={{flex: 1, flexDirection: 'column'}}>
        <View style={{ width: '100%', flexDirection: 'row' }}>
          <View style={{ width: '50%' }}>
            <TYText style={styles.timer_item_title2}> {'Time'} </TYText>
            <View style={{ flexDirection:'row', alignItems: 'flex-end', marginTop: cx(5) }}>
              <TYText style={styles.timer_item_title1}> {`${timeStr.hour}:${timeStr.min}`} </TYText>
              <TYText style={styles.timer_item_title3}> {ampm} </TYText>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <TYText style={styles.timer_item_title2}> {'State'} </TYText>
            <TYText style={[styles.timer_item_title1, { marginTop: cx(5) }]}> {t.power ? 'ON' : 'OFF'} </TYText>
          </View>
        </View>
        </View>
      );
    }
  }

  render() {
    const {
      data,
      onValueChange,
      onPress,
      onMoveStart,
      onMoveComplete,
    } = this.props;

    let res = '';
    this.itemStates.map(item => {res = res +',' + item.delete_show});

    return (
      <View style={{ flex:1, alignSelf: 'stretch', }}>
        {data.map((t, index) => {
            const deleteShow = this.itemStates[index] ?
                              this.itemStates[index].delete_show ?
                              this.itemStates[index].delete_show : false : false;

            return (
              <View>
                <SwitchListItem
                  key={`${index}`}
                  style={styles.timer_item}
                  value={t.startStatus || t.endStatus}
                  deleteShow={deleteShow}
                  onValueChange={value => {onValueChange(index, value)}}
                  onPress={() =>onPress(index)}
                  onDeleteShow={value => {this._handleItemState(index, value)}}
                  onDelete={() => this._handleItemDelete(index)}
                  onMoveStart={onMoveStart}
                  onMoveComplete={onMoveComplete}
                  renderContentView={this.renderContentView(t)}
                />
                <View style={{width: winWidth - cx(44), height: 1, marginHorizontal: cx(22), backgroundColor: '#f0edf1' }}/>
              </View>
            );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },

  timer_item: {
    backgroundColor:'transparent',
    marginHorizontal: cx(22),
    paddingVertical: cy(20),
  },

  timer_item_title1: {
    color:'#04001E',
    fontSize: cx(18),
    fontWeight: '400',
    marginLeft: cx(3),
  },

  timer_item_title2: {
    color: color('#04001E').alpha(0.6).rgbString(),
    fontSize: cx(12),
    marginLeft: cx(5),
  },

  timer_item_title3: {
    color:'#04001E',
    fontSize: cx(12),
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      {
        translateX: 0,
      },
      {
        translateY: 0,
      },
    ],
  },

  del: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff0000',
    marginLeft: 0,
    transform: [
      {
        translateX: 0,
      },
      {
        translateY: 0,
      },
    ],
  },

});
