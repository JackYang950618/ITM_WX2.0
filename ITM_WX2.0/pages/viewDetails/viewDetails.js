const util = require("../../utils/util.js");
const app = getApp();
var hostName = app.data.hostName;
var plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()
const recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
const myaudio = wx.createInnerAudioContext();
if (wx.setInnerAudioOption) {
  wx.setInnerAudioOption({
    obeyMuteSwitch: false,
    autoplay: true
  })
} else {
  myaudio.obeyMuteSwitch = false;
  myaudio.autoplay = true;
}
var arrayList = [];
var tempFilePaths = [];
var tempFilePaths2 = [];
var totalPath = []; //工单信息的附件集合
var totalPath2 = []; //工单退回处理说明的附件集合
var fileName = '';
var fileName3 = '';//退回处理功能的临时文件名存放变量
var workOrderId = '';
var mp3Url = '';//工单信息的重复录制语音临时url
var mp3Url2 = ''; //工单退回处理说明的重复录制语音临时url
var workOrderFileIdList = []
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
for (let i = date.getMonth() + 1; i <= 12; i++) {
  if (i < 10) {
    i = "0" + i;
  }
  months.push("" + i);
}
//获取日期
for (let i = 1; i <= 31; i++) {
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
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    index: null,
    index2: null,
    succeedMode: 'none',
    returnMode: 'none',
    reorderMode: 'none',
    infoMode: 'block',
    workLabel_display:'none',
    returnBtn: 'none',
    reorderBtn: 'none',
    nodeList: [],
    disAble: false,
    disAble2: false,
    picker: [],
    picker2: [],
    pickerInfo: '',
    multiArray: [years, months, days, hours, minutes],
    multiIndex: [0, date.getMonth(), date.getDate() - 1, date.getHours(), date.getMinutes()],
    choose_year: '',
    time: '请选择时间',
    time1: '请选择时间',
    time2: '请选择时间',
    imgList: [],//工单信息的图片集合
    imgList2: [],//工单退回处理说明的图片集合
    src: "",  //发单语音src
    src2: '', //退回处理语音src
    start2: false,//标识是否为 工单退回处理说明——>按住录音 所录制
    temporarySrc: "",
    modalName: null,
    workTitle: '',
    workContent: '',
    backContent: '',
    imgList: [],
    workOrderFileListWX: [],
    isRuleHide:'none',
    isRuleShow:'block',
    allValue:'',
    container_name:'',
    container_department:'',
    container_email:'',
    container_phone:'',
    save: '',
    userIn: '',
    ifTrue: 0
  },
  
  onLoad() {
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
          picker: arrayList,
          picker2: arrayList
        })
      },
      fail: function (res) {
        console.log("请重试！");
      }
    })
    wx.getStorage({
      key: 'viewDtl',
      success: function (res) {
        wx.getStorage({
          key: 'phoneNumber',
          success: function (viewDtl) {
            if (viewDtl.data != res.data.data.creator.phone){
              that.setData({
                save:'none'
              })
            }
          },
        })
        var obj = {}
        console.log('viewDtl', res.data.data)
        workOrderId = res.data.data.workOrderId
        if (res.data.data.workOrderFileList != undefined && res.data.data.workOrderFileList.length > 0) {
          for (var i = 0; i < res.data.data.workOrderFileList.length; i++) {
            that.data.workOrderFileListWX.push(res.data.data.workOrderFileList[i])
            if (res.data.data.workOrderFileList[i].fileUrl != null && res.data.data.workOrderFileList[i].fileUrl.split(".")[1] != "wav") {
              fileName = res.data.data.workOrderFileList[i].fileUrl
              console.log("fileName1", fileName)
              that.data.imgList.push(hostName +"html/uploadPic/" + fileName)
              that.setData({
                imgList: that.data.imgList
              })
            } else if (res.data.data.workOrderFileList[i].fileUrl != null && res.data.data.workOrderFileList[i].fileUrl.split(".")[1] == "wav") {
              console.log("fileName2", res.data.data.workOrderFileList[i].fileUrl)
              that.setData({
                src: hostName +"uploadPic/"+res.data.data.workOrderFileList[i].fileUrl,
                temporarySrc: res.data.data.workOrderFileList[i].fileUrl
              })
              workOrderFileIdList.push(res.data.data.workOrderFileList[i].id)
            }
          }
        }
        if (res.data.data.stateDataItem.name == "待接收"){
          // for (var i = 0; i <= res.data.data.workProcessList.length; i++){
          //   var obj = {}
          //   obj.time = util.tsFormatTime(res.data.data.workProcessList[i].createTime, 'Y-M-D h:m')
          //   obj.creator = res.data.data.workProcessList[i].operationer.name + '' + '派发'
          //   obj.bg = 'blueV'
          //   obj.node = 'blueV'
          // }obj.time = util.tsFormatTime(res.data.data.expectedTime, 'Y-M-D h:m')
          obj.time = util.tsFormatTime(res.data.data.expectedTime, 'Y-M-D h:m')
          obj.creator = res.data.data.creator.name + '' + '派发'
          obj.bg = 'blueV'
          obj.node = 'blueV'
        } else if (res.data.data.stateDataItem.name == "已关闭") {
          obj.time = util.tsFormatTime(res.data.data.expectedTime, 'Y-M-D h:m')
          obj.creator = res.data.data.creator.name + '' + '派发'
          obj.bg = 'grey'
          obj.node = 'grey'
          that.setData({
            save: 'none',
            workLabel_display: '',
            succeedMode: '',
            disAble: true
          })
        } else {
          if (res.data.data.stateDataItem.name == "被退回"){
            that.setData({
              save: 'none',
              reorderBtn: '',
              reorderMode: '',
              disAble: true
            })
          } else if (res.data.data.stateDataItem.name == "处理中") {
            that.setData({
              save: 'none',
              succeedMode: '',
              workLabel_display: '',
              returnMode: '',
              disAble: true
            })
          } else if (res.data.data.stateDataItem.name == "等待中") {
            that.setData({
              save: 'none',
              succeedMode: '',
              workLabel_display: '',
              returnMode: '',
              disAble: true
            })
          } else if (res.data.data.stateDataItem.name == "暂停中") {
            that.setData({
              save: 'none',
              succeedMode: '',
              workLabel_display: '',
              returnMode: '',
              disAble: true
            })
          } else if (res.data.data.stateDataItem.name == "退回处理中"){
            that.setData({
              save: 'none',
              succeedMode: '',
              workLabel_display: '',
              returnMode: '',
              disAble: true
            })
          } else if (res.data.data.stateDataItem.name == "待关闭"){
            that.setData({
              returnBtn: '',
              disAble: true,
            })
            if (wx.getStorageSync("isReturn") == 1) {
              that.setData({
                returnMode: '',
              })
              //由退回按钮跳转  do something
            }else {
              that.setData({
                succeedMode: '',
              })
            }
          }
          obj.time = util.tsFormatTime(res.data.data.expectedTime, 'Y-M-D h:m')
          obj.creator = res.data.data.creator.name + '' + '派发'
          obj.bg = 'blueV'
          obj.node = 'blueV'
          that.setData({
            save: 'none',
            workLabel_display: '',
            disAble: true
          })
        }
        that.data.nodeList.push(obj)
        console.log("that.data.imgList", that.data.imgList)
        that.setData({
          nodeList: that.data.nodeList,
          workTitle: res.data.data.workTitle,
          name: res.data.data.workTitle,
          workContent: res.data.data.workContent,
          time: util.tsFormatTime(res.data.data.expectedTime, 'Y-M-D h:m'),
          pickerInfo: res.data.data.faultTypeDataItem.name,
          imgList: that.data.imgList,
          poster: hostName +"uploadPic/" + fileName,
          author: res.data.data.creator.name + ' ' + util.tsFormatTime(res.data.data.createTime, 'M/D h:m'),
          container_name: util.setData(res.data.data.creator.name),
          container_department: util.setData(res.data.data.creator.oneDepartment.name),
          container_email: util.setData(res.data.data.creator.email),
          container_phone: util.setData(res.data.data.creator.phone)
        })
        if (res.data.data.workLabel != null && res.data.data.workLabel.labelName != null){
          that.setData({
            workLabel: res.data.data.workLabel.labelName,
          })
        }
        console.log("that.data.workContent", that.data.workContent)
      },
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
      if(start2){
        mp3Url2 = res.tempFilePath
        that.setData({
          start2: false
        })
      }
      if (res.result == '') {
        wx.showModal({
          title: '提示',
          content: '听不清楚，请重新说一遍！',
          showCancel: false,
          success: function (res) { }
        })
        return;
      }
      var workOrderMusList = []
      for (var i = 0; i < that.data.workOrderFileListWX.length; i++) {
        if (that.data.workOrderFileListWX[i].fileUrl.split(".")[1] == "wav") {
          workOrderMusList.push(that.data.workOrderFileListWX[i])
          for (var j = 0; j < workOrderMusList.length; j++){
            if (workOrderMusList[j].fileUrl.indexOf(that.data.temporarySrc) > 0){
              workOrderFileIdList.push(workOrderMusList[j].id)
            }
          }
        }
      }
      that.setData({
        src: ''
      })
      var text = res.result;
      var text2 = res.result.substring(0, 10)
      mp3Url = res.tempFilePath
      that.setData({
        workContent: text,
        src: res.tempFilePath,
        workTitle: text2
      })
    }
  }, 
  call() {
    console.log("开始电话")
    wx.makePhoneCall({
      phoneNumber: this.data.container_phone,
    })
  },
  closeWork(e) {
    var that = this
    var id = e.currentTarget.dataset.target
    var workId = that.data.billList[id].workOrderId
    if (that.data.billList[id].state != '待关闭') {
      wx.showToast({
        title: '非待关闭工单！',
        image: '../../../images/warning.png',
        duration: 1000,
        mask: true
      });
    } else {
      wx.request({
        url: hostName +'closeWork',
        data: { "workOrderId": workId },
        method: 'POST',
        header: {
          "Content-Type": 'application/x-www-form-urlencoded'
        },
        dataType: 'json',//该语句会将服务器端的数据自动转为string类型 
        success: function (res) {
          wx.showToast({
            title: '工单已关闭!',
            icon: 'success',
            duration: 1000,
            mask: true
          });
          array = []
          pageStart += pageCount
          that.setDateList(0, pageStart + pageCount)
        },
        fail: function (res) {
          wx.showToast({
            title: '关闭失败!',
            image: '../../../images/warning.png',
            duration: 1000,
            mask: true
          });
        }
      })
    }
  },
  //获取时间日期
  bindMultiPickerChange: function (e) {
    var that = this
    // console.log('picker发送选择改变，携带值为', e.detail.value)
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
  //获取时间日期
  bindMultiPickerChange1: function (e) {
    var that = this
    // console.log('picker发送选择改变，携带值为', e.detail.value)
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
      time1: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
    })
    console.log(that.data.time)
  },
  //获取时间日期
  bindMultiPickerChange2: function (e) {
    var that = this
    // console.log('picker发送选择改变，携带值为', e.detail.value)
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
      time2: year + '-' + month + '-' + day + ' ' + hour + ':' + minute
    })
    console.log(that.data.time)
  },
  //监听picker的滚动事件
  bindMultiPickerColumnChange: function (e) {
    this.setData({
      ifTrue: 1
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

  //表单提交按钮
  formSubmit: function (e) {
    var that = this
    if (e.detail.target.dataset.type == 1) {
      var repTime = that.data.time.replace(/-/g, '/');
      if (that.data.workTitle === '') {
        wx.showToast({
          title: '标题必填',
          image: '../../../images/warning.png',
          duration: 1000,
          mask: true
        })
      } else if (that.data.workContent === '') {
        wx.showToast({
          title: '说明内容必填',
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
        console.log(e.detail.value)
        var that = this
        console.log(that.data.picker)
        for (var i = 0; i < that.data.picker.length; i++) {
          if (that.data.picker[i].name == that.data.pickerInfo) {
            e.detail.value.faultType = that.data.picker[i].id
          }
        }
        that.setData({})
        e.detail.value.expectedTime = that.data.time
        console.log('form发生了submit事件，携带数据为：', e.detail.value.faultType)
        console.log('form发生了submit事件，携带数据为：', e.detail.value)
        wx.request({
          url: hostName +'adjustInvoiceWX',
          data: {
            workOrderId: workOrderId,
            adjust_workTitle: e.detail.value.workTitle,    //工单标题  
            adjust_workContent: e.detail.value.workContent,
            adjust_expectedTime: e.detail.value.expectedTime,
            adjust_workType: e.detail.value.faultType,
            titleIdList: workOrderFileIdList
          },
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          dataType: 'json',
          success: function (res) {
            console.log(res.data)
            console.log('提交成功')
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              mask: true,
              duration: 1000
            });
          },
          fail: function (res) {
            console.log(res.data)
            console.log('提交失败')
          }
        })
        that.setData({
          allValue: e.detail.value
        })
        totalPath.push(mp3Url)
        for (var i = 0; i < totalPath.length; i++) {
          console.log('tempFilePaths[i]', totalPath[i])
          wx.uploadFile({
            url: 'http://localhost:8080/uploadFromWx', //仅为示例，非真实的接口地址
            filePath: totalPath[i],
            name: "file",
            header: {
              "Content-Type": "multipart/form-data"
            },
            formData: {
              "user": "test",
            },
            success: function (res) {
              console.log('something',res.data)
              var workFileName = res.data.split(".Split.")[0]
              var type = ''
              //do something
              if (workFileName.split(".")[1] == "wav") {
                type = 1
              } else {
                type = 0
              }
              var workOrderFile = {
                workOrderId: workOrderId,
                fileUrl: workFileName,
                fileType: 0,
                // createTime: util.tsFormatTime(new Date(), 'Y-M-D h:m:s'),
                // modifyTime: util.tsFormatTime(new Date(), 'Y-M-D h:m:s'),
                type: type
              }
              wx.request({
                url: 'http://localhost:8080/addWorkOrderFile',
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
            }
          })
        }
      }
    } else if (e.detail.target.dataset.type == 2) {
      //退回处理方法
      wx.showModal({
        title: '警告！',
        content: '正在退回工单',
        cancelText: '取消',
        confirmText: '确认',
        success: res => {
          if (res.confirm) {
            that.setData({
              userIn: wx.getStorageSync('getUserByPhone')
            })
            e.detail.value.backTime = that.data.time2
            e.detail.value.userIn = JSON.stringify(that.data.userIn)
            wx.request({
              url: hostName +'returnInvoiceWX',
              data: {
                workOrderId1: workOrderId,    //工单标题  
                backContent: e.detail.value.backContent,
                backTime: e.detail.value.backTime,
                userIn: e.detail.value.userIn,
              },
              header: {
                "Content-Type": 'application/x-www-form-urlencoded'
              },
              method: "POST",
              dataType: 'json',
              success: function (res) {
                totalPath2.push(mp3Url2)
                for (var i = 0; i < totalPath2.length; i++) {
                  wx.uploadFile({
                    url: 'http://localhost:8080/uploadFromWx', //仅为示例，非真实的接口地址
                    filePath: totalPath2[i],
                    name: "file",
                    header: {
                      "Content-Type": "multipart/form-data"
                    },
                    formData: {
                      "user": "test",
                    },
                    success: function (res) {
                      var type = ''
                      fileName3 = res.data.split(".Split.")[0]
                      //do something
                      if (fileName3.split(".")[1] == "wav") {
                        type = 1
                      } else {
                        type = 0
                      }
                      var workOrderFile = {
                        workOrderId: workOrderId,
                        fileUrl: fileName3,
                        fileType: 2,
                        // createTime: util.tsFormatTime(new Date(), 'Y-M-D h:m:s'),
                        // modifyTime: util.tsFormatTime(new Date(), 'Y-M-D h:m:s'),
                        type: type
                      }
                      wx.request({
                        url: 'http://localhost:8080/addWorkOrderFile',
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
                // that.onLoad()
              }
            })
          }else {
            //do something
          }
        }
      })
    }
    
  },
  textareaAInput(e) {
    this.setData({
      workContent: e.detail.value
    })
  },
  textareaBInput(e) {
    this.setData({
      backContent: e.detail.value
    })
  },
  workInput(e) {
    this.setData({
      workTitle: e.detail.value
    })
  },
  PickerChange(e) {
    var that = this
    that.setData({
      index: e.detail.value,
    })
  },
  PickerChange2(e) {
    var that = this
    that.setData({
      index2: e.detail.value,
    })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null,
    })
  },
  ChooseImage(e) {
    var that = this
    if(e.currentTarget.dataset.type == 3){
      wx.chooseImage({
        count: 8, //默认9
        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], //从相册选择或开启相机
        success: function (res) {
          tempFilePaths2 = res.tempFilePaths;
          if (that.data.imgList2.length != 0) {
            wx.showToast({
              title: '正在上传...',
              icon: 'loading',
              mask: true,
              duration: 1000
            });
            that.setData({
              imgList2: that.data.imgList2.concat(tempFilePaths2)
            })
            totalPath2 = that.data.imgList2
          } else {
            // var aaa = "http://localhost:8080/uploadPic/4039a713-e6a7-4e8a-bc95-6addd778cb09.gif"
            // tempFilePaths.push(aaa)
            that.setData({
              imgList2: tempFilePaths2
            })
            totalPath2 = totalPath2.concat(that.data.imgList2)
            console.log('totalPath2', totalPath2)
          }
        }
      });
    } else {
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
            totalPath.push(tempFilePaths)
          } else {
            // var aaa = "http://localhost:8080/uploadPic/4039a713-e6a7-4e8a-bc95-6addd778cb09.gif"
            // tempFilePaths.push(aaa)
            that.setData({
              imgList: tempFilePaths
            })
            totalPath.push(tempFilePaths)
          }
        }
      });
    }
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
    console.log(e.currentTarget.dataset.url)
  },
  DelImg(e) {
    var that = this
    wx.showModal({
      title: '警告！',
      content: '确定要删除这张图吗？',
      cancelText: '取消',
      confirmText: '确认',
      success: res => {
        console.log(that.data.imgList)
        console.log(e.currentTarget.dataset.index)
        if (res.confirm) {
          that.data.imgList.splice(e.currentTarget.dataset.index, 1);
          var workOrderPicList = []
          for (var i = 0; i < that.data.workOrderFileListWX.length; i++){
            if (that.data.workOrderFileListWX[i].fileUrl.split(".")[1] != "wav"){
              workOrderPicList.push(that.data.workOrderFileListWX[i])
            }
          }
          workOrderFileIdList.push(that.data.workOrderPicList[e.currentTarget.dataset.index].id)
          that.setData({
            imgList: that.data.imgList
          })
          tempFilePaths = that.data.imgList
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            mask: true,
            duration: 1000
          })
        }else {
          console.log(workOrderFileIdList)
          console.log(that.data.workOrderFileListWX[e.currentTarget.dataset.index].id)
        }
      }
    })
  },
  //开始录音的时候
  start: function (e) {
    if(e.currentTarget.dataset.type == 4){
      start2 = true
    }
    // 语音开始识别
    manager.start({
      lang: 'zh_CN',// 识别的语言，目前支持zh_CN en_US zh_HK sichuanhua
    })
  },
  //停止录音
  stop: function () {
    // 语音结束识别
    manager.stop();
    var that = this
  },
  //播放声音
  playL() {
    console.log("ios测试播放")
    console.log(this.data.src);
    myaudio.src = this.data.src;
    
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
  //播放声音
  playL2() {
    // myaudio.autoplay = true
    myaudio.src = this.data.src2
    console.log(this.data.src2)
    myaudio.onPlay(() => {
      console.log("开始播放")
    })
    myaudio.play()
    myaudio.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },
})