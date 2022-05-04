// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: 'cloud1-7gw423hf91cdc498'})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    const _ = db.command

    try{
        console.log(event.warehouse_list)
        return await db.collection('warehouse')
            .where({
                _id: _.in(event.warehouse_list)
            })
            .field({
                warehouseName: true
            })
            .get()
        }
    catch(e) {
        console.log(e)
    }
}
