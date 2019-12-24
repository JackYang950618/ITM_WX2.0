const util = require("../../../utils/util.js");
var pageStart = 0;
var pageCount = 15;
var array = []
const app = getApp();
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
    billList: [],
    gridCol: 3,
    skin: false
  },

  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 2
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    onShow() {
      console.log(2)
      array = []
      pageStart = 0
      var that = this
      var page = { start: pageStart, count: pageCount }
      var searchData = { page: page, keywords: '', liIdInvoice: 2 }
      wx.request({
        url: 'http://localhost:8080/searchInvoice',
        data: JSON.stringify(searchData),//参数为json格式数据
        method: 'POST',
        header: {
          //设置参数内容类型为json  https://172.16.80.23:8443/ITM/searchInvoice
          "Content-Type": 'application/json;charset=utf-8'
        },
        dataType: 'json',//该语句会将服务器端的数据自动转为string类型 
        success: function (res) {
          console.log(res.data)
          var phone = wx.getStorageSync('phoneNumber')
          for (var i = 0; i < res.data.data.length; i++) {
            var phone2 = res.data.data[i].creator.phone
            var obj = {}
            if (phone !== phone2) {
              obj.start = ''
            } else {
              obj.start = 'ListTouchStart'
            }
            if (res.data.data[i].workOrderFileList != undefined && res.data.data[i].workOrderFileList.length > 0) {
              for (var j = 0; j < res.data.data[i].workOrderFileList.length; j++) {
                if (res.data.data[i].workOrderFileList[j].fileUrl != null && res.data.data[i].workOrderFileList[j].fileUrl.split(".")[1] == "wav") {
                  obj.src = "http://localhost:8080/uploadPic/" + res.data.data[i].workOrderFileList[j].fileUrl
                } else {
                  obj.src = ''
                }
                if (res.data.data[i].workOrderFileList[j].fileUrl != null && res.data.data[i].workOrderFileList[j].fileUrl.split(".")[1] != "wav") {
                  obj.poster = "http://localhost:8080/uploadPic/" + res.data.data[i].workOrderFileList[j].fileUrl
                } else {
                  obj.poster = ''
                }
              }
            } else {
              obj.src = ""
              obj.poster = ""
            }
            if (res.data.data[i].creator.sex == 1) {
              obj.avatarUrl = 'https://itmtest.jd-link.com:8023/ITM/images/man.png'
            } else {
              obj.avatarUrl = 'https://itmtest.jd-link.com:8023/ITM/images/woman.png'
            }
            obj.id = res.data.data[i].id
            obj.name = res.data.data[i].workTitle
            obj.author = res.data.data[i].creator.name + ' ' + util.tsFormatTime(res.data.data[i].createTime, 'M/D h:m')
            obj.creator = res.data.data[i].creator.name
            obj.time = util.tsFormatTime(res.data.data[i].createTime, 'Y-M-D h:m')
            // if (res.data.data[i].workOrderFileList[i].fileUrl.split(".")[1] == "wav")
            // {
            //   obj.src = res.data.data[i].workOrderFileList[i].fileUrl
            // } else if (res.data.data[i].workOrderFileList[i].fileUrl.split(".")[1] == null){
            //   obj.src = ""
            //   obj.poster = ""
            // } else {
            //   obj.poster = res.data.data[i].workOrderFileList[i].fileUrl
            // }
            obj.state = res.data.data[i].stateDataItem.name
            obj.workOrderId = res.data.data[i].workOrderId
            obj.workContent = res.data.data[i].workContent
            obj.faultTypeId = res.data.data[i].faultTypeDataItem.id
            obj.faultTypeName = res.data.data[i].faultTypeDataItem.name
            array.push(obj)
          }
          console.log(array)
          that.setData({
            billList: array
          })
        },
        fail: function (res) {
          console.log(res);
          console.log("请求数据失败！请重试！");
        }
      })
    },
    closeWork(e) {
      var that = this
      var id = e.currentTarget.dataset.target
      var workId = that.data.billList[id].workOrderId
      if (that.data.billList[id].state != '待关闭'){
        wx.showToast({ 
          title: '非待关闭工单！', 
          image: '../../../images/warning.png', 
          duration: 1000, 
          mask: true 
        });
      }else {
        wx.request({
          url: 'http://localhost:8080/closeWork',
          data: { "workOrderId": workId},
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
    //跳转详情页面
    viewDtl: function (e) {
      var that = this
      var id = e.currentTarget.dataset.target
      wx.request({
        url: 'http://localhost:8080/getByWorkOrderId',
        data: { workOrderId: that.data.billList[id].workOrderId },//参数为json格式数据
        method: 'POST',
        // contentType: 'application/json;charset=utf-8',
        header: {
          //设置参数内容类型为json
          "Content-Type": 'application/x-www-form-urlencoded'
        },
        dataType: 'json',//该语句会将服务器端的数据自动转为string类型 
        success: function (res) {
          wx.removeStorage({
            key: 'viewDtl',
            success: function (kkk) {
              console.log('success')
            }
          })
          wx.setStorage({
            key: 'viewDtl',
            data: res.data,
          })
          wx.setStorage({
            key: 'isReturn',
            data: parseInt(e.currentTarget.id),
          })
          wx.navigateTo({
            url: '../../viewDetails/viewDetails',
          })
        },
        fail: function (res) { }
      })
    },
    setDateList(start, number) {
      var that = this
      var page = { start: start, count: number }
      var searchData = { page: page, keywords: '', liIdInvoice: 2 }
      wx.request({
        url: 'http://localhost:8080/searchInvoice',
        data: JSON.stringify(searchData),//参数为json格式数据
        method: 'POST',
        header: {
          //设置参数内容类型为json  https://172.16.80.23:8443/ITM/searchInvoice
          "Content-Type": 'application/json;charset=utf-8'
        },
        dataType: 'json',//该语句会将服务器端的数据自动转为string类型 
        success: function (res) {
          console.log(res.data)
          var phone = wx.getStorageSync('phoneNumber')
          for (var i = 0; i < res.data.data.length; i++) {
            var phone2 = res.data.data[i].creator.phone
            var obj = {}
            if (phone !== phone2) {
              obj.start = ''
            } else {
              obj.start = 'ListTouchStart'
            }
            if (res.data.data[i].workOrderFileList != undefined && res.data.data[i].workOrderFileList.length > 0) {
              for (var j = 0; j < res.data.data[i].workOrderFileList.length; j++) {
                if (res.data.data[i].workOrderFileList[j].fileUrl != null && res.data.data[i].workOrderFileList[j].fileUrl.split(".")[1] == "wav") {
                  obj.src = "http://localhost:8080/uploadPic/" + res.data.data[i].workOrderFileList[j].fileUrl
                } else {
                  obj.src = ''
                }
                if (res.data.data[i].workOrderFileList[j].fileUrl != null && res.data.data[i].workOrderFileList[j].fileUrl.split(".")[1] != "wav") {
                  obj.poster = "http://localhost:8080/uploadPic/" + res.data.data[i].workOrderFileList[j].fileUrl
                } else {
                  obj.poster = ''
                }
              }
            } else {
              obj.src = ""
              obj.poster = ""
            }
            if (res.data.data[i].creator.sex == 1) {
              obj.avatarUrl = 'https://itmtest.jd-link.com:8023/ITM/images/man.png'
            } else {
              obj.avatarUrl = 'https://itmtest.jd-link.com:8023/ITM/images/woman.png'
            }
            obj.id = res.data.data[i].id
            obj.name = res.data.data[i].workTitle
            obj.author = res.data.data[i].creator.name + ' ' + util.tsFormatTime(res.data.data[i].createTime, 'M/D h:m')
            obj.creator = res.data.data[i].creator.name
            obj.time = util.tsFormatTime(res.data.data[i].createTime, 'Y-M-D h:m')
            // if (res.data.data[i].workOrderFileList[i].fileUrl.split(".")[1] == "wav")
            // {
            //   obj.src = res.data.data[i].workOrderFileList[i].fileUrl
            // } else if (res.data.data[i].workOrderFileList[i].fileUrl.split(".")[1] == null){
            //   obj.src = ""
            //   obj.poster = ""
            // } else {
            //   obj.poster = res.data.data[i].workOrderFileList[i].fileUrl
            // }
            obj.state = res.data.data[i].stateDataItem.name
            obj.workOrderId = res.data.data[i].workOrderId
            obj.workContent = res.data.data[i].workContent
            obj.faultTypeId = res.data.data[i].faultTypeDataItem.id
            obj.faultTypeName = res.data.data[i].faultTypeDataItem.name
            array.push(obj)
          }
          console.log(array)
          that.setData({
            billList: array
          })
        },
        fail: function (res) {
          console.log(res);
          console.log("请求数据失败！请重试！");
        }
      })
    },
    onReachBottom() {
      var that = this
      pageStart += pageCount
      if (pageStart > that.data.billList.length) {
        wx.showToast({ title: '已无更多', icon: 'none', duration: 1000, mask: true });
      } else {
        that.setDateList(pageStart, pageCount)
        wx.showToast({ title: '加载中', icon: 'loading', duration: 1000, mask: true });
      }
    },
    onPullDownRefresh() {
      var that = this
      array = []
      pageStart += pageCount
      that.setDateList(0, pageStart + pageCount)
      wx.showToast({ title: '刷新成功', icon: 'success', duration: 1000, mask: true });
      wx.stopPullDownRefresh();
    },
    showModal(e) {
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    },
    hideModal(e) {
      this.setData({
        modalName: null
      })
    },
    gridchange: function (e) {
      this.setData({
        gridCol: e.detail.value
      });
    },
    gridswitch: function (e) {
      this.setData({
        gridBorder: e.detail.value
      });
    },
    menuBorder: function (e) {
      this.setData({
        menuBorder: e.detail.value
      });
    },
    menuArrow: function (e) {
      this.setData({
        menuArrow: e.detail.value
      });
    },
    menuCard: function (e) {
      this.setData({
        menuCard: e.detail.value
      });
    },
    switchSex: function (e) {
      this.setData({
        skin: e.detail.value
      });
    },

    // ListTouch触摸开始
    ListTouchStart(e) {
      this.setData({
        ListTouchStart: e.touches[0].pageX
      })
    },

    // ListTouch计算方向
    ListTouchMove(e) {
      var minus = e.touches[0].pageX - this.data.ListTouchStart
      if (minus < -80) {
        this.setData({
          ListTouchDirection: 'left'
        })
      } else {
        this.setData({
          ListTouchDirection: 'right'
        })
      }
    },

    // ListTouch计算滚动
    ListTouchEnd(e) {
      if (this.data.ListTouchDirection == 'left') {
        this.setData({
          modalName: e.currentTarget.dataset.target
        })
      } else {
        this.setData({
          modalName: null
        })
      }
      this.setData({
        ListTouchDirection: null
      })
    },
    //列表点击播放
    startPlay(e) {

      var src = (e.currentTarget.dataset.src);

      myaudio.src = src;

      var index = (e.currentTarget.dataset.index);

      var that = this;
      var billList = that.data.billList;


      myaudio.onPlay(() => {
        console.log("开始播放");
        for (let i in billList) {
          if (i == index) {
            billList[i].poster = hostName + "images/playing.png";
          }
          else {
            billList[i].poster = hostName + "images/beforePlay.png";
          }
        }
        that.setData({
          billList: billList
        })
      })
      myaudio.play()

      myaudio.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })

    }
  }
})