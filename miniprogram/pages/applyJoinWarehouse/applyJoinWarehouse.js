// pages/applyJoinWarehouse/applyJoinWarehouse.js
const date = require('../../utils/date.js')

const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        inviteCode: '',
        target_warehouseId: '',
        showClearBtn_code: false,
        enableSubmit: false,
        warningText: '',
        isInviteCodeWaring: false,
        errorText: '',
        showInviteCodeError: false,
        joinText: '',
        showJoinConfirm: false,
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

    onInput_code(evt) {
        this.setData({
            inviteCode: evt.detail.value,
            showClearBtn_code: evt.detail.value.length != 0,
            enableSubmit: evt.detail.value.length != 0,
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
        confirmWarehouse(this)
    },

    closeInviteCodeError() {
        this.setData({
            showInviteCodeError: false
        })
    },

    closeJoinConfirm() {
        this.setData({
            showJoinConfirm: false
        })
    },

    confirmJoin() {
        let that = this

        wx.requestSubscribeMessage({
            tmplIds: ['RnEcVwcJ6Gx71GODfUJ_vb9qwxEaO0daAa4kjUbhNBQ'],
            success (res) {
                addJoinRequest(that)
            }
        })
    }
})

async function confirmWarehouse(page) {
    console.log('开始验证邀请码')
    wx.showLoading({
        title: '验证邀请码中',
        mask: true
    })

    var check_result = await checkInviteCode(page.data.inviteCode)
    
    if (check_result.success) {
        console.log('验证邀请码', check_result.result)

        if (check_result.result.result.data.length == 0) {
            console.log('验证码无效')
            wx.hideLoading()
            page.setData({
                enableSubmit: false,
                warningText: '邀请码无效',
                isInviteCodeWaring: true,
                errorText: '输入的仓库邀请码无效！',
                showInviteCodeError: true
            })
        } else if (!check_result.result.result.data[0].verified) {
            console.log('该仓库未通过审核')
            let warehouse_name = check_result.result.result.data[0].warehouseName
            wx.hideLoading()
            page.setData({
                enableSubmit: false,
                warningText: '“ ' + warehouse_name + ' ”仓库未通过审核',
                isInviteCodeWaring: true,
                errorText: '“ ' + warehouse_name + ' ”仓库未通过审核！',
                showInviteCodeError: true
            })
        } else if (check_result.result.result.data[0]._id in app.globalData.warehouseList) {
            console.log('已经加入该仓库')
            let warehouse_name = check_result.result.result.data[0].warehouseName
            wx.hideLoading()
            page.setData({
                enableSubmit: false,
                warningText: '已加入“ ' + warehouse_name + ' ”仓库',
                isInviteCodeWaring: true,
                errorText: '您已加入“ ' + warehouse_name + ' ”仓库，请勿重复添加！',
                showInviteCodeError: true
            })
        } else {
            console.log('已经加入该仓库')
            let warehouse_name = check_result.result.result.data[0].warehouseName
            wx.hideLoading()
            page.setData({
                target_warehouseId: check_result.result.result.data[0]._id,
                joinText: '确认要申请加入“ ' + warehouse_name + ' ”仓库吗？',
                showJoinConfirm: true
            })
        }
    } else {
        console.log('验证邀请码失败', check_result.result)

        wx.hideLoading()
        setTimeout(() => {
            wx.showToast({
                title: '验证失败',
                icon: 'error',
                duration: 2000
            })
        }, 200)
    }
}

function checkInviteCode(inviteCode) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetRecord',
                collection_name: 'warehouse',
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

async function addJoinRequest(page) {
    console.log('开始上传申请')
    wx.showLoading({
        title: '上传申请中',
        mask: true
    })

    let join_warehouse_data = {
        applicant_id: app.globalData.openid,
        applicant_nickName: app.globalData.userInfo.nickName,
        target_warehouseId: page.data.target_warehouseId,
        apply_date: date.dateInformat(new Date())
    }

    var add_result = await addRequest(join_warehouse_data)

    if (add_result.success) {
        console.log('加入申请提交成功', add_result.result)
        wx.hideLoading()

        setTimeout(() => {
            wx.showToast({
                title: '申请提交成功',
                icon: 'success',
                duration: 2000
            })
        
            setTimeout(() => {
                wx.navigateBack()
            }, 2500)
        }, 200)
    } else {
        console.log('加入申请提交失败', add_result.result)

        wx.hideLoading()
        setTimeout(() => {
            wx.showToast({
                title: '申请提交失败',
                icon: 'error',
                duration: 2000
            })
        }, 200)
    }
}

function addRequest(join_data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbAddRecord',
                collection_name: 'joinRequest',
                add_data: join_data
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
