const util = require("../../../utils/util.js");
const myaudio = wx.createInnerAudioContext();
const app = getApp();
var hostName = app.data.hostName
var arrayList = [];
var tempFilePaths = [];
var totalPath = [];
var mp3Url = null
var filePathView = '';
var audio = '';
var indexSub = '';
var plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()
const recorderManager = wx.getRecorderManager()
// const recorderManager = wx.getRecordRecognitionManager()
const date = new Date();
const years = [];
const months = [];
const days = [];
const hours = [];
const minutes = [];
//获取年
for (let i = 2019; i <= date.getFullYear() + 100; i++) {
  years.push("" + i);
}
//获取月份
for (let i = 1 ; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months.push("" + i);
}
//获取日期
for (let i = 1 ; i <= 31; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  days.push("" + i);
}
//获取小时
for (let i = 0; i < 24; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  hours.push("" + i);
}
//获取分钟W
for (let i = 0; i < 60; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  minutes.push("" + i);
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    index: null,
    picker: [],
    pickerInfo: '请选择故障类型',
    time: '请选择时间',
    imgList: [],
    src: '',
    workTitle: '',
    userIn: '',
    modalName: null,
    textareaAValue: '',
    multiArray: [years, months, days, hours, minutes],
    multiIndex: [0, date.getMonth(), date.getDate() - 1, date.getHours(), date.getMinutes()],
    choose_year: '',
    allValue: '',
    ifTrue: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function () {
      //识别语音
      this.initRecord();
      var that = this
      wx.request({
        url: hostName+'getFaultTypeList',
        method: 'POST',
        header: {
          // 设置参数内容类型为json
          "Content-Type": 'application/x-www-form-urlencoded'
        },
        dataType: 'json',//该语句会将服务器端的数据自动转为string类型 
        success: function (res) {
          for (var i = 0; i < res.data.data.length; i++) {
            var obj = {}
            obj.id = res.data.data[i].id
            obj.name = res.data.data[i].name
            arrayList.push(obj)
          }
          that.setData({
            picker: arrayList
          })
          console.log(arrayList);
        },
        fail: function (res) {
          console.log("请重试！");
        }
      })
    },
    //识别语音 -- 初始化
    initRecord: function () {
      const that = this;
      // 有新的识别内容返回，则会调用此事件
      manager.onRecognize = function (res) {
        console.log(res)
      }
      // 正常开始录音识别时会调用此事件
      manager.onStart = function (res) {
        console.log("成功开始录音识别", res)
      }
      // 识别错误事件
      manager.onError = function (res) {
        console.error("error msg", res)
      }
      //识别结束事件
      manager.onStop = function (res) {
        console.log('..............结束录音')
        console.log('录音临时文件地址 -->' + res.tempFilePath);
        console.log('录音总时长 -->' + res.duration + 'ms');
        console.log('文件大小 --> ' + res.fileSize + 'B');
        console.log('语音内容 --> ' + res.result);
        if (res.result == '') {
          wx.showModal({
            title: '提示',
            content: '听不清楚，请重新说一遍！',
            showCancel: false,
            success: function (res) { }
          })
          return;
        }
        var text = res.result;
        var text2 = res.result.substring(0,10)
        mp3Url = res.tempFilePath
        that.setData({
          textareaAValue: text,
          src: res.tempFilePath,
          workTitle: text2
        })
      }
    }, 
    //表单提交按钮 
    formSubmit: function (e) {
      var that = this
      var repTime = that.data.time.replace(/-/g, '/');
      if (that.data.workTitle === '') { 
        wx.showToast({
          title: '标题必填',
          image: '../../../images/warning.png',
          duration: 1000,
          mask: true
        })
      } else if (that.data.textareaAValue === '') {
        wx.showToast({
          title: '已转文字必填',
          image: '../../../images/warning.png',
          duration: 1000,
          mask: true
        })
      } else if (that.data.ifTrue == 0) {
        wx.showToast({
          title: '期望时间必填',
          image: '../../../images/warning.png',
          duration: 1000,
          mask: true
        })
      } else if (that.data.index == null) {
        wx.showToast({
          title: '故障类型必填',
          image: '../../../images/warning.png',
          duration: 1000,
          mask: true
        }) 
      } else if (Date.parse(repTime) < Date.parse(date)) {
        wx.showToast({
          title: '小于当前日期',
          image: '../../../images/warning.png',
          duration: 1000,
          mask: true
        })
        that.setData({
          time: '请选择时间',
          ifTrue: 0
        })
      } else {
        that.setData({
          userIn: wx.getStorageSync('getUserByPhone')
        })
        console.log('userIn', that.data.userIn)
        e.detail.value.userIn = JSON.stringify(that.data.userIn)
        e.detail.value.expectedTime = that.data.time
        e.detail.value.faultType = that.data.picker[e.detail.value.faultType].id
        console.log('form发生了submit事件，携带数据为：', e.detail.value)
        wx.request({
          url: hostName+'addInvoiceWx',
          data: {
            workTitle: e.detail.value.workTitle,    //工单标题  
            workContent: e.detail.value.workContent,
            // audioBase: e.detail.value.workTitle,
            expectedTime: e.detail.value.expectedTime,
            faultType: e.detail.value.faultType,
            userIn: e.detail.value.userIn,
            //'application/json;charset=utf-8'   'application/x-www-form-urlencoded'
          },
          header: {
            "Content-Type": 'application/x-www-form-urlencoded'
          },
          method: "POST",
          dataType: 'json',
          success: function (res) {
            var workOrderId = res.data.workOrderId
            var fileName = ''
            totalPath.push(mp3Url)
            console.log('totalPath', totalPath)
            for (var i = 0; i < totalPath.length; i++) {
              wx.uploadFile({
                url: hostName+'uploadFromWx', //仅为示例，非真实的接口地址
                filePath: totalPath[i],
                name: "file",
                header: {
                  "Content-Type": "multipart/form-data"
                },
                formData: {
                  "user": "test",
                },
                success: function (res) {
                  console.log("urlArray", res.data)
                  var type = ''
                  fileName = res.data.split(".Split.")[0]
                  //do something
                  if (fileName.split(".")[1] == "wav") {
                    type = 1
                  } else {
                    type = 0
                  }
                  var workOrderFile = {
                    workOrderId: workOrderId,
                    fileUrl: fileName,
                    fileType: 0,
                    // createTime: util.tsFormatTime(new Date(), 'Y-M-D h:m:s'),
                    // modifyTime: util.tsFormatTime(new Date(), 'Y-M-D h:m:s'),
                    type: type
                  }
                  console.log(workOrderFile)
                  wx.request({
                    url: hostName+'addWorkOrderFile',
                    data: JSON.stringify(workOrderFile),//参数为json格式数据
                    method: 'POST',
                    header: {
                      //设置参数内容类型为json
                      "Content-Type": 'application/json'
                    },
                    dataType: 'json',//该语句会将服务器端的数据自动转为string类型
                    success: function (res) {
                      console.log(res.data.state)
                    },
                    fail: function (res) {
                      console.log(res)
                    }
                  })
                },
                fail: function (res) {
                  console.log(res)
                  console.log("失败")
                },
                errMsg: function (res) {
                  console.log(res)
                  console.log("失败")

                }
              })
            }
            wx.showModal({
              title: '提示',
              content: '发单成功',
              cancelText: '取消',
              confirmText: '确认',
              success: res => {
                wx.switchTab({
                  url: "/pages/basics/home/home"
                })
                that.setData({
                  allValue: '',
                  workTitle: '',
                  textareaAValue: '',
                  src: '',
                  // picker: that.data.pickerInfo,
                  index: null,
                  time: '请选择时间',
                  imgList: [],
                  ifTrue:0
                })
                arrayList = []
                tempFilePaths = [];
                totalPath = []
              }
            })
            console.log('提交成功')
          },
          fail: function (res) {
            console.log(res.data)
            console.log('提交失败')
          }
        })
        that.setData({
          allValue: e.detail.value
        })
      }
    },
    //表单重置按钮
    formReset: function () {
      var that = this
      that.setData({
        allValue: '',
        workTitle: '',
        textareaAValue: '',
        src: '',
        // picker: [],
        index: null,
        time: '请选择时间',
        imgList: [],
        ifTrue: 0
      })
      arrayList = []
      tempFilePaths = [];
      totalPath = []
      // wx.request({
      //   url: 'http://localhost:8080/getFaultTypeList',
      //   method: 'POST',
      //   header: {
      //     // 设置参数内容类型为json
      //     "Content-Type": 'application/x-www-form-urlencoded'
      //   },
      //   dataType: 'json',//该语句会将服务器端的数据自动转为string类型 
      //   success: function (res) {
      //     for (var i = 0; i < res.data.data.length; i++) {
      //       var obj = {}
      //       obj.id = res.data.data[i].id
      //       obj.name = res.data.data[i].name
      //       arrayList.push(obj)
      //     }
      //     that.setData({
      //       picker: arrayList
      //     })
      //     console.log(arrayList);
      //   },
      //   fail: function (res) {
      //     console.log("请重试！");
      //   }
      // })
    },
    //获取时间日期
    bindMultiPickerChange: function (e) {
      this.setData({
        ifTrue: 1
      })
      // console.log('picker发送选择改变，携带值为', e.detail.value)
      var that = this
      that.setData({
        multiIndex: e.detail.value
      })
      const index = this.data.multiIndex;
      const year = this.data.multiArray[0][index[0]];
      const month = this.data.multiArray[1][index[1]];
      const day = this.data.multiArray[2][index[2]];
      const hour = this.data.multiArray[3][index[3]];
      const minute = this.data.multiArray[4][index[4]];
      that.setData({
        time: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
      })
      console.log(that.data.time)
    },
    //监听picker的滚动事件
    bindMultiPickerColumnChange: function (e) {
      this.setData({
        ifTrue:1
      })
      //获取年份
      if (e.detail.column == 0) {
        let choose_year = this.data.multiArray[e.detail.column][e.detail.value];
        this.setData({
          choose_year: choose_year
        })
      }
      //console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
      if (e.detail.column == 1) {
        let num = parseInt(this.data.multiArray[e.detail.column][e.detail.value]);
        let temp = [];
        if (num == 1 || num == 3 || num == 5 || num == 7 || num == 8 || num == 10 || num == 12) { //判断31天的月份
          for (let i = 1; i <= 31; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        } else if (num == 4 || num == 6 || num == 9 || num == 11) { //判断30天的月份
          for (let i = 1; i <= 30; i++) {
            if (i < 10) {
              i = "0" + i;
            }
            temp.push("" + i);
          }
          this.setData({
            ['multiArray[2]']: temp
          });
        } else if (num == 2) { //判断2月份天数
          let year = parseInt(this.data.choose_year);
          if (((year % 400 == 0) || (year % 100 != 0)) && (year % 4 == 0)) {
            for (let i = 1; i <= 29; i++) {
              if (i < 10) {
                i = "0" + i;
              }
              temp.push("" + i);
            }
            this.setData({
              ['multiArray[2]']: temp
            });
          } else {
            for (let i = 1; i <= 28; i++) {
              if (i < 10) {
                i = "0" + i;
              }
              temp.push("" + i);
            }
            this.setData({
              ['multiArray[2]']: temp
            });
          }
        }
      }
      var data = {
        multiArray: this.data.multiArray,
        multiIndex: this.data.multiIndex
      };
      data.multiIndex[e.detail.column] = e.detail.value;
      this.setData(data);
    },
    PickerChange(e) {
      var that = this
      indexSub = e.detail.value
      that.setData({
        index: indexSub
      })
      console.log(arrayList[indexSub].id);
      console.log(arrayList[indexSub].name);
      console.log(indexSub);
    },
    ChooseImage() {
      var that = this
      wx.chooseImage({
        count: 8, //默认9
        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], //从相册选择或开启相机
        success: function (res) {
          tempFilePaths = res.tempFilePaths;
          if (that.data.imgList.length != 0) {
            wx.showToast({
              title: '正在上传...',
              icon: 'loading',
              mask: true,
              duration: 1000
            });
            that.setData({
              imgList: that.data.imgList.concat(tempFilePaths)
            })
            totalPath = that.data.imgList
          } else {
            that.setData({
              imgList: tempFilePaths
            })
            totalPath = totalPath.concat(that.data.imgList)
          }
          console.log(that.data.imgList)
        }
      });
    },
    ViewImage(e) {
      wx.previewImage({
        urls: this.data.imgList,
        current: e.currentTarget.dataset.url
      });
    },
    DelImg(e) {
      var that = this
      wx.showModal({
        title: '警告！',
        content: '确定要删除这张图吗？',
        cancelText: '取消',
        confirmText: '确认',
        success: res => {
          if (res.confirm) {
            that.data.imgList.splice(e.currentTarget.dataset.index, 1);
            that.setData({
              imgList: that.data.imgList
            })
            tempFilePaths = that.data.imgList
            totalPath = that.data.imgList
          }
        }
      })
    },
    textareaAInput(e) {
      this.setData({
        textareaAValue: e.detail.value
      })
    },
    workInput(e) {
      this.setData({
        workTitle: e.detail.value
      })
    },
    pageLifetimes: {
      show() {
        if (typeof this.getTabBar === 'function' &&
          this.getTabBar()) {
          this.getTabBar().setData({
            selected: 4
          })
        }
      }
    },
    //开始录音的时候
    start: function (e) {// 语音开始识别
      manager.start({
        lang: 'zh_CN',// 识别的语言，目前支持zh_CN en_US zh_HK sichuanhua
      })
      const options = {
        duration: 100000,//指定录音的时长，单位 ms
        sampleRate: 16000,//采样率，有效值 8000/16000/44100
        numberOfChannels: 1,//录音通道数
        encodeBitRate: 96000,//编码码率
        format: 'mp3',//音频格式，有效值 aac/mp3
        frameSize: 50,//指定帧大小，单位 KB
      }
      //开始录音
      // recorderManager.start(options);
      wx.showToast({
        title: '开始录音',
        image: '../../images/recorder.png',
        duration: 2000,
      })
      // recorderManager.onStart(() => {
      //   console.log('recorder start')
      // });
      // //错误回调
      // recorderManager.onError((res) => {
      //   console.log(res);
      // })
    },
    //停止录音
    stop: function (e) {
      // 语音结束识别
      manager.stop();
      var that = this
      // recorderManager.stop();
      // recorderManager.onStop((res) => {
      //   this.tempFilePath = res.tempFilePath;
      //   // filePathView = res.tempFilePath;
      //   console.log('停止录音', res.tempFilePath)
      //   const { tempFilePath } = res
      //   wx.uploadFile({
      //     url: 'http://localhost:8080/uploadFromWx', //仅为示例，非真实的接口地址
      //     filePath: res.tempFilePath,
      //     name: "file",
      //     header: {
      //       "Content-Type": "multipart/form-data"
      //     },
      //     formData: {
      //       "user": "test",
      //     },
      //     success: function (res) {
      //       console.log(res.data.split(".Split.")[1])
      //       that.setData({
      //         textareaAValue: res.data.split(".Split.")[1]
      //       })
      //     }
      //   })
      //   this.setData({
      //     src: res.tempFilePath
      //   })
      //   console.log('srcsrc', this.data.src)
      // })
    },
    //播放声音
    play: function () {
      innerAudioContext.autoplay = true
      innerAudioContext.src = this.tempFilePath,
        innerAudioContext.onPlay(() => {
          console.log('开始播放')
        })
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })
    },
    playL() {
      // myaudio.autoplay = true
      myaudio.src = this.data.src
      console.log(this.data.src)
      myaudio.onPlay(() => {
        console.log("开始播放")
      })
      myaudio.play()
      myaudio.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })
    },
  }
})