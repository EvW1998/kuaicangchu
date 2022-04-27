// pages/user/user.js
const app = getApp()
const db_user = 'user' // the database collection of users

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

    onRefreshUserInfo() {
        refreshUserInfo(this)
    },

    onUpdateUserNickname() {
        var that = this

        wx.navigateTo({
            url: '../updateUserNickname/updateUserNickname',
            events: {
                acceptNewNickname: function() {
                    that.setData({
                        userInfo: app.globalData.userInfo
                    })
                }
            },
            success: function(res) {
                that.setData({
                    'menu_userInfo.open': false,
                    'menu_currentWarehouse.open': false,
                    'menu_warehouseSetting.open': false
                })
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

async function refreshUserInfo(page) {
    console.log('使用 getUserProfile 获取用户头像昵称')

    var get_result = await getUserInfo()

    if (!get_result.success) {
        console.log('获取用户信息失败', get_result.result)
    } else {
        console.log('获取用户信息成功', get_result.result)

        page.setData({
            'menu_userInfo.open': false,
            'menu_currentWarehouse.open': false,
            'menu_warehouseSetting.open': false
        })
        
        var userInfo_simplified = {
            avatarUrl: get_result.result.userInfo.avatarUrl,
            nickName: get_result.result.userInfo.nickName
        }

        var nickNameChanged = false
        if (userInfo_simplified.nickName != app.globalData.userInfo.nickName) {
            nickNameChanged = true
        }

        page.setData({
            userInfo: userInfo_simplified
        })
        app.globalData.userInfo = userInfo_simplified
        wx.setStorageSync('userInfo', userInfo_simplified)

        if (nickNameChanged) {
            wx.showNavigationBarLoading()

            console.log('开始将用户新昵称同步至云端数据库')
            var update_data = {
                data: {
                    user_nickname: userInfo_simplified.nickName
                }
            }

            var update_result = await updateUserNickName(update_data)
            if (update_result.success) {
                console.log('昵称同步至云端数据库成功', update_result.result)
            } else {
                console.log('昵称同步至云端数据库失败', update_result.result)
            }

            wx.hideNavigationBarLoading()
        }
    }
}

function getUserInfo() {
    return new Promise((resolve, reject) => {
        wx.getUserProfile({
            desc: '用于完善会员资料',
            success: (res) => {
                resolve({
                    success: true,
                    result: res
                })
            },
            fail: (res) => {
                resolve({
                    success: false,
                    result: res
                })
            }
        })
    })
}

function updateUserNickName(user_data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbUpdateRecord',
                collection_name: db_user,
                where_condition: {_id: app.globalData.openid},
                update_data: user_data
            },
            success: res => {
                if (res.result.stats.updated == 1) {
                    resolve({
                        success: true,
                        result: res
                    })
                } else {
                    resolve({
                        success: false,
                        result: res
                    })
                }
            },
            fail: err => {
                resolve({
                    success: false,
                    result: err
                })
            }
        })
    })
}
