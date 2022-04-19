const dbAddRecord = require('./dbAddRecord/index');
const dbCountRecord = require('./dbCountRecord/index');
const dbGetRecord = require('./dbGetRecord/index');

// 云函数入口函数
exports.main = async (event, context) => {
    switch (event.type) {
        case 'dbAddRecord':
            return await dbAddRecord.main(event, context);
        case 'dbCountRecord':
            return await dbCountRecord.main(event, context);
        case 'dbGetRecord':
            return await dbGetRecord.main(event, context);
    }
};