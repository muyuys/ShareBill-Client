// pages/user/index.js
Page({
  data: {
    userInfo:{},
  },
  onLoad(){
  },
  onShow(){
    const userInfo=wx.getStorageSync("userInfo");
    this.setData({userInfo});
  },
  

})