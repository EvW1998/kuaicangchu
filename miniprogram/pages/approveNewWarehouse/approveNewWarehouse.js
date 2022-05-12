// pages/approveNewWarehouse/approveNewWarehouse.js
const date = require('../../utils/date.js')

const app = getApp()
var skip = 0

Page({

    /**
     * 页面的初始数据
     */
    data: {
        warehouse_byDate: {},
        warehouse_byId: {},
        apply_date: [],
        selectedWarehouse: '',
        selectedDate: '',
        isEnd: false,
        showApproveConfirm: false,
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

        getUnverifiedWarehouse(this)
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
        skip = 0
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

    tabToApprove(evt) {
        this.setData({
            selectedWarehouse: evt.currentTarget.id,
            selectedDate: this.data.warehouse_byId[evt.currentTarget.id].apply_date,
            showApproveConfirm: true
        })
    },

    closeApproveConfirm() {
        this.setData({
            showApproveConfirm: false
        })
    },

    confirmApprove() {
        this.setData({
            showApproveConfirm: false
        })

        approveWarehouse(this, this.data.selectedWarehouse)
    }
})

async function getUnverifiedWarehouse(page) {
    console.log('开始获取待审核仓库申请')
    var search_result = await searchWarehouse()
    
    if (search_result.success) {
        console.log('获取成功', search_result.result.result.data)
        skip += 10
        sortWarehouse(page, search_result.result.result.data)
    } else {
        getUnverifiedWarehouse(page)
    }
}

function searchWarehouse() {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetUnverifiedWarehouse',
                skipContent: skip
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

function sortWarehouse(page, data) {
    var current_warehouse_byDate = page.data.warehouse_byDate
    var current_warehouse_byId = page.data.warehouse_byId
    var current_apply_date = page.data.apply_date
    var current_date = ''

    for(let i = 0; i < data.length; i++) {
        current_date = data[i].apply_date
        if (current_warehouse_byDate[current_date]) {
            current_warehouse_byDate[current_date].push(data[i])
        } else {
            current_warehouse_byDate[current_date] = []
            current_warehouse_byDate[current_date].push(data[i])
            current_apply_date.push(data[i].apply_date)
        }

        current_warehouse_byId[data[i]._id] = data[i]
    }

    page.setData({
        warehouse_byDate: current_warehouse_byDate,
        warehouse_byId: current_warehouse_byId,
        apply_date: current_apply_date
    })
}

async function approveWarehouse(page, warehouseId) {
    console.log('开始通过仓库申请')
    wx.showLoading({
        title: '上传中',
        mask: true
    })

    var update_result = await updateWarehouse(warehouseId)
    
    if (update_result.success) {
        console.log('通过仓库申请成功', update_result.result)

        var update_user = await updateUser(page.data.warehouse_byId[warehouseId].applicant_id, warehouseId)

        if (update_user.success) {
            console.log('修改用户信息成功', update_user.result)
            let warehouse = page.data.warehouse_byDate
            let applyDate = page.data.apply_date

            if (warehouse[page.data.selectedDate].length == 1) {
                delete warehouse[page.data.selectedDate]
                
                for (let j = 0; j < applyDate.length; j++) {
                    if (applyDate[j] == page.data.selectedDate) {
                        applyDate.splice(j, 1)
                        break
                    }
                }

            } else {
                for (let i = 0; i < warehouse[page.data.selectedDate].length; i++) {
                    if (warehouse[page.data.selectedDate][i]._id == warehouseId) {
                        warehouse[page.data.selectedDate].splice(i, 1)
                        break
                    }
                }
            }

            page.setData({
                warehouse_byDate: warehouse,
                apply_date: applyDate
            })

            let message = {}
            message.openId = page.data.warehouse_byId[warehouseId].applicant_id
            message.approveDate = date.formatTime(new Date())
            message.content = '“' + page.data.warehouse_byId[warehouseId].warehouseName + '” 仓库已通过审核'
            message.more = '邀请码：' + page.data.warehouse_byId[warehouseId].inviteCode

            sendApproveMessage(message)

            wx.hideLoading()

            setTimeout(() => {
                wx.showToast({
                    title: '申请已通过',
                    icon: 'success',
                    duration: 2000
                })
            }, 200)
        } else {
            await rollbackWarehouse(warehouseId)
            console.log('通过仓库申请失败', update_user.result)
        
            wx.hideLoading()
            setTimeout(() => {
                wx.showToast({
                    title: '申请通过失败',
                    icon: 'error',
                    duration: 2000
                })
            }, 200)
        }
    } else {
        console.log('通过仓库申请失败', update_result.result)
        
        wx.hideLoading()
        setTimeout(() => {
            wx.showToast({
                title: '申请通过失败',
                icon: 'error',
                duration: 2000
            })
        }, 200)
    }
}

function updateWarehouse(warehouseId) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbUpdateRecord',
                collection_name: 'warehouse',
                where_condition: {_id: warehouseId},
                update_data: {data: {verified: true}}
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

function rollbackWarehouse(warehouseId) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbUpdateRecord',
                collection_name: 'warehouse',
                where_condition: {_id: warehouseId},
                update_data: {data: {verified: false}}
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

function updateUser(applicant_id, warehouseId) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbUpdateRecord',
                collection_name: 'user',
                where_condition: {_id: applicant_id},
                update_data: {
                    data: {
                        hasWarehouse: true,
                        last_warehouse: warehouseId,
                        warehouses: {
                            [warehouseId]: {
                                owner: true
                            }
                        }
                    }
                }
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

function sendApproveMessage(message) {
    wx.cloud.callFunction({
        name: 'sendMessage',
        data: {
            type: 'warehouseApprove',
            openId: message.openId,
            approveDate: message.approveDate,
            content: message.content,
            more: message.more
        },
        success: res => {
            console.log('审核通过通知发送成功', res)
        },
        fail: err => {
            console.log('审核通过通知发送失败', err)
        }
    })
}
