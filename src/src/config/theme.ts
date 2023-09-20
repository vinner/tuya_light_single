// import { GlobalTheme } from 'tuya-panel-kit';

const fontColor = '#000';
const themeColor = '#00ad3c';

/**
 * 主题配置结构可见上述描述文件
 */
export default {
  global: {
    bgColor: '#fff',
    fontColor,
    brand: themeColor,
    themeColor,
    background: {
      '0%': '#fff',
      '100%': '#fff',
      x1: '0',
      y1: '0',
      x2: '100%',
      y2: '0',
    },
  },
  topbar: {
    color: '#fff',
    background: 'transparent',
  },
  popup: {
    cellBg: '#fff',
    titleBg: '#fff',
    lineColor: '#444444',
    titleFontColor: '#000',
    cancelFontColor: '#000',
    confirmFontColor: '#000',
    bottomBg: '#fff',
    pressColor: '#E5E5E5',
    tintColor: '#000',
    titleRadius: 0,
    list : {
      cellFontColor: '#000',
    }
  },
  dialog: {
    bg: '#fff',
    lineColor: '#505254',
    cancelFontColor: '#000',
    confirmFontColor: '#000',
    titleFontColor: '#000',
    subTitleFontColor: '#292b2d',
    pressColor: '#858585',
  },
};
