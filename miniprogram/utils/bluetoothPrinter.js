
function printItemTestPage(printer) {
    printer.lableBegin(0, 0, 576, 240, 0)
    printer.labelQRCode(30, 30, 5, 0, "test_item")
    printer.lableText(226, 30, 2, 0, 1, "测试物品一二三")
    printer.lableText(226, 100, 1, 0, 0, "净含量: 1000 ml")
    printer.lableText(435, 100, 1, 0, 0, "数量: 12 瓶")
    printer.lableText(226, 150, 1, 0, 1, "入库日期: 2000-01-01")
    printer.lableText(226, 190, 1, 0, 1, "有效期至: 2999-12-31")
    printer.lableend()
}

function printLocationTestPage(printer) {
    printLocation(printer, "test_location", "测试仓库", "测试存储位置")
}

function printLocation(printer, location_id, warehouse_name, location_name) {
    printer.lableBegin(0, 0, 576, 240, 0)
    printer.labelQRCode(30, 30, 5, 0, location_id)
    printer.lableText(226, 30, 1, 0, 0, "仓库：")
    printer.lableText(226, 60, 2, 0, 1, warehouse_name)
    printer.lableText(226, 130, 1, 0, 0, "存储位置：")
    printer.lableText(226, 160, 2, 0, 1, location_name)
    printer.lableend()
}

module.exports = {
    printItemTestPage: printItemTestPage,
    printLocationTestPage: printLocationTestPage,
    printLocation: printLocation
}
