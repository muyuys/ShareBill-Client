import { request } from "../../request/index.js";
import regeneratorRuntime from "../../libs/runtime/runtime";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orders: [],
    tabs: [
      {
        id: 0,
        value: "全部",
        isActive: true,
      },
      {
        id: 1,
        value: "进行中",
        isActive: false,
      },
      {
        id: 2,
        value: "完成的",
        isActive: false,
      },
      {
        id: 3,
        value: "过期的",
        isActive: false,
      },
      {
        id: 4,
        value: "我的收藏",
        isActive: false,
      },
    ],
    openid: "",
  },
  onLoad() {
    const openid = wx.getStorageSync("openid");
    this.setData({
      openid,
    });
  },
  onShow(options) {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    const { type } = currentPage.options;
    this.changeTitleByIndex(type - 1);
    this.getOrders(type - 1);
  },
  /**获取订单列表的方法*/
  async getOrders(index) {
    let openid = this.data.openid;
    switch (index) {
      case 0:
        var res = await request({ url: "/my/orders/all", data: { openid } });
        break;
      case 1:case 2:case 3:
        let status = this.data.tabs[index].value
        var res = await request({ url: "/my/orders/status", data: { openid,status } });
        break;
      case 4:
        var res = await request({ url: "/my/orders/collect", data: { openid } });
        break;
      default:
        break;
    }
    this.setData({
      orders: res.order_list,
    });
  },
  
  changeTitleByIndex(index) {
    let { tabs } = this.data;
    tabs.forEach((v, i) =>
      i === index ? (v.isActive = true) : (v.isActive = false)
    );
    this.setData({
      tabs,
    });
  },
  handleTabsItemChange(e) {
    const { index } = e.detail;
    this.changeTitleByIndex(index);
    this.getOrders(index);
  },
});
