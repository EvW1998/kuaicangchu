const cloud = require('wx-server-sdk')
cloud.init({env: 'cloud1-7gw423hf91cdc498'})

exports.main = async (event, context) => {
    try {
        const result = await cloud.openapi.subscribeMessage.send({
            "touser": event.openId,
            "data": {
                "phrase1": {
                    "value": '通过'
                },
                "date3": {
                    "value": event.approveDate
                },
                "thing2": {
                    "value": event.content
                },
                "thing5": {
                    "value": event.more
                }
            },
            "templateId": 'RnEcVwcJ6Gx71GODfUJ_vb9qwxEaO0daAa4kjUbhNBQ',
            "miniprogramState": 'developer'
        })
        return result
    } catch (err) {
        return err
    }
}
