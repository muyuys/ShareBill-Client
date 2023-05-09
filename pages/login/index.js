import { request } from "../../request/index.js";
import regeneratorRuntime from "../../libs/runtime/runtime";
import { getUserProfile, login } from "../../utils/asyncWX.js";
/** 获取用户信息*/ 
Page({
  async handleGetUserInfo(e) {
    const UserRes = await getUserProfile({ purpose: "用于完善会员资料" });
    wx.setStorageSync("userInfo", UserRes.userInfo);
    
    
    wx.navigateBack({
      delta: 1,
    });
  },
});
