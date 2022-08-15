// pages/categoryManage/addSubCategory/addSubCategory.js
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        mainCategoryName: '',
        mainCategoryId: '',
        subCategory_name: '',
        showClearBtn_name: false,
        enableSubmit: false,
        isNameWaring: false,
        showNameError: false,
        theme: 'light'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            mainCategoryId: options.mainCategoryId,
            mainCategoryName: options.mainCategoryName,
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

    onInput_name(evt) {
        this.setData({
            subCategory_name: evt.detail.value,
            showClearBtn_name: evt.detail.value.length != 0,
            enableSubmit: evt.detail.value.length != 0,
            isNameWaring: false
        })
    },

    onClear_name() {
        this.setData({
            subCategory_name: '',
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


    onConfirm() {
        confirmAddSubCategory(this)
    }
})

async function confirmAddSubCategory(page) {
    console.log('开始验证子分类名称')
    wx.showLoading({
        title: '添加中',
        mask: true
    })

    var check_result = await checkSubCategoryName(page.data.subCategory_name, page.data.mainCategoryId)
    
    if (check_result.success) {
        console.log('验证子分类名称', check_result.result)

        if (check_result.result.result.total != 0) {
            console.log('子分类名称重复')
            wx.hideLoading()
            page.setData({
                enableSubmit: false,
                isNameWaring: true,
                showNameError: true
            })
        } else {
            console.log('子分类名称通过验证')
            let category_data = {
                warehouse_id: app.globalData.current_warehouseId,
                mainCategoryId: page.data.mainCategoryId,
                categoryName: page.data.subCategory_name,
                categoryLevel: 1
            }
        
            var add_result = await addSubCategory(category_data)

            if (add_result.success) {
                console.log('子分类添加成功', add_result.result)
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
                console.log('子分类添加失败', add_result.result)
        
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
        console.log('验证子分类名称失败', check_result.result)

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

function checkSubCategoryName(subCategory_name, mainCategoryId) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbCountRecord',
                collection_name: 'category',
                where_condition: {
                    categoryLevel: 1,
                    categoryName: subCategory_name,
                    warehouse_id: app.globalData.current_warehouseId,
                    mainCategoryId: mainCategoryId
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

function addSubCategory(category_data) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbAddRecord',
                collection_name: 'category',
                add_data: category_data
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
