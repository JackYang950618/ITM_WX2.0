var plugin = requirePlugin("WechatSI")
var innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.onError((res) => {
  // 播放音频失败的回调
})
const formatTime = date => {
  var date = new Date(date);
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


/**
 * 时间戳转化为年 月 日 时 分 秒
 * ts: 传入时间戳
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致
*/
function tsFormatTime(timestamp, format) {

  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  let returnArr = [];

  let date = new Date(timestamp);
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()
  returnArr.push(year, month, day, hour, minute, second);
  returnArr = returnArr.map(formatNumber);
  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;

}

//页面赋值如果是null或者undefined为''
function setData(data) {
  if (data == null || data == undefined) {
    data = '';
  }
  return data;
}

/*前端显示数据字典的中文*/
function setDictionary(data) {
  var name = "";
  if (data != null && data != undefined) {
    name = data.name;
  }
  return name;
}

function playTTS(text) {
  //need to add WXAPP plug-in unit: WechatSI
  plugin.textToSpeech({
    lang: "zh_CN",
    tts: true,
    content: text,
    success: function (res) {
      log("succ tts", res.filename)
      innerAudioContext.src = res.filename;
      innerAudioContext.play()
    },
    fail: function (res) {
      log("fail tts", res)
    }
  })
}

function stopTTS() {
  innerAudioContext.stop();
}

module.exports = {
  formatTime: formatTime,
  tsFormatTime: tsFormatTime,
  setData: setData,
  setDictionary: setDictionary,
  playTTS: playTTS,
  stopTTS: stopTTS,
}
