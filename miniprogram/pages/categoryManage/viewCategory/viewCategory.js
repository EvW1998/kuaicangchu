// pages/categoryManage/viewCategory/viewCategory.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        menu_userInfo: {
            id: 'userInfo',
            name: '用户信息设置',
            open: false
        },
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
        getCategory(this)
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

    kindToggle(e) {
        if (e.currentTarget.id == this.data.menu_userInfo.id) {
            this.setData({
                'menu_userInfo.open': !this.data.menu_userInfo.open
            })
        }
    },

    onAddCategory() {
        wx.navigateTo({
            url: '../addCategory/addCategory'
        })
    },

    onAddSubCategory() {
        console.log('add subcategory')
    }
})

async function getCategory(page) {
    wx.showNavigationBarLoading()
    console.log('开始获取主分类')

    var total_result = []

    var search_result = await searchCategory()
    
    if (search_result.success) {
        console.log('主分类获取成功', search_result.result)
        sortLocation(page, search_result.result.result.data)
    } else {
        getLocation(page)
    }
}

function searchCategory(skip) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetLocation',
                warehouseId: app.globalData.current_warehouseId,
                limit: 2,
                skip: skip
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
