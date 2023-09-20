/* eslint-disable indent */
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet, View, ViewPropTypes, TouchableOpacity } from 'react-native';
import Gesture from './gesture';
import Popup from '../popup';
import icons from '../../res/iconfont';
import { TYSdk, TYText, Utils, GlobalToast } from 'tuya-panel-kit';
import { PureComponent } from 'react';
import { transTime2Str12, transTime2Str12Ampm } from '../../utils';

const { convertX: cx, width: winWidth } = Utils.RatioUtils;

export default class Timer extends PureComponent {
  static propTypes = {
    ...PureComponent.propTypes,
    /**
     * 最大具体值
     */
    maxValue: PropTypes.number,
    /**
     * 最小具体值
     */
    minValue: PropTypes.number,
    /**
     * 值改变的回调
     * @param {number} minValue - 最小具体值
     * @param {number} maxValue - 最大具体值
     */
     onValueChange: PropTypes.func,
  };

  static defaultProps = {
    ...PureComponent.defaultProps,
    maxValue: 25,
    minValue: 0,
    onValueChange() {},
  };

  constructor(props) {
    super(props);
  }

  updateTime = (v, start) => {
    const { minValue, maxValue, onValueChange } = this.props;
    const min = Math.floor(minValue);
    const max = Math.floor(maxValue);

    if (start) {
      if (v === max) {
        GlobalToast.show({
          text: 'Should not the same as close time!',
          d: icons.error,
          show: true,
          onFinish: GlobalToast.hide,
        });
        return;
      }

      onValueChange(v, maxValue);
    } else {
      if (v === min) {
        GlobalToast.show({
          text: 'Should not the same as open time!',
          d: icons.error,
          show: true,
          onFinish: GlobalToast.hide,
        });
        return;
      }
      onValueChange(minValue, v);
    }
  }

  handleTimeSelect = (v, start) => () => {
    Popup.timerPicker({
      title: 'Select time',
      confirmText: 'Confirm',
      startTime: v,
      footerType: 'singleConfirm',
      confirmTextStyle: { color: '#fff', fontWeight: 'normal' },
      footerWrapperStyle: { marginBottom: cx(24) },
      singlePicker: true,
      is12Hours: true,
      symbol: false,
      prefixPosition: 'left',
      showTitleDivider: false,
      onConfirm: ({ startTime }, { close }) => {
        this.updateTime(startTime, start);
        close();
      },
    });
  }

  renderStartEndTime = () => {
    const { minValue, maxValue } = this.props;
    const min = Math.floor(minValue);
    const max = Math.floor(maxValue);
    const minTime = transTime2Str12(min);
    const maxTime = transTime2Str12(max);

    return (
      <View
        style={{
          width: '100%',
          justifyContent: 'space-evenly',
          flexDirection: 'row',
        }}
      >
        <TouchableOpacity style={styles.timeView} onPress={this.handleTimeSelect(min, true)}>
          <View style={[styles.timeEntry]}>
            <TYText style={[styles.timeStr, styles.timeHour]}> {minTime.hour} </TYText>
            <TYText style={styles.timeStr}> {':'} </TYText>
            <TYText style={[styles.timeStr, styles.timeMin]}> {minTime.min} </TYText>
            <TYText style={styles.ampm}> {transTime2Str12Ampm(min)} </TYText>
          </View>
          <TYText style={[styles.daystr]}> {'Today'} </TYText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.timeView} onPress={this.handleTimeSelect(max, false)}>
          <View style={styles.timeEntry}>
            <TYText style={[styles.timeStr, styles.timeHour]}> {maxTime.hour} </TYText>
            <TYText style={styles.timeStr}> {':'} </TYText>
            <TYText style={[styles.timeStr, styles.timeMin]}> {maxTime.min} </TYText>
            <TYText style={[styles.ampm]}> {transTime2Str12Ampm(max)} </TYText>
          </View>
          <TYText style={[styles.daystr]}> {max > min ? 'Today' : 'Tomorrow'} </TYText>
        </TouchableOpacity>
    </View>
    );
  }

  render() {
    return (
      <View>
        {this.renderStartEndTime()}
      </View>
    );
  }
}

const styles = {
  timeView: {
    backgroundColor: '#fff',
    padding: 15,
    borderWidth: 0.5,
    borderRadius: cx(36),
    borderColor: '#DADADA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeEntry: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  ampm: {
    width: 20,
    fontSize: cx(12),
    color: '#04001E',
  },
  daystr: {
    fontSize: cx(12),
    color: '#767485',
    textAlign: 'center',
  },
  timeStr : {
    fontSize: cx(24),
    color: '#04001E',
    textAlign: 'right',
    fontWeight: '400',
  },
  timeHour : {
    width: cx(40),
    textAlign: 'right',
  },
  timeMin : {
    width: cx(40),
    textAlign: 'left',
  },
};
