import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import withSkeleton from './withSkeleton';
import { StyledTimerPicker } from './styled';
import { Utils, TimerPicker, TYText } from 'tuya-panel-kit';

const { convertX: cx } = Utils.RatioUtils;

class TimerPickerPopup extends React.Component {
  static propTypes = {
    ...TimerPicker.propTypes,
    /**
     * 按钮值
     */
    switchValue: PropTypes.bool.isRequired,
    /**
     * 时间段开始文案
     */
    startTitle: PropTypes.string,
    /**
     * 时间段结束文案
     */
    endTitle: PropTypes.string,
    /**
     * 数据更改回调
     */
    _onDataChange: PropTypes.func,
  };

  static defaultProps = {
    _onDataChange: () => {},
    startTitle: null,
    endTitle: null,
  };

  constructor(props) {
    super(props);
    props._onDataChange({ startTime: props.startTime, endTime: props.endTime });
  }

  handleTimerChange = (startTime, endTime) => {
    const { onTimerChange, _onDataChange } = this.props;
    onTimerChange && onTimerChange(startTime, endTime);
    _onDataChange && _onDataChange({ startTime, endTime });
  };

  render() {
    const { style, switchValue, startTitle, endTitle, ...props } = this.props;
    return (
      <View>
        <TYText
          style={{
            fontSize: cx(24),
            color: '#000',
            fontWeight: '400',
            width: '100%',
            marginTop: cx(24),
            marginLeft: cx(24),
          }}>
            {'Select time'}
        </TYText>

        <StyledTimerPicker
          style={StyleSheet.flatten([!switchValue && { opacity: 0.6 }, style])}
          disabled={!switchValue}
          onTimerChange={this.handleTimerChange}
          startTitle={startTitle}
          endTitle={endTitle}
          {...props}
        />
      </View>

    );
  }
}

export const TimerPickerModal = withSkeleton(TimerPickerPopup, true);

export default withSkeleton(TimerPickerPopup);
