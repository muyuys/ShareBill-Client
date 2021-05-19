import { request } from "../../request/index.js";
import regeneratorRuntime, { async } from "../../libs/runtime/runtime";
import { showToast, showModal } from "../../utils/asyncWX.js";
// pages/order_detail/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderDetail: {},
    isCollect: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onShow: function () {
    let page = getCurrentPages();
    let currentPage = page[page.length - 1];
    let options = currentPage.options;
    const { order_id } = options;
    this.getorderDetail(order_id);
  },
  onUnload: function () {
    this.setCollection();
  },

  async getorderDetail(order_id) {
    let openid = wx.getStorageSync("openid");
    const res = await request({
      url: "/get_order_detail",
      data: { order_id, openid },
    });

    if (
      res.order_detail.pictures.length == 0 ||
      res.order_detail.pictures == null
    ) {
      res.order_detail.pictures.push(
        "https://ww1.sinaimg.cn/large/007rAy9hgy1g24by9t530j30i20i2glm.jpg"
      );
    }
    this.setData({
      orderDetail: res.order_detail,
      isCollect: res.order_detail.is_collect,
    });
  },
  /* e为事件源对象 */
  /* 放大预览 */
  handlePreviewImage(e) {
    const urls = this.data.orderDetail.pictures;
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current,
      urls,
    });
  },

  // 点击 商品收藏图标
  handleCollect() {
    let isCollect = false;
    //已经收藏了,点击就取消收藏
    if (this.data.isCollect == true) {
      this.setData({
        isCollect: false,
      });
      wx.showToast({
        title: "取消成功",
        icon: "success",
        mask: true,
      });
    } else {
      // 没有收藏过
      this.setData({
        isCollect: true,
      });
      wx.showToast({
        title: "收藏成功",
        icon: "success",
        mask: true,
      });
    }
  },

  // 点击拼 发送消息到发布该订单用户
  async handleParticipate() {
    var that = this;
    if (this.data.orderDetail.status != "进行中") {
      await showToast({ title: "活动已过期" });
      return;
    }

    // 1. 判断用户是否已经填写了联系方式
    let contact = wx.getStorageSync("contact");
    if (contact == "" || contact == null) {
      const res = await showModal({
        title: "您还不是正式用户",
        content: "是否前往用户创建界面",
      });
      if (res.confirm == true) {
        wx.navigateTo({
          url: "/pages/setuser/index",
        });
      } else {
        await showToast({
          title: "请之后自行进行设置",
        });
      }
      return ;
    }
    let isCertified = wx.getStorageSync("isCertified");
    if (isCertified == false) {
      const res = await showModal({
        title: "您还未认证",
        content: "是否进行认证",
      });
      if (res.confirm == true) {
        wx.navigateTo({
          url: "/pages/degree_certificate/index",
        });
      } else {
        await showToast({
          title: "请之后自行进行设置",
        });
      }
      return ;
    }
    // 2. 判断用户是否已经参与该拼单活动
    let openid = wx.getStorageSync("openid");
    let order_id = that.data.orderDetail.order_id;
    var res = await request({
      url: "/participate",
      data: { openid, order_id },
    });
    if (res.result != true) {
      await showToast({ title: res.errMsg });
    } else {
      // 3. 填写了联系方式且未参与过该拼单活动 弹窗让用户确认是否拼单,且告知联系方式会被发送个发布者
      wx.showModal({
        title: "确认发起拼单",
        content: "会发送您的联系方式给订单发布者",
        async success(res) {
          // 4.1 确认发送参与订单的请求
          if (res.confirm) {
            // 5. 获取订阅信息授权
            await that.requestMsg();
            // 6. 向发布者发送订阅消息
            that.sendSubscribeOne(contact);
            await showToast({ title: "成功参与" });
            await that.getorderDetail(that.data.orderDetail.order_id);
          } else if (res.cancel) {
            console.log("用户点击取消");
          }
        },
      });
    }
  },
  async sendSubscribeOne(contact) {
    // 获取该订单发布者的openid
    let order_id = this.data.orderDetail.order_id;
    const issuer = await request({ url: "/get_issuer", data: { order_id } });
    let openid = issuer.issuer_openid;
    let title = this.data.orderDetail.title;
    wx.cloud
      .callFunction({
        name: "sendSubscribe",
        data: {
          openid: openid,
          order_id: order_id,
          contact: contact,
          order_title: title,
        },
      })
      .then((res) => {
        console.log("调用接口成功", res);
      })
      .catch((err) => {
        console.log("发送失败", err);
      });
  },
  /**判断用户是否更改了该订单的收藏选项 */
  async setCollection() {
    let is_collect = this.data.isCollect;
    if (is_collect != this.data.orderDetail.is_collect) {
      // 发生改变了才发生请求
      let openid = wx.getStorageSync("openid");
      let order_id = this.data.orderDetail.order_id;
      const res = await request({
        url: "/set_collect",
        data: { is_collect, openid, order_id },
      });
    }
  },
  /**为发送订阅消息,申请订阅消息的授权 */
  requestMsg() {
    return new Promise((reslove, reject) => {
      wx.requestSubscribeMessage({
        tmplIds: ["gw17POqzXaI32VF_l70M9Y2bXiGpcHs0u9iYGh5fRh8"],
        success: (res) => {
          if (res["gw17POqzXaI32VF_l70M9Y2bXiGpcHs0u9iYGh5fRh8"] === "accept") {
            console.log("订阅");
            reslove(true);
          }
        },
        fail: (err) => {
          console.log("不订阅");
          reject(err);
        },
      });
    });
  },

  textPaste() {
    wx.showToast({
      title: "复制成功",
    });
    wx.setClipboardData({
      data: this.data.orderDetail.url,
      success: function (res) {
        wx.getClipboardData({
          //这个api是把拿到的数据放到电脑系统中的
          success: function (res) {
            console.log(res.data); // data
          },
        });
      },
    });
  },
});
