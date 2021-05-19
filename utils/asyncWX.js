/* 
    Promise 形式的getSetting
*/

export const getSetting = () => {
  return new Promise((reslove, reject) => {
    wx.getSetting({
      success: (result) => {
        reslove(result);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

/* 
    Promise 形式的openSetting
*/
export const openSetting = () => {
  return new Promise((reslove, reject) => {
    wx.openSetting({
      success: (result) => {
        reslove(result);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

/* 
    Promise 形式的chooseAddress
*/
export const chooseAddress = () => {
  return new Promise((reslove, reject) => {
    wx.chooseAddress({
      success: (result) => {
        reslove(result);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export const showModal = ({ title, content }) => {
  return new Promise((reslove, reject) => {
    wx.showModal({
      title: title,
      content: content,
      //将success改成箭头函数才能使this指向的是当前的page
      success: (res) => {
        reslove(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export const showToast = ({ title }) => {
  return new Promise((reslove, reject) => {
    wx.showToast({
      title: title,
      icon: "none",
      //将success改成箭头函数才能使this指向的是当前的page
      success: (res) => {
        reslove(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export const login = () => {
  return new Promise((reslove, reject) => {
    wx.login({
      timeout: 10000,
      //将success改成箭头函数才能使this指向的是当前的page
      success: (res) => {
        reslove(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export const getUserProfile = (purpose) => {
  return new Promise((reslove, reject) => {
    wx.getUserProfile({
      desc: purpose.toString(), // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      lang: "zh_CN",
      success: (res) => {
        reslove(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

