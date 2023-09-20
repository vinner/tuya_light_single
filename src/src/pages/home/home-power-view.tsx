import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { Utils, TYSdk, DevInfo } from 'tuya-panel-kit';
import _ from 'lodash';
import { useSelector } from '../../models';
import { actions } from '../../models/modules/common';
import TopBar from '../../components/topbar';

const { convertX: cx, } = Utils.RatioUtils;
const { withTheme } = Utils.ThemeUtils;

interface HomePowerViewProps {
  theme?: any;
  onGesture;
}

const HomePowerView: React.FC<HomePowerViewProps> = ({
  theme: {
    global: { themeColor, fontColor },
  },
  onGesture
}) => {
  const sceneEditing = useSelector(state => state.uiState['sceneEditing']) || false;
  const [devName, setDevName] = useState(' ');
  const dispatch = useDispatch();

  useEffect(() => {
    /* 获取设备的名称 */
    TYSdk.device.getDeviceInfo().then((data: DevInfo) => {
      setDevName(data.name);
      TYSdk.native.simpleTipDialog('dev: ' + JSON.stringify(data), () => {})
    })
    .catch(error => {
    });
  });

  /* 退出场景编辑 */
  const exitEditing = useCallback(() => {
    dispatch(actions.updateUi({ sceneEditing: false }));
  }, []);

  /* 渲染顶部控制栏 */
  const renderTopBar = () => {
    onGesture(!sceneEditing);
    return (
      <TopBar
        title={devName}
        iconColor={fontColor}
        textStyle={styles.text}
        backhandle={sceneEditing ? exitEditing : undefined}
      />
    );
  }

  return (
    <View style={styles.container}>
        {renderTopBar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },

  text: {
    backgroundColor: 'transparent',
    fontSize: cx(20),
    color: '#000',
    fontWeight: 'bold',
  },
});

export default withTheme(HomePowerView);
