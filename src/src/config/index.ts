import theme from './theme';
import dpCodes from './dpCodes';
import { Utils } from 'tuya-panel-kit';

const { convertX: cx, convertY: cy, winWidth } = Utils.RatioUtils;

const WHITEPARAM = {
  TEMP_MIN: 140,
  TEMP_MAX: 700,
  KELVIN_MIN: 2000,
  KELVIN_MAX: 7000,
}

const LIGHT_CNT_PRELINE = 5;
const LIGHT_LAYOUT_MARGIN_H = cx(40);
const LIGHT_CHECK_HEIGHT = cx(32);
const LIGHT_BRIGHT_HEIGHT = 30;
const LIGHT_BOTTOM_HEIGHT = 10;
const LIGHT_ITEM_WIDTH = (winWidth - LIGHT_LAYOUT_MARGIN_H * 2) / LIGHT_CNT_PRELINE;
const LIGHT_ITEM_HEIGHT_BASE = LIGHT_ITEM_WIDTH * 0.774;
const LIGHT_ITEM_HEIGHT = LIGHT_ITEM_HEIGHT_BASE + LIGHT_BRIGHT_HEIGHT + LIGHT_BOTTOM_HEIGHT + LIGHT_CHECK_HEIGHT;
const LIGHT_COLOR_OFFSET_X = LIGHT_ITEM_WIDTH * 0.2;
const LIGHT_COLOR_OFFSET_Y = LIGHT_CHECK_HEIGHT + LIGHT_ITEM_HEIGHT_BASE * 0.5;
const LIGHT_COLOR_WIDTH = LIGHT_ITEM_WIDTH * 0.6;
const LIGHT_COLOR_HEIGHT = LIGHT_ITEM_HEIGHT_BASE * 0.5 - 1;


const LightLayoutParams = {
  itemWidth: LIGHT_ITEM_WIDTH,
  itemHeight: LIGHT_ITEM_HEIGHT,
  itemCntPreLine: LIGHT_CNT_PRELINE,
  itemColorOffsetX: LIGHT_COLOR_OFFSET_X,
  itemColorOffsetY: LIGHT_COLOR_OFFSET_Y,
  itemColorWidth: LIGHT_COLOR_WIDTH,
  itemColorHeight: LIGHT_COLOR_HEIGHT,
  checkHeight: LIGHT_CHECK_HEIGHT,
  brihtHeight: LIGHT_BRIGHT_HEIGHT,
  bottomHeight: LIGHT_BOTTOM_HEIGHT,
};

const WORKMODE = {
  WHITE: 'white',
  COLOUR: 'colour',
  COLOUR_WHITE: 'colour_white',
  SCENE: 'scene',
  MUSIC: 'music',
};

export { dpCodes, theme, WORKMODE, WHITEPARAM, LightLayoutParams, };
