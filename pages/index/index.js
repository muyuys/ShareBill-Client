import regeneratorRuntime from "../../libs/runtime/runtime";
import { showToast, showModal } from "../../utils/asyncWX.js";
import { request } from "../../request/index.js";
var QQMapWX = require("../../utils/qqmap-wx-jssdk.js");
var qqmapsdk;
const app = getApp();

Page({
  data: {
    tabs: [
      {
        id: 0,
        value: "购物",
        isActive: true,
      },
      {
        id: 1,
        value: "外卖",
        isActive: false,
      },
    ],
    index: 0,
    ordersList: [],
    address: "",
    page: 1,
    hasNext: false,
    total: 0,
    school: "",
    contact: "",
    isCertified: false,
  },

  async onLoad(options) {
    var that = this;
    // 实例化API核心类
    /*     qqmapsdk = new QQMapWX({
      key: "7QJBZ-7VFKJ-LJZFD-KFT6T-D3PFQ-QXBVP",
    });

    await this.authLocation();
    await this.getAddress(); */
    // 因为云函数获取openid需要一定事件，导致如果在then之外使用this.getUserContact()函数时获取不到openid
    let openid = wx.getStorageSync("openid");
    if (openid == "" || openid == null) {
      wx.cloud
        .callFunction({
          name: "getOpenid",
        })
        .then((res) => {
          console.log(res);
          wx.setStorageSync("openid", res.result.openid);
          that.getUserContact();
        });
    } else {
      this.getUserContact();
    }
    await this.getOrders();
  },
  onShow() {
    let isCertified = wx.getStorageSync("isCertified");
    if (isCertified != null) {
      this.setData({
        school,
      });
    }
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 将page重新设置为1,从后端重新获取数据
    console.log("下拉刷新");
    this.setData({
      ordersList: [],
      page: 1,
    });
    //优化用户体验,如果没有新的数据弹窗告知
    this.refresh();
  },
  async refresh() {
    let total = this.data.total;
    const res = await this.getOrders();
    if (total == this.data.total) {
      await showToast({ title: "暂时没有新的数据了" });
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 1. 判断是否还有下一页
    if (this.data.hasNext == true) {
      // 2.1 有就向后端获取下一页数据
      this.data.page++;
      this.getOrders();
    } else {
      // 2.2 没有就弹出提示暂时没有数据了
      showToast({ title: "暂时没有新的数据了" });
    }
  },

  /**先判断缓存中是否有未过期的,没有再从后端获取订单数据 */
  async getOrders() {
    let index = this.data.index;
    let query = {
      type: this.data.tabs[index].value,
      page: this.data.page,
    };
    const res = await request({
      url: "/get_order",
      header: { "content-type": "application/www-from-urlencoded" },
      data: query,
    });

    this.setData({
      ordersList: res.order_list,
      hasNext: res.has_next,
      total: res.all,
    });

    wx.stopPullDownRefresh();
  },
  // 根据标题索引来激活选中 标题数组
  changeTitleByIndex(index) {
    // 2 修改源数组
    let { tabs } = this.data;
    tabs.forEach((v, i) =>
      i === index ? (v.isActive = true) : (v.isActive = false)
    );
    // 3 赋值到data中
    this.setData({
      tabs,
      index,
    });
  },

  /* 标题点击事件 从子组件传递过来 */
  handleTabsItemChange(e) {
    /* 1.获取被点击的标题索引 */
    const { index } = e.detail;
    this.changeTitleByIndex(index);

    this.getOrders();
  },
  /**定位信息授权 */
  authLocation() {
    var that = this;
    wx.authorize({
      scope: "scope.userLocation", //发起定位授权
      success: function () {
        console.log("有定位授权");
        //授权成功，此处调用获取定位函数
      },
      fail() {
        //如果用户拒绝授权，则要告诉用户不授权就不能使用，引导用户前往设置页面。
        console.log("没有定位授权");
        wx.showModal({
          cancelColor: "cancelColor",
          title: "没有授权无法获取位置信息",
          content: "是否前往设置页面手动开启",
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                withSubscriptions: true,
              });
            } else {
              wx.showToast({
                icon: "none",
                title: "您取消了定位授权",
              });
            }
          },
          fail: function (e) {
            console.log(e);
          },
        });
      },
    });
  },

  async getAddress() {
    const location = await this.getLocation();
    console.log(location);
    this.setData({
      address: location.address,
    });
  },

  /**调用获取位置 */
  getLocation() {
    return new Promise((reslove, reject) => {
      wx.getLocation({
        //获取地址
        type: "gcj02",
        success(res) {
          const latitude = res.latitude;
          const longitude = res.longitude;
          const speed = res.speed;
          const accuracy = res.accuracy;
          qqmapsdk.reverseGeocoder({
            //SDK调用
            location: { latitude, longitude },
            success: function (res) {
              wx.setStorageSync("location", res.result);
              reslove(res.result);
            },
            fail: function (err) {
              reject(err);
            },
          });
        },
      });
    });
  },

  /**判断用户是不是新用户 获取用户联系方式和学校 */
  async getUserContact() {
    // 缓存中有联系方式 就可以正常使用,获取即可
    // 如果没有就向后台获取用户信息,如果不存在为新用户
    // 建议用户去添加联系方式,并在后台创建该用户
    // 如果存在就将用户的联系方式和学校都存放在缓存中
    // 联系方式用户拼单是发送消息给发布者
    // 学校判断该用户是否认证,也为了向用户提供订单甄别服务
    let contact = wx.getStorageSync("contact");
    if (contact == "" || contact == null) {
      let openid = wx.getStorageSync("openid");
      const res = await request({ url: "/get_user_info", data: { openid } });
      if (res.result == false) {
        console.log(res);
        const choice = await showModal({
          content: "您是新用户,为正常使用服务建议先去设置联系方式",
          title: "建议",
        });
        wx.setStorageSync("isNewUser", true);
        wx.setStorageSync("isCertified", false);
        if (choice.confirm == true) {
          wx.navigateTo({
            url: "/pages/setuser/index",
          });
        } else {
          await showToast({ title: "请您之后自行设置哦" });
        }
        console.log(choice);
      } else {
        // 是用户清除了数据，但不是新用户，获取用户的联系方式和学校
        let contact = res.contact;
        let school = res.school;
        this.setData({
          school,
          contact,
        });
        wx.setStorageSync("contact", contact);
        wx.setStorageSync("isNewUser", false);
        wx.setStorageSync("school", school);
        if (school == null) {
          wx.setStorageSync("isCertified", false);
          this.setData({
            isCertified: false,
          });
        } else {
          wx.setStorageSync("isCertified", true);
          this.setData({
            isCertified: true,
          });
        }
      }
    } else {
      console.log("has contact");
      let school = wx.getStorageSync("school");
      if (school == null || school == "") {
        wx.setStorageSync("isCertified", false);
      } else {
        wx.setStorageSync("isCertified", true);
        this.setData({
          school,
          contact,
          isCertified: true,
        });
      }
      wx.setStorageSync("isNewUser", false);
      console.log("缓存中有联系方式");
    }
  },
});
