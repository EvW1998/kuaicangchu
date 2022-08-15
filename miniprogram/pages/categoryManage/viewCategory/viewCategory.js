// pages/categoryManage/viewCategory/viewCategory.js
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        mainCategoryList: [],
        subCategory: {},
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
        let categoryList = this.data.mainCategoryList

        for(let i = 0; i < categoryList.length; i++) {
            if(e.currentTarget.id == categoryList[i].id) {
                categoryList[i].open = !categoryList[i].open
            }
        }

        this.setData({
            mainCategoryList: categoryList
        })
    },

    onAddCategory() {
        wx.navigateTo({
            url: '../addCategory/addCategory'
        })
    },

    onAddSubCategory(e) {
        var categoryName = ''
        let categoryList = this.data.mainCategoryList

        for(let i = 0; i < categoryList.length; i++) {
            if(categoryList[i].id == e.currentTarget.id) {
                categoryName = categoryList[i].name
                break
            }
        }

        wx.navigateTo({
            url: '../addSubCategory/addSubCategory?mainCategoryId=' + e.currentTarget.id + '&mainCategoryName=' + categoryName
        })
    }
})

async function getCategory(page) {
    wx.showNavigationBarLoading()
    console.log('开始获取主分类')

    var search_result = await searchCategory()
    
    if (search_result.success) {
        console.log('主分类获取成功', search_result.result)
        sortCategory(page, search_result.result.result.data)

        console.log('开始获取子分类')
        var search_sub_result = await searchSubCategory()

        if (search_sub_result.success) {
            console.log('子分类获取成功', search_sub_result.result)
            sortSubCategory(page, search_sub_result.result.result.data)
            wx.hideNavigationBarLoading()
        } else {
            getCategory(page)
        }
    } else {
        getCategory(page)
    }
}

function searchCategory() {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetCategory',
                warehouseId: app.globalData.current_warehouseId,
                categoryLevel: 0
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

function searchSubCategory() {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetCategory',
                warehouseId: app.globalData.current_warehouseId,
                categoryLevel: 1
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

function sortCategory(page, data) {
    var curr_categoryList = []
    
    for(let i = 0; i < data.length; i++) {
        curr_categoryList.push({
            id: data[i]._id,
            name: data[i].categoryName,
            open: true
        })
    }

    page.setData({
        mainCategoryList: curr_categoryList
    })
}

function sortSubCategory(page, data) {
    var curr_subCategory = {}
    
    for(let i = 0; i < data.length; i++) {
        if (data[i].mainCategoryId in curr_subCategory) {
            curr_subCategory[data[i].mainCategoryId].push({
                id: data[i]._id,
                name: data[i].categoryName
            })
        } else {
            curr_subCategory[data[i].mainCategoryId] = []

            curr_subCategory[data[i].mainCategoryId].push({
                id: data[i]._id,
                name: data[i].categoryName
            })
        }
        
    }

    page.setData({
        subCategory: curr_subCategory
    })
}
