// pages/invoice/home/home.js
const util = require("../../../utils/util.js");
const app = getApp();
var hostName = app.data.hostName;
var phoneNumber = ''
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
    skin: false,
    password: true,
    sex: false,
    nickName: '',
    name: '',
    job: '',
    phoneNumber: '',
    email: '',
    age: '',
    passwordView: '',
    company: '',
    department: '',
    secondaryDepartment: '',
    role: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onShow() {
      console.log(1)
      var that = this
      wx.getStorage({
        key: 'phoneNumber',
        success: function(PN) {
          wx.request({
            url: hostName+'getUserByPhone',
            method: 'POST',
            data: { phone: PN.data },
            header: {
              // 设置参数内容类型为json
              "Content-Type": 'application/x-www-form-urlencoded'
            },
            dataType: 'json',//该语句会将服务器端的数据自动转为string类型 
            success: function (res) {
              console.log(res.data.data)
              if (res.data.data.sex == 1) {
                that.setData({
                  skin: true,
                  sex: true
                })
              }
              that.setData({
                nickName: util.setData(res.data.data.userName),
                name: util.setData(res.data.data.name),
                job: util.setData(res.data.data.job),
                phoneNumber: util.setData(res.data.data.phone),
                email: util.setData(res.data.data.email),
                passwordView: util.setData(res.data.data.password),
                age: util.setData(res.data.data.age),
                company: util.setDictionary(res.data.data.company),
                department: util.setDictionary(res.data.data.oneDepartment),
                secondaryDepartment: util.setDictionary(res.data.data.twoDepartment),
                role: util.setDictionary(res.data.data.role),
              })
              wx.setStorage({
                key: 'name',
                data: res.data.data.name,
              })
            },
            fail: function (res) { },
          })
        },
      })
    },
    test() {
      wx.getStorage({
        key: 'phoneNumber',
        success: function(res) {
          console.log(res.data)
        },
      })
    },
    //表单提交按钮
    formSubmit: function (e) {
      var that = this
      var sexS = ''
      console.log('form发生了submit事件，携带数据为：', e.detail.value)
      if (e.detail.value.sex == true){
        sexS = 1
      }else {
        sexS = 0
      }
      var user = {
        userName: e.detail.value.nickName,
        name: e.detail.value.name,
        phone: e.detail.value.phoneNumber,
        email: e.detail.value.email,
        password: e.detail.value.password,
        age: e.detail.value.age,
        sex: sexS
      }
      console.log("user",user)
      wx.request({
        url: hostName +'adjustUserCenter',
        data: JSON.stringify(user),
        method: 'POST',
        header: {
          // 设置参数内容类型为json
          "Content-Type": 'application/json;charset=utf-8'
        },
        dataType: 'json',//该语句会将服务器端的数据自动转为string类型 
        success: function(res) {
          console.log(res.data.state)
          console.log("用户信息修改成功")
        },
        fail: function(res) {
          console.log(res)
          console.log("用户信息修改失败")
        },
        errMsg: function (res) {
          console.log(res)
          console.log("服务器错误")
        }
      })
      this.setData({
        allValue: e.detail.value
      })
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        mask: true,
        duration: 2000
      });
      this.onShow()
    },
    //表单重置按钮
    formReset: function (e) {
      console.log('form发生了reset事件，携带数据为：', e.detail.value)
      this.setData({
        allValue: ''
      })
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
      console.log(e.detail)
      this.setData({
        skin: e.detail.value,
        sex: e.detail.value,
      });
    },
    switchPassword: function (e) {
      this.setData({
        password: e.detail.value
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
      this.setData({
        ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
      })
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
  }
})
