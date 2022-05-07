// pages/approveJoinRequest/approveJoinRequest.js
const app = getApp()
var plugin = requirePlugin("myPlugin")

Page({

    /**
     * 页面的初始数据
     */
    data: {
        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        plugin.Init('wx2e6ec3bf45eac4e7')
        this.refreshData()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        //console.log("===打开页面后自动回链上次连接过的打印机===")
        //plugin.AutoConnect();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    nearconnection() {
        plugin.nearconnection();
    },

    scanCode() {
        plugin.scanCode()              
    },

    closeble() {
        plugin.closeBLEConnection()
    },
    
    qr() {
        plugin.lableBegin(0, 0, 576, 240, 0);
        plugin.labelQRCode(20, 15, 5, 0, "19980302");
        plugin.lableText(216, 15, 2, 0, 1, "菲诺厚椰乳");
        plugin.lableText(216, 85, 1, 0, 0, "净含量: 1000 ml");
        plugin.lableText(425, 85, 1, 0, 0, "数量: 12 瓶");
        plugin.lableText(216, 130, 1, 0, 1, "入库日期: 2022-04-29");
        plugin.lableText(216, 175, 1, 0, 1, "有效期至: 2023-02-09");
        plugin.lableend();
    },

    print1() {
        plugin.lableBegin(0, 0, 576, 240, 0);
        plugin.labelQRCode(20, 15, 5, 0, "test_item");
        plugin.lableText(216, 15, 2, 0, 1, "测试物品");
        plugin.lableText(216, 85, 1, 0, 0, "净含量: 1000 ml");
        plugin.lableText(425, 85, 1, 0, 0, "数量: 12 瓶");
        plugin.lableText(216, 130, 1, 0, 1, "入库日期: 2000-01-21");
        plugin.lableText(216, 175, 1, 0, 1, "有效期至: 2999-12-31");
        plugin.lableend();
    },

    print2() {
        plugin.AutoConnect()        
    },

    print3() {
        this.qr()
    },

    refreshData() {
        var that = this;

        setTimeout(function () {
            var mconnectionstate = plugin.getconnectionstate();//设备连接状态
            var mpaperstate = plugin.getpaperstate();
            console.log("连接状态: ", mconnectionstate, "纸张状态: ", mpaperstate)
        
            that.refreshData();
        }, 1000);
    }
})
