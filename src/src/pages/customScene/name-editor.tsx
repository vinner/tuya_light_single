import React, { Component } from 'react';
import { View, StyleSheet, TextInput, LayoutChangeEvent, Keyboard, Animated, Easing, TouchableOpacity } from 'react-native';
import { Utils, TYSdk, IconFont } from 'tuya-panel-kit';
import Strings from '../../i18n';
import icons from '../../res/iconfont';

const { winWidth } = Utils.RatioUtils;
const EDIT_MARGIN_H = 20;

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  theme?: any;
}

interface EditorStates {
  value: string;
  layout_width: number;
}

export default class NameEditor extends Component<EditorProps, EditorStates> {
  name:string = '';
  isEditting = false;
  inputRef: TextInput;
  waveAnim = new Animated.Value(0);

  constructor(props: EditorProps) {
    super(props);
    this.state = {
      value: this.props.value,
      layout_width: 100,
    }

    this.name = this.props.value;
  };

  /* 判断默认名字是否有变化 */
  componentWillUpdate(nextProp, __) {
    this.name = nextProp.value;
    if (this.props.value != nextProp.value) {
      this.setState({
        value: nextProp.value,
      });
    }
  };

  /* 获得界面的宽度 */
  _handleLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    this.setState({layout_width: layout.width});
  };

  /* 返回回调函数 */
  handleBack = () => {
    this.props.onChange && this.props.onChange(this.props.value);
  }

  /* 名称保存回调函数 */
  handleSubmit = () => {
    Keyboard.dismiss();
    const finalName = Array.from(this.state.value).slice(0, 10).join('');
    if (finalName) {
      if (this.state.value.trim().length > 10) {
        setTimeout(() => {
          this.setState({ value: this.props.value });
          TYSdk.native.simpleTipDialog(Strings.getLang('maxSceneNameTip'), () => {});
        }, 500);
        return false;
      }
    }

    this.props.onChange && this.props.onChange(finalName);
    return true;
  }

  /* 渲染顶部控制栏 */
  handleEdit = (editable: boolean) => {
    if (editable) {
      this.inputRef.setNativeProps({ editable: true });
      this.inputRef.focus();
    } else {
      this.inputRef.setNativeProps({ editable: false });
    }
  }

  handleEditComplete = () => {
    this.handleEdit(false);
    this.handleSubmit();
  }

  render() {
    const {
      value,
    } = this.state;

    //TYSdk.native.simpleTipDialog('render: ' + value, () => {});
    return (
      <View
          accessibilityLabel="HomeScene_Custom_Editor"
          style={{ width: '100%' }}
        >
          <View style={[styles.container]} onLayout={this._handleLayout}>
            <TextInput
              ref={(ref: TextInput) => {
                this.inputRef = ref;
              }}
              style={[styles.input, { width: this.state.layout_width - EDIT_MARGIN_H * 3 - 30 }]}
              underlineColorAndroid='transparent'
              placeholder='Scene Name'
              placeholderTextColor='#000'
              autoCapitalize='none'
              keyboardType='default'
              returnKeyType='done'
              onChangeText={(text) => this.setState({ value: text})}//(this.name = text)}
              onEndEditing={this.handleEditComplete}
              value={value}
              editable={false}
            />
            <TouchableOpacity
              style={[styles.edit, {}]}
              activeOpacity={0.9}
              onPress={() => this.handleEdit(true)}
            >
                <IconFont d={icons.edit2} size={30} fill={'#000'} stroke={'#000'} />
            </TouchableOpacity>
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  input: {
    alignSelf: 'stretch',
    color: '#000',
    fontSize: 28,
    marginHorizontal: EDIT_MARGIN_H,
  },
  topbarTitle: {
  },
  edit: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: EDIT_MARGIN_H,
  }
});
