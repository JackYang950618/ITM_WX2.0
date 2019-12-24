//index.js
//获取应用实例
const app = getApp()
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
    PageCur: 'basics',
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
      pagePath: "/pages/basics/home/home",
      iconPath: "/images/tabbar/basics.png",
      selectedIconPath: "/images/tabbar/basics_cur.png",
      text: "待接收"
    }, {
      pagePath: "/pages/component/home/home",
      iconPath: "/images/tabbar/component.png",
      selectedIconPath: "/images/tabbar/component_cur.png",
      text: "处理中"
    }, {
      pagePath: "/pages/about/home/home",
      iconPath: "/images/tabbar/microphone.png",
      selectedIconPath: "/images/tabbar/microphone_cur.png",
      text: "新增"
    }, {
      pagePath: "/pages/plugin/home/home",
      iconPath: "/images/tabbar/plugin.png",
      selectedIconPath: "/images/tabbar/plugin_cur.png",
      text: "已完成"
    }, {
      pagePath: "/pages/mine/home/home",
      iconPath: "/images/tabbar/about.png",
      selectedIconPath: "/images/tabbar/about_cur.png",
      text: "我的"
    }]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    },
    NavChange(e) {
      this.setData({
        PageCur: e.currentTarget.dataset.cur
      })
    },
    onShareAppMessage() {
      return {
        title: 'ColorUI-高颜值的小程序UI组件库',
        imageUrl: '/images/share.jpg',
        path: '/pages/index/index'
      }
    },
    onLoad: function (e) {
      
    },
  }
})
