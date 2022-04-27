// pages/updateUserNickname/updateUserNickname.js
const app = getApp()
const db_user = 'user' // the database collection of users

Page({

    /**
     * 页面的初始数据
     */
    data: {
        user_nickname: '',
        nickname_input: '',
        showClearBtn: true,
        enableSubmit: false,
        loading: false,
        hideLoading: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            user_nickname: app.globalData.userInfo.nickName,
            nickname_input: app.globalData.userInfo.nickName
        })
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

    onInput_nickName(evt) {
        this.setData({
            nickname_input: evt.detail.value,
            showClearBtn: evt.detail.value.length != 0,
            enableSubmit: evt.detail.value.length != 0
        })
    },

    onClear_nickName() {
        this.setData({
            nickname_input: '',
            showClearBtn: false,
            enableSubmit: false
        });
    },

    onConfirm() {
        if (this.data.nickname_input != this.data.user_nickname) {
            changeNickname(this)
        } else {
            wx.navigateBack()
        }
    }
})

async function changeNickname(page) {
    console.log('开始将用户新昵称同步至云端数据库')
    wx.showLoading({
        title: '上传中',
        mask: true
    })

    var update_data = {
        data: {
            user_nickname: page.data.nickname_input
        }
    }

    var update_result = await updateUserNickName(update_data)
    if (update_result.success) {
        console.log('昵称同步至云端数据库成功', update_result.result)

        app.globalData.userInfo.nickName =  page.data.nickname_input
        wx.setStorageSync('userInfo', app.globalData.userInfo)

        wx.hideLoading()

        setTimeout(() => {
            wx.showToast({
                title: '更改成功',
                icon: 'success',
                duration: 2000
            })
        
            setTimeout(() => {
                const eventChannel = page.getOpenerEventChannel()
                eventChannel.emit('acceptNewNickname')
                wx.navigateBack()
            }, 2500)
        }, 200)
    } else {
        console.log('昵称同步至云端数据库失败', update_result.result)

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
