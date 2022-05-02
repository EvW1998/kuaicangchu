// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env: 'cloud1-7gw423hf91cdc498'})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    try{
        return await db.collection('warehouse')
            .orderBy('apply_date', 'desc')
            .where({
                verified: false
            })
            .field({
                apply_date: true,
                warehouseName: true,
                applicant_id: true,
                inviteCode: true
            })
            .limit(10)
            .skip(event.skipContent)
            .get()
        }
    catch(e) {
        console.log(e)
    }
}
