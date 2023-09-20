import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
import { useSelector } from '../../models';
import HomeMainView from './home-main-view';
import DpCodes from '../../config/dpCodes';
import { WORKMODE } from '../../config';

const { convertX: cx } = Utils.RatioUtils;
const { workModeCode, sceneCode: sceneValueCode } = DpCodes;
const ELST_TAB = 'else';

const parseDefalutTabSelected = (workMode: string, _value: string) => {
  if ([WORKMODE.COLOUR, WORKMODE.WHITE].includes(workMode)) {
    return WORKMODE.COLOUR_WHITE;
  } else if (WORKMODE.MUSIC === workMode) {
    return WORKMODE.MUSIC;
  } else {
    return WORKMODE.SCENE;
  }
}

interface HomeProps {
  onGesture;
}

const Home: React.FC<HomeProps> = ({
  onGesture
}) => {
  const workMode = useSelector(state => state.dpState[workModeCode]) as string || WORKMODE.WHITE;
  const sceneValue = useSelector(state => state.dpState[sceneValueCode]) as string || '';
  const [tabSelected, setTabSelected] = useState(parseDefalutTabSelected(workMode, sceneValue));

  //TYSdk.native.simpleTipDialog('v: ' + sceneValue + ', ' + tabSelected, () => {});
  const _handleTabComplete = useCallback((tab: string) => {
    if (((tabSelected !== ELST_TAB) && tab === 'else') ||
        ((tabSelected === ELST_TAB) && tab !== 'else') ||
        (tabSelected !== tab)) {
      setTabSelected(tab);
    }
  }, [tabSelected]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.content}>
        <HomeMainView
          onComplete={_handleTabComplete}
          onGesture={onGesture}
          tab={tabSelected}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: cx(200),
    height: cx(200),
    opacity: 0.8,
  },
});

export default Home;
