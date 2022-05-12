// pages/locationManage/locationManage.js
const bluetoothPrinter = require('../../utils/bluetoothPrinter.js')

const app = getApp()
var printer = app.globalData.printer

Page({

    /**
     * 页面的初始数据
     */
    data: {
        slideButtons: [],
        locations: [],
        location_byId: {},
        theme: 'light'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (app.globalData.enablePrinter) {
            this.setData({
                slideButtons: [{
                    text: '打印标签'
                }, {
                    extClass: 'weui-slideview__btn-group_notice',
                    text: '修改'
                }, {
                    type: 'warn',
                    text: '删除'
                }]
            })
        } else {
            this.setData({
                slideButtons: [{
                    extClass: 'weui-slideview__btn-group_notice',
                    text: '修改'
                }, {
                    type: 'warn',
                    text: '删除'
                }]
            })
        }

        this.setData({
            theme: wx.getSystemInfoSync().theme || 'light'
        })
    
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
        getLocation(this)
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

    slideButtonTap(e) {
        console.log('slide button tap', e.currentTarget.id)

        if (app.globalData.enablePrinter) {
            if (e.detail.index == 0) {
                console.log('打印标签')
                bluetoothPrinter.printLocation(printer, e.currentTarget.id, app.globalData.current_warehouseName, this.data.location_byId[e.currentTarget.id].locationName)
            } else if (e.detail.index == 1) {
                console.log('修改存储位置')
            } else {
                console.log('删除存储位置')
            }
        } else {
            if (e.detail.index == 0) {
                console.log('修改存储位置')
            } else {
                console.log('删除存储位置')
            }
        }
    },

    onAddLocation() {
        wx.navigateTo({
            url: '../addLocation/addLocation'
        })
    }
})

async function getLocation(page) {
    wx.showNavigationBarLoading()
    console.log('开始获取存储位置')
    var search_result = await searchLocation()
    
    if (search_result.success) {
        console.log('获取成功', search_result.result)
        sortLocation(page, search_result.result.result.data)
    } else {
        getLocation(page)
    }
}

function searchLocation() {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetLocation',
                warehouseId: app.globalData.current_warehouseId
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

function sortLocation(page, data) {
    var current_locations = []
    var current_location_byId = {}

    for(let i = 0; i < data.length; i++) {
        current_locations.push(data[i]._id)
        current_location_byId[data[i]._id] = data[i]
    }

    page.setData({
        locations: current_locations,
        location_byId: current_location_byId
    })

    wx.hideNavigationBarLoading()
}
