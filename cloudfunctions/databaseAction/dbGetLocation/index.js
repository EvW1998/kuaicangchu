// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: 'cloud1-7gw423hf91cdc498'})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    try{
        console.log(event.warehouseId)
        
        return await db.collection('location')
            .orderBy('locationName', 'asc')
            .where({
                warehouse_id: event.warehouseId
            })
            .field({
                warehouse_id: false
            })
            .get()
        }
    catch(e) {
        console.log(e)
    }
}
