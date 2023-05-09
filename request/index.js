/* 对于发送多个异步请求 showLoading只会出现一个,但是当其中一个请求结束时,
就会hideLoading,此时其他数据还没接收完全,页面效果不佳,所以需要通过一个变量来判定何时关闭 */
/* 同时发送异步代码的次数 */
let ajaxTimes = 0;
/* 定义公共的Url */
const baseUrl = "https://sharebill.top:443";

export const request = (params) => {
  ajaxTimes++;
  /* 显示加载中 */
  wx.showLoading({
    title: "请稍等",
    mask: true,
  });

  return new Promise((resolve, reject) => {
    wx.request({
      ...params,
      url: baseUrl + params.url,
      success: (result) => {
        resolve(result.data);
      },
      fail: (err) => {
        reject(err);
      },
      complete: () => {
        ajaxTimes--;
        if (ajaxTimes == 0) {
          /* 关闭正在显示的图标 */
          wx.hideLoading();
        }
      },
    });
  });
};

export const uploadFile = (params) => {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      ...params,
      url: baseUrl + params.url,
      success: (result) => {
        resolve(result.data)
      },
      fail: (err) => {
        reject(err);
      },
      complete: () => {

      }
    })
  });
};
