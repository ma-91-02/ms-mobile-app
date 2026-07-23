const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

/**
 * معالجة علّة في حزمة `react-async-hook`.
 *
 * حقل `module` في ملف package.json الخاص بها يشير إلى
 * `react-async-hook.esm.js` بينما الملف موجود فعليًا في `dist/`.
 * Metro يُفضّل `module` على `main` فيفشل الحل ويتعطّل بناء الويب.
 *
 * (تصل عبر: react-native-phone-number-input → react-native-country-picker-modal)
 *
 * المعالجة مقصورة على هذه الحزمة وحدها: البديل الشائع هو حذف 'module'
 * من `resolverMainFields` كليًا، وهو يغيّر طريقة حل كل الحزم بلا داعٍ.
 */
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-async-hook') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'node_modules/react-async-hook/dist/index.js'),
    };
  }

  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
