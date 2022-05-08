// pages/approveJoinRequest/approveJoinRequest.js
const date = require('../../utils/date.js')

const app = getApp()
var skip = 0

Page({

    /**
     * 页面的初始数据
     */
    data: {
        warehouseName: '',
        request_byDate: {},
        request_byId: {},
        apply_date: [],
        selectedRequest: '',
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
            warehouseName: app.globalData.current_warehouseName,
            theme: wx.getSystemInfoSync().theme || 'light'
        })
    
        if (wx.onThemeChange) {
            wx.onThemeChange(({theme}) => {
                this.setData({theme})
            })
        }

        getJoinRequest(this)
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

    tabToApprove(evt) {
        this.setData({
            selectedRequest: evt.currentTarget.id,
            selectedDate: this.data.request_byId[evt.currentTarget.id].apply_date,
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

        approveRequest(this, this.data.selectedRequest)
    }
})

async function getJoinRequest(page) {
    console.log('开始获取待审核加入申请')
    var search_result = await searchRequest()
    
    if (search_result.success) {
        console.log('获取成功', search_result.result.result.data)
        skip += 10
        sortRequest(page, search_result.result.result.data)
    } else {
        getJoinRequest(page)
    }
}

function searchRequest() {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetJoinRequest',
                target_warehouseId: app.globalData.current_warehouseId,
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

function sortRequest(page, data) {
    var current_request_byDate = page.data.request_byDate
    var current_request_byId = page.data.request_byId
    var current_apply_date = page.data.apply_date
    var current_date = ''

    for(let i = 0; i < data.length; i++) {
        current_date = data[i].apply_date
        if (current_request_byDate[current_date]) {
            current_request_byDate[current_date].push(data[i])
        } else {
            current_request_byDate[current_date] = []
            current_request_byDate[current_date].push(data[i])
            current_apply_date.push(data[i].apply_date)
        }

        current_request_byId[data[i].applicant_id] = data[i]
    }

    page.setData({
        request_byDate: current_request_byDate,
        request_byId: current_request_byId,
        apply_date: current_apply_date
    })
}

async function approveRequest(page, applicant_id) {
    console.log('开始通过加入申请')
    wx.showLoading({
        title: '上传中',
        mask: true
    })

    var update_user = await updateUser(applicant_id, app.globalData.current_warehouseId)

    if (update_user.success) {
        console.log('修改用户信息成功', update_user.result)
        let request = page.data.request_byDate
        let applyDate = page.data.apply_date

        if (request[page.data.selectedDate].length == 1) {
            delete request[page.data.selectedDate]
            
            for (let j = 0; j < applyDate.length; j++) {
                if (applyDate[j] == page.data.selectedDate) {
                    applyDate.splice(j, 1)
                    break
                }
            }

        } else {
            for (let i = 0; i < request[page.data.selectedDate].length; i++) {
                if (request[page.data.selectedDate][i].applicant_id == applicant_id) {
                    request[page.data.selectedDate].splice(i, 1)
                    break
                }
            }
        }

        page.setData({
            request_byDate: request,
            apply_date: applyDate
        })

        let message = {}
        message.openId = applicant_id
        message.approveDate = date.formatTime(new Date())
        message.content = '申请加入“' + page.data.warehouseName + '”仓库已通过'
        message.more = '重新打开小程序即可查看'

        let request_data = {}
        request_data._id = page.data.request_byId[applicant_id]._id
        console.log(request_data)
        deleteRequest(request_data)

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
        console.log('通过加入申请失败', update_user.result)
    
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
                                owner: false
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

function deleteRequest(request_data) {
    wx.cloud.callFunction({
        name: 'databaseAction',
        data: {
            type: 'dbRemoveRecord',
            collection_name: 'joinRequest',
            where_condition: request_data
        },
        success: res => {
            console.log('加入申请删除成功', res)
        },
        fail: err => {
            console.log('加入申请删除失败', err)
        }
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
