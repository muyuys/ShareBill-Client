import regeneratorRuntime, { async } from "../../libs/runtime/runtime";
import { showToast, showModal } from "../../utils/asyncWX.js";
import { request, uploadFile } from "../../request/index.js";
//获取应用实例
var app = getApp();

String.prototype.format = function () {
  if (arguments.length == 0) return this;
  var param = arguments[0];
  var s = this;
  if (typeof param == "object") {
    for (var key in param)
      s = s.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
    return s;
  } else {
    for (var i = 0; i < arguments.length; i++)
      s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
    return s;
  }
};

Page({
  data: {
    orderId: "",
    title: "",
    typeIndex: 0,
    content: "",
    description: "",
    activityURL: "",
    chooseImgs: [],
    orderType: ["购物", "外卖", "拼车", "合租"],
    date: "2021-01-01",
    time: "00:00",
    number: 0,
  },
  onLoad() {
    this.getNow();
  },

  /** title获取*/
  titleEventFunc: function (e) {
    if (e.detail && e.detail.value) {
      this.data.title = e.detail.value;
    }
  },
  /** 拼单内容获取*/
  contentEventFunc: function (e) {
    if (e.detail && e.detail.value) {
      this.data.content = e.detail.value;
    }
  },
  /** 描述信息获取*/
  descriptionEventFunc: function (e) {
    if (e.detail && e.detail.value) {
      this.data.description = e.detail.value;
    }
  },
  /** 活动链接获取*/
  activityUrlEventFunc: function (e) {
    if (e.detail && e.detail.value) {
      this.data.activityURL = e.detail.value;
    }
  },
  numberEventFunc(e) {
    if (e.detail && e.detail.value) {
      this.data.number = e.detail.value;
    }
  },
  bindPickerType(e) {
    this.setData({
      typeIndex: e.detail.value,
    });
  },
  bindPickerDate(e) {
    this.setData({
      date: e.detail.value,
    });
  },
  bindPickerTime(e) {
    this.setData({
      time: e.detail.value,
    });
  },

  async formSubmit(e) {
    let isNewUser = wx.getStorageSync("isNewUser");
    if (isNewUser == true) {
      await showToast({ title: "您还不是正式用户,不能发单" });
      return false;
    }
    let school = wx.getStorageSync("school");
    if (school == null || school == "") {
      const choice = await showModal({
        title: "您还没有认证不能发单",
        content: "是否前往认证",
      });
      if (choice.confirm == true) {
        wx.navigateTo({
          url: "/pages/degree_certificate/index",
        });
        return false;
      }
    }
    // 弹出订阅信息 用户接收订阅消息才能发单,不然无法接收到拼单结果
    const subscribeRes = await this.requestMsg();

    if (subscribeRes == true) {
      this.setData({
        orderId: this.orderCode(),
      });

      if (this.data.title === "") {
        const res = await showToast({ title: "标题不能为空" });
        return false;
      } else if (this.data.content === "") {
        const res = await showToast({ title: "内容不能为空" });
        return false;
      } else if (this.data.number < 2) {
        const res = await showToast({ title: "参与人数不够哦" });
        return false;
      } else {
        this.transformDatetime();
        let {
          orderId,
          title,
          content,
          description,
          activityURL,
          orderType,
          typeIndex,
          number,
        } = this.data;

        let openid = wx.getStorageSync("openid");

        let params = {
          order_id: orderId,
          type: orderType[typeIndex],
          title: title,
          content: content,
          description: description,
          url: activityURL,
          deadline: this.transformDatetime(),
          openid: openid,
          number: number,
        };
        /* 先上传出图片外的信息创建订单 */
        const order_info = await request({
          url: "/post",
          method: "POST",
          data: params,
        });
        /* 再上传图片，待后端上传结束后修改数据库中该订单的 */

        this.foreachUpload();
        //清理订单数据
        this.setData({
          orderId: "",
          title: "",
          typeIndex: 0,
          content: "",
          description: "",
          activityURL: "",
          chooseImgs: [],
          number: 0,
        });
        this.getNow();
      }
    } else {
      console.log("未订阅");
    }
  },
  async foreachUpload() {
    for (let imagePath of this.data.chooseImgs) {
      const res = await uploadFile({
        url: "/upload_order_img",
        filePath: imagePath,
        name: "image",
        formData: { order_id: this.data.orderId },
      });
    }
  },

  // 点击 “+” 选择图片
  handleChooseImg() {
    wx.chooseImage({
      count: 9,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: (result) => {
        this.setData({
          // 图片数组 进行拼接
          chooseImgs: [...this.data.chooseImgs, ...result.tempFilePaths],
        });
      },
    });
  },
  // 点击 自定义图片组件
  handleRemoveImg(e) {
    // 2 获取被点击的组件的索引
    const { index } = e.currentTarget.dataset;
    // 3 获取data中的图片数组
    let { chooseImgs } = this.data;
    // 4 删除元素
    chooseImgs.splice(index, 1);
    this.setData({
      chooseImgs,
    });
  },
  orderCode() {
    var orderCode = "";
    for (
      var i = 0;
      i < 6;
      i++ //6位随机数，用以加在时间戳后面。
    ) {
      orderCode += Math.floor(Math.random() * 10);
    }
    orderCode = new Date().getTime() + orderCode; //时间戳，用来生成订单号。
    return orderCode;
  },

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
  getNow() {
    var myDate = new Date();
    var year = myDate.getFullYear();
    var month = myDate.getMonth() + 1;
    var day = myDate.getDate();
    var date = year + "-" + month + "-" + day;
    var hour = myDate.getHours();
    var minute = myDate.getMinutes();
    var time = hour + ":" + minute;
    this.setData({
      date: date,
      time: time,
    });
    console.log(date, time);
  },
  transformDatetime() {
    let datetime = this.data.date + " " + this.data.time + ":00";
    return datetime;
  },
});
