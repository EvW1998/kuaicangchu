// pages/welcome/welcome.js
const app = getApp()
const db_user = 'user' // the database collection of users

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showLoading: true,
        showOpenIdError: false,
        hasOpenId: false,
        userInfo: {},
        hasUserInfo: false,
        canIUseGetUserProfile: false,
        theme: 'light'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        console.log('读取本地用户数据失败，尝试在线获得')
        wx.hideHomeButton()
        
        this.setData({
            theme: wx.getSystemInfoSync().theme || 'light'
        })
    
        if (wx.onThemeChange) {
            wx.onThemeChange(({theme}) => {
                this.setData({theme})
            })
        }

        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true
            })
        }

        if (!app.globalData.hasOpenId) {
            console.log('用户openid缺失')
            if (app.globalData.hasUserInfo) {
                this.setData({
                    userInfo: app.globalData.userInfo,
                    hasUserInfo: app.globalData.hasUserInfo
                })
            }

            // case of without openid
            getOpenIdFromCloud(this)
        } else if (!app.globalData.hasUserInfo) {
            // case of without userinfo
            console.log('用户userinfo缺失')
            this.setData({
                hasOpenId: true,
                showLoading: false
            })
        } else {
            console.log('本地读取延迟，用户信息完整')
            wx.switchTab({
                url: '../inOut/inOut'
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

    getUserProfile(e) {
        console.log('使用 getUserProfile 获取用户头像昵称')
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        wx.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                console.log('获取用户信息成功', res)
                var userInfo_simplified = {
                    avatarUrl: res.userInfo.avatarUrl,
                    nickName: res.userInfo.nickName
                }

                this.setData({
                    userInfo: userInfo_simplified,
                    hasUserInfo: true
                })
                app.globalData.userInfo = userInfo_simplified
                app.globalData.hasUserInfo = true
                wx.setStorageSync('userInfo', userInfo_simplified)

                addUserToDatabase(this)
            },
            fail: (res) => {
                console.log('获取用户信息失败', res)
            }
        })
    },

    getUserInfo(e) {
        console.log('使用 getUserInfo 获取用户头像昵称')
        // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })

        app.globalData.userInfo = e.detail.userInfo
        app.globalData.hasUserInfo = true
        wx.setStorageSync('userInfo', e.detail.userInfo)

        wx.switchTab({
            url: '../inOut/inOut'
        })
    },

    closeOpenIdError() {
        this.setData({
            showOpenIdError: false
        })

        getOpenIdFromCloud(this)
    }
})

async function getOpenIdFromCloud(page) {
    console.log('开始调用云函数获取用户OpenId')
    var openId_result = await getOpenId()
    
    if (openId_result.success) {
        app.globalData.openid = openId_result.result
        app.globalData.hasOpenId = true
        wx.setStorageSync('openid', openId_result.result)
        console.log('获取用户OpenId成功', openId_result.result)

        page.setData({
            hasOpenId: true,
            showLoading: false
        })

        // case that has userinfo without openid
        if (app.globalData.hasUserInfo) {
            page.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: app.globalData.hasUserInfo
            })

            wx.switchTab({
                url: '../inOut/inOut'
            })
        }
    } else {
        console.log('获取用户OpenId时发生错误', openId_result.result)

        page.setData({
            showOpenIdError: true
        })
    }
}

function getOpenId() {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'getOpenId',
            config: {}
        }).then((resp) => {
            resolve({
                success: true,
                result: resp.result.openid
            })
        }).catch((e) => {
            resolve({
                success: false,
                result: e
            })
        })
    })
}

async function addUserToDatabase(page) {
    page.setData({
        showLoading: true
    })

    console.log('开始查询用户是否已经注册')
    var search_result = await searchUser()
    
    if (search_result.result.data.length == 0) {
        console.log('未查找到用户注册记录，开始注册新用户')

        var add_user_data = {
            _id: app.globalData.openid,
            user_nickname: app.globalData.userInfo.nickName,
            hasWarehouse: false,
            warehouses: []
        }
    
        var add_result = await addNewUser(add_user_data)
        console.log('新用户注册成功', add_result)

        wx.setStorageSync('hasWarehouse', {value: false})

    } else {
        console.log('用户已注册，开始同步用户信息', search_result.result.data[0])

        var cloud_userInfo = search_result.result.data[0]

        app.globalData.hasWarehouse = cloud_userInfo.hasWarehouse
        app.globalData.userInfo.nickName = cloud_userInfo.user_nickname
        //app.globalData.current_warehouseId = cloud_userInfo.warehouses[0]

        wx.setStorageSync('userInfo', app.globalData.userInfo)
        wx.setStorageSync('hasWarehouse', {value: cloud_userInfo.hasWarehouse})
        //wx.setStorageSync('last_warehouseId', cloud_userInfo.warehouses[0])

        console.log('同步用户信息成功')
    }

    page.setData({
        showLoading: false
    })

    wx.switchTab({
        url: '../inOut/inOut'
    })
}

function searchUser() {
    return new Promise((resolve, reject) => {
        // call dbAdd() cloud function to add the user to the user collection
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetRecord',
                collection_name: db_user,
                where_condition: {_id: app.globalData.openid}
            },
            success: res => {
                // return the result if successed
                resolve(res)
            },
            fail: err => {
                // if failed to use cloud function dbAdd
                resolve(err)
            }
        })
    })
}

function addNewUser(user_data) {
    return new Promise((resolve, reject) => {
        // call dbAdd() cloud function to add the user to the user collection
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbAddRecord',
                collection_name: db_user,
                add_data: user_data
            },
            success: res => {
                // return the result if successed
                resolve(res)
            },
            fail: err => {
                // if failed to use cloud function dbAdd
                resolve(err)
            }
        })
    })
}
