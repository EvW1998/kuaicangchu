// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: 'cloud1-7gw423hf91cdc498'})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    try{
        return await db.collection(event.collection_name)
            .where(event.where_condition).count()
        }
    catch(e) {
        console.log(e)
    }
}
