// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: 'cloud1-7gw423hf91cdc498'})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    try{
        return await db.collection('joinRequest')
            .orderBy('apply_date', 'desc')
            .where({
                target_warehouseId: event.target_warehouseId
            })
            .field({
                target_warehouseId: false
            })
            .limit(10)
            .skip(event.skipContent)
            .get()
        }
    catch(e) {
        console.log(e)
    }
}
