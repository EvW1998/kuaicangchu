const dbAddRecord = require('./dbAddRecord/index');
const dbCountRecord = require('./dbCountRecord/index');
const dbGetJoinRequest = require('./dbGetJoinRequest/index');
const dbGetRecord = require('./dbGetRecord/index');
const dbGetUnverifiedWarehouse = require('./dbGetUnverifiedWarehouse/index');
const dbGetWarehouseList = require('./dbGetWarehouseList/index');
const dbRemoveRecord = require('./dbRemoveRecord/index');
const dbUpdateRecord = require('./dbUpdateRecord/index');

// 云函数入口函数
exports.main = async (event, context) => {
    switch (event.type) {
        case 'dbAddRecord':
            return await dbAddRecord.main(event, context);
        case 'dbCountRecord':
            return await dbCountRecord.main(event, context);
        case 'dbGetJoinRequest':
            return await dbGetJoinRequest.main(event, context);
        case 'dbGetRecord':
            return await dbGetRecord.main(event, context);
        case 'dbGetUnverifiedWarehouse':
            return await dbGetUnverifiedWarehouse.main(event, context);
        case 'dbGetWarehouseList':
            return await dbGetWarehouseList.main(event, context);
        case 'dbRemoveRecord':
            return await dbRemoveRecord.main(event, context);
        case 'dbUpdateRecord':
            return await dbUpdateRecord.main(event, context);
    }
};
