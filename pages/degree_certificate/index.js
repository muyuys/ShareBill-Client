/**认证应该是去对比用户填写的学校和获取的学校是否相同 */
import { request } from "../../request/index.js";
Page({
  data: {
    code: "",
    school: "",
    isCertified: false,
  },
  onLoad() {
    let school = wx.getStorageSync("school");
    let isCertified = wx.getStorageSync("isCertified");
    this.setData({
      school,
      isCertified,
    });
  },
  codeEventFunc(e) {
    if (e.detail && e.detail.value) {
      this.data.code = e.detail.value;
    }
  },
  verify() {
    let code = this.data.code;
    if (code.trim() == "") {
      wx.showToast({
        icon: "none",
        title: "验证码不能为空",
      });
    } else {
      wx.showLoading({
        title: "验证中",
      });
      wx.request({
        url: "https://api.jshdz.cn/xxwyz/",
        data: {
          code,
        },
        async success(res) {
          wx.hideLoading();
          if (res.data.code == 0) {
            await wx.showToast({
              icon: "success",
              title: "认证成功",
            });
            let school = res.data.data.university;
            wx.setStorageSync("school", school);
            wx.setStorageSync("isCertified", true);
            let openid = wx.getStorageSync("openid");
            await request({ url: "/set/user", data: { openid, school } });
            wx.navigateBack({
              delta: 1,
            });
          } else {
            wx.showToast({
              icon: "none",
              title: res.data.msg,
            });
          }
        },
        fail(err) {
          console.log(err);
        },
      });
    }
  },
});
