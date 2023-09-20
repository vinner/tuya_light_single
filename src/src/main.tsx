import React from 'react';
import { StatusBar } from 'react-native';
import { Dispatch } from 'redux';
import {
  // TYSdk,
  NavigatorLayout,
  NavigationOptions,
  DeprecatedNavigator,
  DeprecatedNavigatorRoute,
} from 'tuya-panel-kit';
import composeLayout from './composeLayout';
import { store, ReduxState } from './models';
import Home from './pages/home';

console.disableYellowBox = true;

type Props = ReduxState & { dispatch: Dispatch };

// 慎用，生成环境上不要开启，console 打印层次过深会导致性能问题
// if (__DEV__) {
//   console.log('TYSdk :', TYSdk);
// }

interface MainState {
  gestureEnable: boolean;
  modalVisible: boolean;
}

class MainLayout extends NavigatorLayout<Props, MainState> {
  enableGesture: boolean = true;

  constructor(props: Props) {
    super(props);
    const defaultState: MainState = {
      gestureEnable: true,
      modalVisible: false,
    };
    this.state = defaultState;
  }

  /**
   *
   * @desc hookRoute 可以在这里针对特定路由做一些控制处理，
   * 具体可控制的参数可参考 NavigationOptions 类型描述
   */
  hookRoute(route: DeprecatedNavigatorRoute): NavigationOptions {
    const routeProps: NavigationOptions = {hideTopbar: true, enablePopGesture: this.state.gestureEnable};
    switch (route.id) {
      case 'main':
        break;
      default:
        break;
    }

    return {
      ...routeProps,
      ...route,
      renderStatusBar: () => <StatusBar translucent={true} backgroundColor={'transparent'} barStyle="dark-content" />,
    };
  }

  /**
   * @desc
   * 在此您可以通过 route 中的 ID 来判断使用哪个页面组件
   * 如果有额外的 props 需要传递给页面组件的，可以在此进行传递
   * 注意：route 参数来自于 TYSdk.Navigator.push，
   * 如果调用了 TYSdk.Navigator.push({ id: 'setting', title: 'Setting Page' });
   * 则会在推入路由栈时 hookRoute 和 renderScene 这个周期里会接受到 route = { id: 'setting', title: 'Setting Page' }，
   * 但要注意的是，首页的 route 参数是固定的，为 { 'id': 'main', 'initialRoute': true }
   *
   * @param {Object} route - route对象
   * @param {object} navigator - Navigator对象，具体使用方法可参考https://facebook.github.io/react-native/docs/0.43/navigator.html
   */
  renderScene(route: DeprecatedNavigatorRoute, navigator: DeprecatedNavigator) {
    let component;
    switch (route.id) {
      case 'main':
        component = <Home onGesture={this._handelGestureEanble}/>;
        break;
      default:
        break;
    }

    return component;
  }

  _handelGestureEanble = (enable: boolean) => {
    // 开启这里以后会导致进入或退出编辑界面时出现多次渲染的问题，导致动画卡顿，暂时先注释掉该处
    //this.enableGesture = enable;
    //if (this.state.gestureEnable != enable) {
    //  this.setState({gestureEnable: enable});
    //}
  }
}

export default composeLayout(store, MainLayout);
