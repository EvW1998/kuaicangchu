// pages/addLocation/addLocation.js
const bluetoothPrinter = require('../../utils/bluetoothPrinter.js')

const app = getApp()
var printer = app.globalData.printer

Page({

    /**
     * 页面的初始数据
     */
    data: {
        location_name: '',
        showClearBtn_name: false,
        enableSubmit: false,
        isNameWaring: false,
        enablePrinter: false,
        printerConnected: false,
        showBluetoothError: false,
        showNameError: false,
        theme: 'light'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            enablePrinter: app.globalData.enablePrinter,
            theme: wx.getSystemInfoSync().theme || 'light'
        })

        if (app.globalData.enablePrinter) {
            this.refreshBluetoothConnection()
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
        this.setData({
            enablePrinter: false
        })
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

    onInput_name(evt) {
        this.setData({
            location_name: evt.detail.value,
            showClearBtn_name: evt.detail.value.length != 0,
            isNameWaring: false
        })

        if (evt.detail.value.length != 0) {
            if (this.data.enablePrinter) {
                if (this.data.printerConnected) {
                    this.setData({
                        enableSubmit: true
                    })
                } else {
                    this.setData({
                        enableSubmit: false
                    })
                }
            } else {
                this.setData({
                    enableSubmit: true
                })
            }
        } else {
            this.setData({
                enableSubmit: false
            })
        }
    },

    onClear_name() {
        this.setData({
            location_name: '',
            showClearBtn_name: false,
            enableSubmit: false,
            isNameWaring: false
        })
    },

    closeNameError() {
        this.setData({
            showNameError: false
        })
    },

    switchPrinter() {
        console.log('使用蓝牙打印机设置: ', !this.data.enablePrinter)

        app.globalData.enablePrinter = !this.data.enablePrinter

        this.setData({
            enablePrinter: !this.data.enablePrinter
        })

        let lastWarehouse = wx.getStorageSync('lastWarehouse')
        lastWarehouse.enablePrinter = app.globalData.enablePrinter
        wx.setStorageSync('lastWarehouse', lastWarehouse)

        if (app.globalData.enablePrinter) {
            this.refreshBluetoothConnection()

            this.setData({
                enableSubmit: false
            })
        } else {
            if (this.data.location_name.length != 0) {
                this.setData({
                    enableSubmit: true
                })
            }
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
        bluetoothPrinter.printLocationTestPage(printer)
    },

    onConfirm() {
        confirmAddLocation(this)
    },

    refreshBluetoothConnection() {
        var that = this

        setTimeout(function () {
            let mconnectionstate = printer.getconnectionstate()

            if (mconnectionstate && !that.data.printerConnected) {
                that.setData({
                    printerConnected: mconnectionstate
                })

                if (that.data.location_name.length != 0 && that.data.enablePrinter) {
                    that.setData({
                        enableSubmit: true
                    })
                }
            } else if (!mconnectionstate && that.data.printerConnected) {
                that.setData({
                    printerConnected: mconnectionstate
                })

                if (that.data.enablePrinter) {
                    that.setData({
                        enableSubmit: false
                    })
                }
            }
            
            if (that.data.enablePrinter) {
                that.refreshBluetoothConnection()
            }
        }, 1000);
    }
})

async function confirmAddLocation(page) {
    console.log('开始验证存储位置名称')
    wx.showLoading({
        title: '添加中',
        mask: true
    })

    var check_result = await checkLocationName(page.data.location_name)
    
    if (check_result.success) {
        console.log('验证存储位置名称', check_result.result)

        if (check_result.result.result.total != 0) {
            console.log('存储位置名称重复')
            wx.hideLoading()
            page.setData({
                enableSubmit: false,
                isNameWaring: true,
                showNameError: true
            })
        } else {
            console.log('存储位置名称通过验证')
            let location_data = {
                locationName: page.data.location_name,
                warehouse_id: app.globalData.current_warehouseId
            }
        
            var add_result = await addLocation(location_data)

            if (add_result.success) {
                console.log('存储位置添加成功', add_result.result)

                if (page.data.enablePrinter && page.data.printerConnected) {
                    bluetoothPrinter.printLocation(printer, add_result.result.result._id, app.globalData.current_warehouseName, page.data.location_name)
                }

                wx.hideLoading()
        
                setTimeout(() => {
                    wx.showToast({
                        title: '添加成功',
                        icon: 'success',
                        duration: 2000
                    })
                
                    setTimeout(() => {
                        wx.navigateBack()
                    }, 2500)
                }, 200)
            } else {
                console.log('存储位置添加失败', add_result.result)
        
                wx.hideLoading()
                setTimeout(() => {
                    wx.showToast({
                        title: '添加失败',
                        icon: 'error',
                        duration: 2000
                    })
                }, 200)
            }
        }
    } else {
        console.log('验证存储位置名称失败', check_result.result)

        wx.hideLoading()
        setTimeout(() => {
            wx.showToast({
                title: '上传失败',
                icon: 'error',
                duration: 2000
            })
        }, 200)
    }
}

function checkLocationName(location_name) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbCountRecord',
                collection_name: 'location',
                where_condition: {
                    locationName: location_name,
                    warehouse_id: app.globalData.current_warehouseId
                }
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
                    result: res
                })
            }
        })
    })
}

function addLocation(location_data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbAddRecord',
                collection_name: 'location',
                add_data: location_data
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
                    result: res
                })
            }
        })
    })
}
