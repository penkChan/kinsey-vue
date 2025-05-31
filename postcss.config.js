export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    'postcss-px-to-viewport': {
      viewportWidth: 1920, // 设计稿的宽度
      unitPrecision: 5, // 转换精度
      viewportUnit: 'vw', // 转换成的单位
      selectorBlackList: ['ignore', 'no-vw'], // 不转换的类名
      minPixelValue: 1, // 小于或等于1px不转换
      mediaQuery: true, // 是否在媒体查询中转换
      exclude: [/node_modules/], // 排除某些文件夹
    },
  },
}
