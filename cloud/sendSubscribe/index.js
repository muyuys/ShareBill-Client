// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    console.log(event.openid);
    const result = await cloud.openapi.subscribeMessage.send({
        "touser": event.openid,
        "page": 'pages/order_detail/index',
        "lang": 'zh_CN',
        "data": {
          "character_string8": {
            "value": event.order_id
          },
          "thing10": {
            "value": event.contact
          },
          "thing1": {
            "value": event.order_title
          },
        },
        "templateId": 'gw17POqzXaI32VF_l70M9Y2bXiGpcHs0u9iYGh5fRh8',
        "miniprogramState": 'developer'
      })
    return result
  } catch (err) {
    return err
  }
}