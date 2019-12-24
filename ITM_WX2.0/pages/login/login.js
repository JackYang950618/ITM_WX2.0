// pages/login/login.js

var app = getApp();
var hostName = app.data.hostName;
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
    avatarUrl: "",//用户头像
    nickName: "",//用户昵称
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getPhoneNumber(e) {
      var that = this
      var iv = e.detail.iv
      var encrypted = e.detail.encryptedData
      console.log("hostName");
      console.log(hostName);
      wx.getStorage({
        key: 'code',
        success: function (res) {
          console.log(res.data)
          wx.request({
            url: hostName+'getWxPhoneNumberS',
            method: 'POST',
            data: {
              encDataStr: encrypted,
              ivStr: iv,
              keyStr: res.data.session_key,
            },
            header: {
              // 设置参数内容类型为json
              "Content-Type": 'application/x-www-form-urlencoded'
            },
            dataType: 'json',//该语句会将服务器端的数据自动转为string类型
            success: function (res) {
              console.log("getWxPhoneNumberS",res.data)
              wx.setStorage({
                key: 'phoneNumber',
                data: res.data.phoneNumber,
              })
              wx.request({
                url: hostName +'/getUserByPhone',
                method: 'POST',
                data: { phone: res.data.phoneNumber },
                header: {
                  // 设置参数内容类型为json
                  "Content-Type": 'application/x-www-form-urlencoded'
                },
                dataType: 'json',//该语句会将服务器端的数据自动转为string类型 
                success: function (result) {
                  console.log("getUserByPhone",result.data.data)
                  wx.setStorage({
                    key: 'getUserByPhone',
                    data: result.data.data,
                  })
                },
                fail: function (res) { },
              })
            }
          })
          wx.switchTab({
            url: "/pages/basics/home/home",
          })
        },
      })
    },
    //获取头像信息
    getAvatar() {
      var that = this
      wx.getUserInfo({
        success: function (res) {
          console.log('userInfo', res)
          that.setData({
            avatarUrl: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName,
          })
          console.log('userInfo2', that.data.avatarUrl)
          console.log('userInfo3', that.data.nickName)
        }
      })
    },
  }
})
