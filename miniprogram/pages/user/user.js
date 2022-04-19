// pages/user/user.js
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        hasWarehouse: false,
        current_warehouseId: '',
        current_warehouseName: '暂无仓库',
        useBluetoothPrinter: false,
        
        menu_userInfo: {
            id: 'userInfo',
            name: '用户信息设置',
            open: false
        },

        menu_currentWarehouse: {
            id: 'currentWarehouse',
            name: '切换仓库',
            open: false
        },

        warehouses: [],

        menu_warehouseSetting: {
            id: 'warehouseSetting',
            name: '仓库设置',
            open: false
        },

        menu_buletoothSetting: {
            id: 'buletoothSetting',
            name: '使用蓝牙打印机',
            open: false
        },

        theme: 'light'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            theme: wx.getSystemInfoSync().theme || 'light',
            userInfo: app.globalData.userInfo,
            hasWarehouse: app.globalData.hasWarehouse
        })

        if (app.globalData.hasWarehouse) {
            this.setData({
                current_warehouseId: app.globalData.current_warehouseId,
                current_warehouseName: app.globalData.current_warehouseName
            })
        }
    
        if (wx.onThemeChange) {
            wx.onThemeChange(({theme}) => {
                this.setData({theme})
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

    getUserProfile(e) {
        console.log('使用 getUserProfile 获取用户头像昵称')
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        wx.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                console.log('获取用户信息成功', res)
                var userInfo_simplified = {
                    avatarUrl: res.userInfo.avatarUrl,
                    nickName: res.userInfo.nickName
                }

                this.setData({
                    userInfo: userInfo_simplified
                })

                app.globalData.userInfo = userInfo_simplified
                wx.setStorageSync('userInfo', userInfo_simplified)
            },
            fail: (res) => {
                console.log('获取用户信息失败', res)
            }
        })
    },

    kindToggle(e) {
        if (e.currentTarget.id == this.data.menu_userInfo.id) {
            this.setData({
                'menu_userInfo.open': !this.data.menu_userInfo.open,
                'menu_currentWarehouse.open': false,
                'menu_warehouseSetting.open': false
            })
        } else if (e.currentTarget.id == this.data.menu_currentWarehouse.id) {
            this.setData({
                'menu_userInfo.open': false,
                'menu_currentWarehouse.open': !this.data.menu_currentWarehouse.open,
                'menu_warehouseSetting.open': false
            })
        } else if (e.currentTarget.id == this.data.menu_warehouseSetting.id){
            this.setData({
                'menu_userInfo.open': false,
                'menu_currentWarehouse.open': false,
                'menu_warehouseSetting.open': !this.data.menu_warehouseSetting.open
            })
        }
    },

    warehouseChange(e) {
        console.log('切换仓库:', e.detail.value)
    },

    bluetoothPrinterChange(e) {
        console.log('使用蓝牙打印机设置: ', e.detail.value)

        this.setData({
            useBluetoothPrinter: e.detail.value
        })

        app.globalData.useBluetoothPrinter = e.detail.value
        wx.setStorageSync('useBluetoothPrinter', {value: e.detail.value})
    }
})