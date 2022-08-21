// pages/exportItem/exportItem.js
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        itemList: [],
        itemArray: {},
        itemIndex: 0,
        exportIndex: 0,
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
        scanQRCode(this)
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

    scanMoreItem() {
        scanQRCode(this)
    },

    onDeleteItem(e) {
        let itemList = this.data.itemList
        let itemArray = this.data.itemArray

        let i = itemList.indexOf(e.currentTarget.id)
        itemList.splice(i, 1)

        for(let j = i; j < itemList.length; j++) {
            itemArray[itemList[j]].index --
        }

        delete itemArray[e.currentTarget.id]

        this.setData({
            itemList: itemList,
            itemArray: itemArray,
            itemIndex: this.data.itemIndex - 1
        })
    },

    onReduceAmount(e) {
        let itemArray = this.data.itemArray
        
        if(itemArray[e.currentTarget.id].exportAmount > 1) {
            itemArray[e.currentTarget.id].exportAmount--
        }
        
        this.setData({
            itemArray: itemArray
        })
    },

    onIncreaseAmount(e) {
        let itemArray = this.data.itemArray
        
        if(itemArray[e.currentTarget.id].exportAmount < itemArray[e.currentTarget.id].subPackageQuantity) {
            itemArray[e.currentTarget.id].exportAmount++
        }
        
        this.setData({
            itemArray: itemArray
        })
    },

    onExportItem() {
        exprotItem(this)
    }
})

function playMusic() {
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.autoplay = true
    innerAudioContext.src = 'assets/beep.mp3'

    innerAudioContext.onPlay(() => {
        console.log('Start playback')
    })

    innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
    })
}

async function scanQRCode(page) {
    wx.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode'],
        success (res) {
            wx.showLoading({
                title: '查询中',
                mask: true
            })

            findItem(page, res.result)
        },
        complete() {
            playMusic()

            wx.vibrateShort({
                type: 'heavy'
            })
        }
    })
}

async function findItem(page, itemId) {
    var search_result = await getItem(itemId)

    if(search_result.success) {
        if(search_result.result.result.data.length == 1) {
            if(search_result.result.result.data[0]._id in page.data.itemArray) {
                wx.hideLoading()
                setTimeout(() => {
                    wx.showToast({
                        title: '物品重复',
                        icon: 'error',
                        duration: 2000
                    })
                }, 200)
            } else {
                var item = search_result.result.result.data[0]
                var itemList = page.data.itemList
                var itemArray = page.data.itemArray
    
                itemList.push(item._id)
                itemArray[item._id] = item
                itemArray[item._id].index = page.data.itemIndex

                if(item.containSubPackage) {
                    itemArray[item._id].exportAmount = 1
                }
    
                page.setData({
                    itemList: itemList,
                    itemArray: itemArray,
                    itemIndex: page.data.itemIndex + 1
                })
    
                wx.hideLoading()
                setTimeout(() => {
                    wx.showToast({
                        title: '查询成功',
                        icon: 'success',
                        duration: 1000
                    })
                }, 200)
            }
        } else {
            wx.hideLoading()
            setTimeout(() => {
                wx.showToast({
                    title: '无结果',
                    icon: 'error',
                    duration: 2000
                })
            }, 200)
        }
    } else {
        wx.hideLoading()
        setTimeout(() => {
            wx.showToast({
                title: '查询失败',
                icon: 'error',
                duration: 2000
            })
        }, 200)
    }
}

function getItem(itemId) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetRecord',
                collection_name: 'item',
                where_condition: {
                    _id: itemId,
                    available: true
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
                    result: err
                })
            }
        })
    })
}

function exprotItem(page) {
    wx.showLoading({
        title: '出库' + page.data.exportIndex + '/' + page.data.itemList.length,
        mask: true
    })

    for(let i = 0; i < page.data.itemList.length; i++) {
        if(page.data.itemArray[page.data.itemList[i]].containSubPackage) {
            updateSubPackageItem(page, page.data.itemList[i])
        } else {
            updateSingleItem(page, page.data.itemList[i])
        }
    }

    wx.hideLoading()
}

function updateSingleItem(page, itemId) {
    wx.cloud.callFunction({
        name: 'databaseAction',
        data: {
            type: 'dbUpdateRecord',
            collection_name: 'item',
            where_condition: {
                _id: itemId,
                available: true
            },
            update_data: {
                data:{
                    available: false
                }
            }
        },
        success: res => {       
            if(res.result.stats.updated == 1) {
                let currentIndex = page.data.exportIndex + 1

                wx.showLoading({
                    title: '出库' + currentIndex + '/' + page.data.itemList.length,
                    mask: true
                })

                page.setData({
                    exportIndex: currentIndex
                })

                if(currentIndex == page.data.itemList.length) {
                    wx.hideLoading()
                    setTimeout(() => {
                        wx.showToast({
                            title: '出库完成',
                            icon: 'success',
                            duration: 2000
                        })
    
                        setTimeout(() => {
                            wx.navigateBack()
                        }, 2500)
                    }, 200)
                }
            }
        },
        fail: err => {
            console.log(err)
        }
    })
}

function updateSubPackageItem(page, itemId) {
    var updateData = {}
    let updateItem = page.data.itemArray[itemId]

    if(updateItem.exportAmount == updateItem.subPackageQuantity) {
        updateData.available = false
        updateData.subPackageQuantity = 0
    } else {
        updateData.subPackageQuantity = updateItem.subPackageQuantity - updateItem.exportAmount
    }


    wx.cloud.callFunction({
        name: 'databaseAction',
        data: {
            type: 'dbUpdateRecord',
            collection_name: 'item',
            where_condition: {
                _id: itemId,
                available: true
            },
            update_data: {
                data: updateData
            }
        },
        success: res => {       
            if(res.result.stats.updated == 1) {
                let currentIndex = page.data.exportIndex + 1

                wx.showLoading({
                    title: '出库' + currentIndex + '/' + page.data.itemList.length,
                    mask: true
                })

                page.setData({
                    exportIndex: currentIndex
                })

                if(currentIndex == page.data.itemList.length) {
                    wx.hideLoading()
                    setTimeout(() => {
                        wx.showToast({
                            title: '出库完成',
                            icon: 'success',
                            duration: 2000
                        })
    
                        setTimeout(() => {
                            wx.navigateBack()
                        }, 2500)
                    }, 200)
                }
            }
        },
        fail: err => {
            console.log(err)
        }
    })
}
