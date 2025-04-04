import { Dimensions } from 'react-native';
import { normalize } from '../utils/normalize';

const { width, height } = Dimensions.get('window');

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  tabBarHeight: normalize(75), // The height of our tab bar
  contentPadding: normalize(16), // Standard content padding
  contentBottomPadding: normalize(95), // Bottom padding to clear the tab bar with extra space for separation
  tabBarTopInset: normalize(5), // Space between content and tab bar for visual separation
}; 