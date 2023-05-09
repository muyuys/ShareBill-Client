import { request } from "./request/index.js";
import regeneratorRuntime from "./libs/runtime/runtime";
import {getUserProfile} from "./utils/asyncWX.js";

wx -
  App({
    /**
     * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
     */
    async onLaunch() {
      wx.cloud.init({
        env: "cloud1-3ghobr4j6b82048e",
      });
    },
  });
