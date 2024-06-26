// pages/inOut/inOut.js
const bluetoothPrinter = require('../../utils/bluetoothPrinter.js')

const app = getApp()
const db_user = 'user' // the database collection of users

var printer = app.globalData.printer

Page({

    /**
     * 页面的初始数据
     */
    data: {
        hasWarehouse: false,
        current_warehouseName: '',
        printerConnected: false,
        checkPrinter: false,
        showBluetoothError: false,
        menu_in: {
            id: 'in',
            name: '登记入库',
            open: false
        },
        menu_out: {
            id: 'out',
            name: '扫码出库',
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
        //plugin.Init('wx2e6ec3bf45eac4e7')

        this.setData({
            hasWarehouse: app.globalData.hasWarehouse,
            current_warehouseName: app.globalData.current_warehouseName,
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
        } else {
            refreshUserInfo(this)
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
        if (app.globalData.hasWarehouse) {
            this.setData({
                "menu_buletoothSetting.open": app.globalData.enablePrinter
            })
        }

        if (app.globalData.hasWarehouseChanged) {
            this.setData({
                hasWarehouse: app.globalData.hasWarehouse,
                current_warehouseName: app.globalData.current_warehouseName,
                "menu_buletoothSetting.open": app.globalData.enablePrinter
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

        if (app.globalData.enablePrinter) {
            this.setData({
                checkPrinter: true
            })
            this.refreshBluetoothConnection()
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        this.setData({
            checkPrinter: false
        })
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

    warehouse_import() {
        wx.navigateTo({
            url: '../importItem/importItem?printerConnected=' + this.data.printerConnected
        })
    },

    warehouse_export() {
        wx.navigateTo({
            url: '../exportItem/exportItem'
        })
    },

    bluetoothPrinterChange(e) {
        console.log('使用蓝牙打印机设置: ', e.detail.value)

        app.globalData.enablePrinter = e.detail.value

        this.setData({
            "menu_buletoothSetting.open": e.detail.value,
            checkPrinter: e.detail.value
        })

        let lastWarehouse = wx.getStorageSync('lastWarehouse')
        lastWarehouse.enablePrinter = e.detail.value
        wx.setStorageSync('lastWarehouse', lastWarehouse)

        if (e.detail.value) {
            this.refreshBluetoothConnection()
        }
    },
    
    onScanConnect() {
        let that = this

        wx.getBluetoothAdapterState({
            success (res) {
                if (res.available) {
                    printer.scanCode()
                } else {
                    that.setData({
                        showBluetoothError: true
                    })
                }
            },
            fail: (err)=> {
                console.log('检查蓝牙状态失败', err)
                that.setData({
                    showBluetoothError: true
                })
            }
        })
    },

    closeBluetoothError() {
        this.setData({
            showBluetoothError: false
        })
    },

    onPrintTestPage() {
        bluetoothPrinter.printItemTestPage(printer)
    },

    refreshBluetoothConnection() {
        var that = this

        setTimeout(function () {
            let mconnectionstate = printer.getconnectionstate()

            if (mconnectionstate && !that.data.printerConnected) {
                that.setData({
                    printerConnected: mconnectionstate
                })
            } else if (!mconnectionstate && that.data.printerConnected) {
                that.setData({
                    printerConnected: mconnectionstate
                })
            }
            
            if (that.data.checkPrinter) {
                that.refreshBluetoothConnection()
            }
        }, 1000);
    }
})

async function refreshUserInfo(page) {
    wx.showNavigationBarLoading()
    console.log('开始静默同步用户信息')

    let search_result = await searchUser()
    
    if (search_result.success) {
        let cloud_userInfo = search_result.result.result.data[0]

        app.globalData.userInfo.nickName = cloud_userInfo.user_nickname
        wx.setStorageSync('userInfo', app.globalData.userInfo)

        app.globalData.isAdministrator = cloud_userInfo.isAdministrator

        app.globalData.hasWarehouse = cloud_userInfo.hasWarehouse
        page.setData({
            hasWarehouse: cloud_userInfo.hasWarehouse
        })
        wx.setStorageSync('hasWarehouse', {value: cloud_userInfo.hasWarehouse})

        if (cloud_userInfo.hasWarehouse) {
            var warehouseID_list = Object.keys(cloud_userInfo.warehouses)
            var warehouse_result = await searchWarehouse(warehouseID_list)
            if (warehouse_result.success) {
                let warehouse_raw = warehouse_result.result.result.data
                let warehouseID = {}
                for (let i = 0; i < warehouse_raw.length; i++) {
                    warehouseID[warehouse_raw[i]._id] = {
                        name: warehouse_raw[i].warehouseName,
                        owner: cloud_userInfo.warehouses[warehouse_raw[i]._id].owner
                    }
                }
                app.globalData.warehouseList = warehouseID
                wx.setStorageSync('warehouseList', warehouseID)

                if (app.globalData.current_warehouseId == '') {
                    console.log('本地无warehouse信息，初始化')
                    app.globalData.current_warehouseId = warehouseID_list[0]
                    app.globalData.current_warehouseName = warehouseID[warehouseID_list[0]].name
                    app.globalData.warehouseOwner = warehouseID[warehouseID_list[0]].owner
                    wx.setStorageSync('lastWarehouse', {
                        id: warehouseID_list[0],
                        name: warehouseID[warehouseID_list[0]].name,
                        owner: warehouseID[warehouseID_list[0]].owner,
                        enablePrinter: false
                    })

                    page.setData({
                        current_warehouseName: app.globalData.current_warehouseName
                    })

                    let title = '快仓储 - ' + app.globalData.current_warehouseName
                    wx.setNavigationBarTitle({
                        title,
                        success() {
                            console.log('设置标题成功', '快仓储 - ' + app.globalData.current_warehouseName)
                        },
                        fail(err) {
                            console.log('设置标题失败', err)
                        }
                    })
                } else if (app.globalData.current_warehouseName != warehouseID[app.globalData.current_warehouseId].name) {
                    console.log('仓库名称有更改，更新中')

                    app.globalData.current_warehouseName = warehouseID[app.globalData.current_warehouseId].name
                    app.globalData.warehouseOwner = warehouseID[app.globalData.current_warehouseId].owner
                    wx.setStorageSync('lastWarehouse', {
                        id: app.globalData.current_warehouseId,
                        name: app.globalData.current_warehouseName,
                        owner: app.globalData.warehouseOwner,
                        enablePrinter: page.data.menu_buletoothSetting.open
                    })

                    page.setData({
                        current_warehouseName: app.globalData.current_warehouseName
                    })

                    let title = '快仓储 - ' + app.globalData.current_warehouseName
                    wx.setNavigationBarTitle({
                        title,
                        success() {
                            console.log('设置标题成功', '快仓储 - ' + app.globalData.current_warehouseName)
                        },
                        fail(err) {
                            console.log('设置标题失败', err)
                        }
                    })
                } else {
                    app.globalData.warehouseOwner = warehouseID[app.globalData.current_warehouseId].owner

                    wx.setStorageSync('lastWarehouse', {
                        id: app.globalData.current_warehouseId,
                        name: app.globalData.current_warehouseName,
                        owner: app.globalData.warehouseOwner,
                        enablePrinter: page.data.menu_buletoothSetting.open
                    })
                }
            }
        }
    }

    wx.hideNavigationBarLoading()
    console.log('同步用户信息成功')
}

function searchUser() {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetRecord',
                collection_name: db_user,
                where_condition: {_id: app.globalData.openid}
            },
            success: res => {       
                if (res.result.data.length == 1) {
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

function searchWarehouse(warehouseID_list) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetWarehouseList',
                warehouse_list: warehouseID_list
            },
            success: res => {       
                resolve({
                    success: true,
                    result: res
                })
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
