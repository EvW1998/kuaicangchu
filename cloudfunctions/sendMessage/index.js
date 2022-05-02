const warehouseApprove = require('./warehouseApprove/index');

// 云函数入口函数
exports.main = async (event, context) => {
    switch (event.type) {
        case 'warehouseApprove':
            return await warehouseApprove.main(event, context);
    }
};
