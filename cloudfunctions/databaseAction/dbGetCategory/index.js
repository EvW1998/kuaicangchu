// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: 'cloud1-7gw423hf91cdc498'})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    try{
        return await db.collection('category')
            .orderBy('categoryName', 'asc')
            .where({
                warehouse_id: event.warehouseId,
                categoryLevel: event.categoryLevel
            })  
            .field({
                warehouse_id: false,
                categoryLevel: false
            })
            .get()
        }
    catch(e) {
        console.log(e)
    }
}
