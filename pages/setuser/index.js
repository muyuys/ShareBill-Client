import regeneratorRuntime, { async } from "../../libs/runtime/runtime";
import { showToast } from "../../utils/asyncWX.js";
import { request } from "../../request/index.js";

Page({
  data: {
    contact: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let contact = wx.getStorageSync("contact");
    if (contact == null || contact == "") {
      showToast({ title: "请填写正确联系方式以正常使用服务" });
    } else {
      this.setData({
        contact
      })
    }
  },
  saveContact() {
    if (this.data.contact == null || this.data.contact == "") {
      wx.showToast({
        icon: "error",
        title: "联系方式为空",
      });
    } else {
      let contact = this.data.contact;
      // 将联系方式保存在缓存中,不需要反复请求接口
      wx.setStorageSync("contact", contact);
      wx.setStorageSync('isNewUser', false)
      let openid = wx.getStorageSync("openid");
      // 如果是新用户就创建,不是新用户就修改
      request({ url: "/set/user", data: { contact, openid } });
      wx.navigateBack({
        delta: 1,
      });
    }
  },

  /**获取联系方式输入 */
  contactEventFunc: function (e) {
    if (e.detail && e.detail.value) {
      this.data.contact = e.detail.value;
    }
  },
  /**是否contact可以只保存在缓存中,数据库不获取 */
  /**还是需要将contact保存到后台,不然当清楚缓存后,联系方式就没有了,但该用户不是新用户 */
  /**获取用户信息,如果有就将数据保存在data和缓存中 */
});
