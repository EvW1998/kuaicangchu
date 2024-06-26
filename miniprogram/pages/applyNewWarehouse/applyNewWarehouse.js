// pages/applyNewWarehouse/applyNewWarehouse.js
const date = require('../../utils/date.js')

const app = getApp()
const db_warehouse = 'warehouse' // the database collection of warehouse

Page({

    /**
     * 页面的初始数据
     */
    data: {
        warehouseName: '',
        inviteCode: '',
        showClearBtn_warehouse: false,
        showClearBtn_code: false,
        enableSubmit: false,
        isInviteCodeWaring: false,
        showInviteCodeError: false,
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

    onInput_warehouse(evt) {
        this.setData({
            warehouseName: evt.detail.value,
            showClearBtn_warehouse: evt.detail.value.length != 0,
            enableSubmit: evt.detail.value.length != 0 && this.data.showClearBtn_code
        })
    },

    onClear_warehouse() {
        this.setData({
            warehouseName: '',
            showClearBtn_warehouse: false,
            enableSubmit: false
        })
    },

    onInput_code(evt) {
        this.setData({
            inviteCode: evt.detail.value,
            showClearBtn_code: evt.detail.value.length != 0,
            enableSubmit: evt.detail.value.length != 0 && this.data.showClearBtn_warehouse,
            isInviteCodeWaring: false
        })
    },

    onClear_code() {
        this.setData({
            inviteCode: '',
            showClearBtn_code: false,
            enableSubmit: false,
            isInviteCodeWaring: false
        })
    },

    onConfirm() {
        let that = this

        wx.requestSubscribeMessage({
            tmplIds: ['RnEcVwcJ6Gx71GODfUJ_vb9qwxEaO0daAa4kjUbhNBQ'],
            success (res) {
                addWarehouseToDatabase(that)
            }
        })
    },

    closeInviteCodeError() {
        this.setData({
            showInviteCodeError: false
        })
    }
})

async function addWarehouseToDatabase(page) {
    console.log('开始提交仓库申请')
    wx.showLoading({
        title: '提交申请中',
        mask: true
    })

    console.log('开始检查邀请码是否重复')
    var search_result = await searchWarehouse(page.data.inviteCode)

    if (search_result.success) {
        if (search_result.result.result.total == 0) {
            console.log('无重复邀请码，开始上传')

            var add_warehouse_data = {
                warehouseName: page.data.warehouseName,
                inviteCode: page.data.inviteCode,
                verified: false,
                applicant_id: app.globalData.openid,
                apply_date: date.dateInformat(new Date())
            }
        
            var add_result = await addNewWarehouse(add_warehouse_data)
        
            if (add_result.success) {
                console.log('仓库申请提交成功', add_result.result)
                wx.hideLoading()
        
                setTimeout(() => {
                    wx.showToast({
                        title: '提交成功',
                        icon: 'success',
                        duration: 2000
                    })
                
                    setTimeout(() => {
                        wx.navigateBack()
                    }, 2500)
                }, 200)
            } else {
                console.log('仓库申请提交失败', add_result.result)
        
                wx.hideLoading()
                setTimeout(() => {
                    wx.showToast({
                        title: '提交失败',
                        icon: 'error',
                        duration: 2000
                    })
                }, 200)
            }
        } else {
            console.log('有重复邀请码，上传终止')

            wx.hideLoading()
            page.setData({
                enableSubmit: false,
                isInviteCodeWaring: true,
                showInviteCodeError: true
            })
        }
    } else {
        console.log('仓库申请提交失败', search_result.result)

        wx.hideLoading()
        setTimeout(() => {
            wx.showToast({
                title: '提交失败',
                icon: 'error',
                duration: 2000
            })
        }, 200)
    }
}

function searchWarehouse(inviteCode) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbCountRecord',
                collection_name: db_warehouse,
                where_condition: {inviteCode: inviteCode}
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

function addNewWarehouse(warehouse_data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbAddRecord',
                collection_name: db_warehouse,
                add_data: warehouse_data
            },
            success: res => {
                // return the result if successed
                resolve({
                    success: true,
                    result: res
                })
            },
            fail: err => {
                // if failed to use cloud function dbAdd
                resolve({
                    success: false,
                    result: err
                })
            }
        })
    })
}
