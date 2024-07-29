// 判断是否是PC端
const isPc = !/Android|iPhone|SymbianOS|Windows Phone|iPad|iPod/i.test(navigator.userAgent)
// 设置基础根文件大小
const baseSize = 16
// rem 函数
function setRem() {
  const clientWidth = document.documentElement.clientWidth
  // 设计稿一般都是以375的宽度
  let scale = clientWidth / (baseSize * 10)
  // 设置页面根节点字体大小（“Math.min(scale, 2)” 指最高放大比例为2，可根据实际业务需求调整）
  let enlarge = 1.5
  if (isPc) {
    enlarge = 1
    scale = clientWidth / 1920 // 980 是PC端设计稿的宽度
  }
  document.documentElement.style.fontSize = baseSize * Math.min(scale, enlarge) + 'px'
}
// 调用方法
setRem()

// 监听窗口在变化时重新设置跟文件大小
window.onresize = function () {
  setRem()
}

export default {}
