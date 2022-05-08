
function printTestPage(printer) {
    printer.lableBegin(0, 0, 576, 240, 0)
    printer.labelQRCode(30, 30, 5, 0, "test_item")
    printer.lableText(226, 30, 2, 0, 1, "测试物品一二三")
    printer.lableText(226, 100, 1, 0, 0, "净含量: 1000 ml")
    printer.lableText(435, 100, 1, 0, 0, "数量: 12 瓶")
    printer.lableText(226, 150, 1, 0, 1, "入库日期: 2000-01-01")
    printer.lableText(226, 190, 1, 0, 1, "有效期至: 2999-12-31")
    printer.lableend()
}

module.exports = {
    printTestPage: printTestPage
}
