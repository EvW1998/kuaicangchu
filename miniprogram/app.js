// app.js
const themeListeners = []
var plugin = requirePlugin("myPlugin")

App({
    globalData: {
        theme: wx.getSystemInfoSync().theme,
        openid: '',
        hasOpenId: false,
        userInfo: {},
        hasUserInfo: false,
        isAdministrator: false,
        hasWarehouse: false,
        current_warehouseId: '',
        current_warehouseName: '暂无仓库',
        hasWarehouseChanged: false,
        useBluetoothPrinter: false
    },

    onLaunch: function () {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                env: 'cloud1-7gw423hf91cdc498',
                traceUser: true
            })
        }

        wx.showTabBarRedDot({
            index: 2
        })

        console.log('App Launched')
        console.log('Theme:', this.globalData.theme)
        plugin.Init('wx2e6ec3bf45eac4e7')

        var that = this

        console.log('开始读取本地openId')
        wx.getStorage ({
            key: "openid",
            success(res_openid) {
                that.globalData.openid = res_openid.data
                that.globalData.hasOpenId = true
                console.log('本地openId读取成功', res_openid.data)
            },
            fail(err_openid) {
                console.log('本地openId读取失败', err_openid)
            }
        })

        console.log('开始读取本地userInfo')
        wx.getStorage ({
            key: "userInfo",
            success(res_userinfo) {
                that.globalData.userInfo = res_userinfo.data
                that.globalData.hasUserInfo = true
                console.log('本地userInfo读取成功', res_userinfo.data)
            },
            fail(err_userinfo) {
                console.log('本地userInfo读取失败', err_userinfo)
            }
        })

        console.log('开始读取本地hasWarehouse')
        wx.getStorage ({
            key: "hasWarehouse",
            success(res_hasWarehouse) {
                if (res_hasWarehouse.data.value) {
                    that.globalData.hasWarehouse = res_hasWarehouse.data.value
                    that.globalData.hasWarehouseChanged = true
                }
                console.log('本地hasWarehouse读取成功', res_hasWarehouse.data.value)
            },
            fail(err_hasWarehouse) {
                console.log('本地hasWarehouse读取失败', err_hasWarehouse)
            }
        })

        /** 
        wx.setStorage({
            key: "key",
            data: {
                value: 'hello',
                num: 2
            },
            success(res) {
                console.log('setStorage', res)
            }
        })
        */
    },

    onThemeChange({ theme }) {
        this.globalData.theme = theme
        themeListeners.forEach((listener) => {
            listener(theme)
        })

        console.log("主题颜色改变:", this.globalData.theme)
    },

    watchThemeChange(listener) {
        if (themeListeners.indexOf(listener) < 0) {
            themeListeners.push(listener)
        }
    },

    unWatchThemeChange(listener) {
        const index = themeListeners.indexOf(listener)
        if (index > -1) {
            themeListeners.splice(index, 1)
        }
    }
})
