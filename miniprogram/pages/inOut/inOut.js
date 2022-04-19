// pages/inOut/inOut.js
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        hasWarehouse: false,
        theme: 'light'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            theme: wx.getSystemInfoSync().theme || 'light'
        })
    
        if (wx.onThemeChange) {
            wx.onThemeChange(({theme}) => {
                this.setData({theme})
            })
        }

        if (!app.globalData.hasOpenId || !app.globalData.hasUserInfo) {
            wx.redirectTo({
                url: '../welcome/welcome'
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (app.globalData.hasWarehouseChanged) {
            this.setData({
                hasWarehouse: app.globalData.hasWarehouse
            })

            var title = '快仓储 - ' + app.globalData.current_warehouseName

            wx.setNavigationBarTitle({
                title,
                success() {
                    console.log('设置标题成功', '快仓储 - ' + app.globalData.current_warehouseName)
                    app.globalData.hasWarehouseChanged = false
                },
                fail(err) {
                    console.log('设置标题失败', err)
                }
            })
        }
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

    }
})