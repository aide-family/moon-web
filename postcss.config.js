export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 16, // 基准值，对应 1rem = 16px
      // unitPrecision: 5, // rem 的小数位数
      // propList: ['*'], // 需要转换的属性，* 表示所有属性
      // selectorBlackList: [], // 忽略的选择器
      // // selectorBlackList: ['.ant-'],
      // replace: true, // 是否替换而不是添加
      // mediaQuery: false, // 是否在媒体查询中转换 px
      // minPixelValue: 0, // 小于这个值的 px 不转换
      // exclude: /node_modules/i, // 排除 node_modules，因为 Ant Design 的样式需要特殊处理
    },
  },
}
