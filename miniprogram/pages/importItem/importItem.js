// pages/importItem/importItem.js
const date = require('../../utils/date.js')
const bluetoothPrinter = require('../../utils/bluetoothPrinter.js')

const app = getApp()
var printer = app.globalData.printer

Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchCompleted: [false, false],
        filled: [false, false, false, true, false, false, false],
        itemName: '',
        showClearBtn_name: false,
        itemWeight: '',
        showClearBtn_weight: false,
        itemQuantity: '',
        showClearBtn_quantity: false,
        containSubPackage: false,
        subPackageQuantity: '',
        showClearBtn_subQuantity: false,
        mainCategoryArray: [],
        mainCategoryIdArray: [],
        subCategoryArray: [],
        subCategoryId: {},
        categoryArray: [[], []],
        categoryIndex: [0, 0],
        categorySelected: '点击选择分类',
        categorySelectedId: '',
        locationByName: {},
        locationById: {},
        locationArray: [],
        locationIndex: 0,
        locationSelected: '点击选择位置',
        locationSelectedId: '',
        showLocationError: false,
        expireDateEnabled: true,
        expireDateFilled: [false, false],
        today: '',
        itemProduceDate: '',
        itemExpireDate: '',
        enableExpireDateWarning: true,
        enableSubmit: false,
        updateDone: 0,
        updateTotall: 0,
        printerConnected: false,
        theme: 'light'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.setData({
            printerConnected: options.printerConnected,
            theme: wx.getSystemInfoSync().theme || 'light'
        })

        if (wx.onThemeChange) {
            wx.onThemeChange(({theme}) => {
                this.setData({theme})
            })
        }

        wx.showLoading({
            title: '加载中',
            mask: true
        })

        this.setData({
            today: date.dateInformat(new Date())
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
        getCategroyArray(this)
        getLocationArray(this)
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
            itemName: evt.detail.value,
            showClearBtn_name: evt.detail.value.length != 0,
            "filled[0]": evt.detail.value.length != 0
        })

        this.setData({
            enableSubmit: isFormCompleted(this)
        })
    },

    onClear_name() {
        this.setData({
            itemName: '',
            showClearBtn_name: false,
            "filled[0]": false,
            enableSubmit: false
        })
    },

    onInput_weight(evt) {
        this.setData({
            itemWeight: evt.detail.value,
            showClearBtn_weight: evt.detail.value.length != 0,
            "filled[1]": evt.detail.value.length != 0
        })

        this.setData({
            enableSubmit: isFormCompleted(this)
        })
    },

    onClear_weight() {
        this.setData({
            itemWeight: '',
            showClearBtn_weight: false,
            "filled[1]": false,
            enableSubmit: false
        })
    },

    onInput_quantity(evt) {
        this.setData({
            itemQuantity: evt.detail.value,
            showClearBtn_quantity: evt.detail.value.length != 0,
            "filled[2]": evt.detail.value.length != 0
        })

        this.setData({
            enableSubmit: isFormCompleted(this)
        })
    },

    onClear_quantity() {
        this.setData({
            itemQuantity: '',
            showClearBtn_quantity: false,
            "filled[2]": false,
            enableSubmit: false
        })
    },

    onContainSubPackageChange(e) {
        console.log('是否开启分批出库' + e.detail.value)

        this.setData({
            containSubPackage: e.detail.value
        })

        if(!e.detail.value) {
            this.setData({
                "filled[3]": true
            })
        } else {
            this.setData({
                "filled[3]": this.data.subPackageQuantity.length != 0
            })
        }

        this.setData({
            enableSubmit: isFormCompleted(this)
        })
    },

    onInput_subQuantity(evt) {
        this.setData({
            subPackageQuantity: evt.detail.value,
            showClearBtn_subQuantity: evt.detail.value.length != 0,
            "filled[3]": evt.detail.value.length != 0
        })

        this.setData({
            enableSubmit: isFormCompleted(this)
        })
    },

    onClear_subQuantity() {
        this.setData({
            subPackageQuantity: '',
            showClearBtn_subQuantity: false,
            "filled[3]": false,
            enableSubmit: false
        })
    },

    bindCategoryPickerChange(e) {
        let mainCategoryName = this.data.categoryArray[0][e.detail.value[0]]
        let subCategoryName = this.data.categoryArray[1][e.detail.value[1]]

        console.log('选择分类为 ' + mainCategoryName + ' | ' + subCategoryName)

        this.setData({
            categorySelected: mainCategoryName + ' | ' + subCategoryName,
            categoryIndex: e.detail.value,
            categorySelectedId: this.data.subCategoryId[subCategoryName],
            "filled[4]": true
        })

        this.setData({
            enableSubmit: isFormCompleted(this)
        })
    },

    bindCategoryPickerColumnChange: function (e) {
        if(e.detail.column == 0) {
            var categoryArray = []
            categoryArray.push(this.data.categoryArray[0])
            categoryArray.push(this.data.subCategoryArray[e.detail.value])

            var categoryIndex = []
            categoryIndex.push(e.detail.value)
            categoryIndex.push(0)

            this.setData({
                categoryArray: categoryArray,
                categoryIndex: categoryIndex
            })
        }
    },

    onAddCategory() {
        wx.navigateTo({
            url: '../categoryManage/viewCategory/viewCategory'
        })
    },

    bindLocationPickerChange(e) {
        let locationName = this.data.locationArray[e.detail.value]

        console.log('选择位置为 ' + locationName)

        this.setData({
            locationSelected: locationName,
            locationIndex: e.detail.value,
            locationSelectedId: this.data.locationByName[locationName],
            "filled[5]": true
        })

        this.setData({
            enableSubmit: isFormCompleted(this)
        })
    },

    onAddLocation() {
        wx.navigateTo({
            url: '../locationManage/locationManage'
        })
    },

    onScanLocation() {
        var that = this

        wx.scanCode({
            onlyFromCamera: true,
            scanType: ['qrCode'],
            success (res) {
                if(res.result in that.data.locationById) {
                    let locationName = that.data.locationById[res.result]
                    let locationIndex = 0

                    for(let i = 0; i < that.data.locationArray.length; i++) {
                        if(locationName == that.data.locationArray[i]) {
                            locationIndex = i
                        }
                    }

                    console.log('选择位置为 ' + locationName)

                    that.setData({
                        locationSelected: locationName,
                        locationIndex: locationIndex,
                        locationSelectedId: res.result,
                        "filled[5]": true
                    })

                    that.setData({
                        enableSubmit: isFormCompleted(that)
                    })
                } else {
                    console.log('未找到对应的存储位置')
                    
                    that.setData({
                        showLocationError: true
                    })
                }
            },
            complete() {
                wx.vibrateShort({
                    type: 'heavy'
                })
    
                playMusic()
            }
        })
    },

    closeLocationError() {
        this.setData({
            showLocationError: false
        })
    },

    onExpireDateEnabledChange(e) {
        console.log('是否开启保质期设置' + e.detail.value)

        this.setData({
            expireDateEnabled: e.detail.value
        })

        if(!e.detail.value) {
            this.setData({
                "filled[6]": true,
                enableExpireDateWarning: false
            })
        } else {
            this.setData({
                "filled[6]": this.data.itemExpireDate.length != 0,
                enableExpireDateWarning: true
            })
        }

        this.setData({
            enableSubmit: isFormCompleted(this)
        })
    },

    bindProduceDateChange(e) {
        console.log('选择生产日期 ' + e.detail.value)

        this.setData({
            itemProduceDate: e.detail.value,
            "expireDateFilled[0]": true
        })
    },

    bindExpireDateChange(e) {
        console.log('选择有效值至 ' + e.detail.value)

        this.setData({
            itemExpireDate: e.detail.value,
            "filled[6]": true,
            "expireDateFilled[1]": true
        })

        this.setData({
            enableSubmit: isFormCompleted(this)
        })
    },

    onExpireWarningEnabledChange(e) {
        console.log('是否开启保质期提醒' + e.detail.value)

        this.setData({
            enableExpireDateWarning: e.detail.value
        })
    },

    onConfirm() {
        var that = this

        if(this.data.enableExpireDateWarning) {
            wx.requestSubscribeMessage({
                tmplIds: ['xt6H-ATzVVP2eoLS25X1uI5OEI9qMob62XikSLbPu5s', '7WkFbK3kJGCIWEedkAf1_DihpHuk62Oh0yLy7qjHaUU'],
                success (res) {
                    addItem(that)
                }
            })
        } else {
            wx.requestSubscribeMessage({
                tmplIds: ['7WkFbK3kJGCIWEedkAf1_DihpHuk62Oh0yLy7qjHaUU'],
                success (res) {
                    addItem(that)
                }
            })
        }

        
    }
})

function isSearchCompleted(page) {   
    for(let i = 0; i < page.data.searchCompleted.length; i++) {
        if(!page.data.searchCompleted[i]) {
            return false
        }
    }

    return true
}

function isExpireDateCompleted(page) {   
    for(let i = 0; i < page.data.expireDateFilled.length; i++) {
        if(!page.data.expireDateFilled[i]) {
            return false
        }
    }

    return true
}

function isFormCompleted(page) {   
    for(let i = 0; i < page.data.filled.length; i++) {
        if(!page.data.filled[i]) {
            return false
        }
    }

    return true
}

async function getCategroyArray(page) {
    console.log('开始获取主分类信息')
    var searchMainCategory_result = await searchCategory(0)

    if (searchMainCategory_result.success) {
        console.log('主分类获取成功', searchMainCategory_result.result)
        sortMainCategory(page, searchMainCategory_result.result.result.data)

        console.log('开始获取子分类信息')
        var searchSubCategory_result = await searchCategory(1)

        if (searchSubCategory_result.success) {
            console.log('子分类获取成功', searchSubCategory_result.result)
            sortSubCategory(page, searchSubCategory_result.result.result.data)
        } else {
            getCategroyArray(page)
        }
    } else {
        getCategroyArray(page)
    }
}

function searchCategory(level) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetCategory',
                warehouseId: app.globalData.current_warehouseId,
                categoryLevel: level
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

function sortMainCategory(page, data) {
    var mainCategoryArray = []
    var mainCategoryIdArray = []

    for(let i = 0; i < data.length; i++) {
        mainCategoryArray.push(data[i].categoryName)
        mainCategoryIdArray.push(data[i]._id)
    }

    page.setData({
        mainCategoryArray: mainCategoryArray,
        mainCategoryIdArray: mainCategoryIdArray
    })
}

function sortSubCategory(page, data) {
    var mainCategoryIdArray = page.data.mainCategoryIdArray
    var subCategoryArray = []
    var subCategoryId = {}
    var categoryArray = []

    for(let i = 0; i < mainCategoryIdArray.length; i++) {
        subCategoryArray.push([])
    }

    for(let i = 0; i < data.length; i++) {
        let mainCategoryIndex = mainCategoryIdArray.indexOf(data[i].mainCategoryId)

        subCategoryArray[mainCategoryIndex].push(data[i].categoryName)
        subCategoryId[data[i].categoryName] = data[i]._id
    }

    categoryArray.push(page.data.mainCategoryArray)
    categoryArray.push(subCategoryArray[0])

    page.setData({
        subCategoryArray: subCategoryArray,
        subCategoryId: subCategoryId,
        categoryArray: categoryArray,
        "searchCompleted[0]": true
    })

    if(isSearchCompleted(page)) {
        wx.hideLoading()
    }
}

async function getLocationArray(page) {
    console.log('开始获取存储位置信息')
    var searchLocation_result = await searchLocation()

    if (searchLocation_result.success) {
        console.log('存储位置获取成功', searchLocation_result.result)
        sortLocation(page, searchLocation_result.result.result.data)
    } else {
        getLocationArray(page)
    }
}

function searchLocation() {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: 'databaseAction',
            data: {
                type: 'dbGetLocation',
                warehouseId: app.globalData.current_warehouseId
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

function sortLocation(page, data) {
    var locationArray = []
    var locationByName = {}
    var locationById = {}

    for(let i = 0; i < data.length; i++) {
        locationArray.push(data[i].locationName)
        locationByName[data[i].locationName] = data[i]._id
        locationById[data[i]._id] = data[i].locationName
    }

    page.setData({
        locationArray: locationArray,
        locationByName: locationByName,
        locationById: locationById,
        "searchCompleted[1]": true
    })

    if(isSearchCompleted(page)) {
        wx.hideLoading()
    }
}

async function addItem(page) {
    console.log('开始上传物品信息')
    var item_data = {
        available: true,
        itemName: page.data.itemName,
        itemWeight: page.data.itemWeight,
        containSubPackage: page.data.containSubPackage,
        categoryId: page.data.categorySelectedId,
        locationId: page.data.locationSelectedId,
        expireDateEnabled: page.data.expireDateEnabled,
        enableExpireDateWarning: page.data.enableExpireDateWarning,
        itemEnterDate: page.data.today,
        uploadUser: app.globalData.openid
    }

    if(item_data.containSubPackage) {
        item_data.subPackageQuantity = parseInt(page.data.subPackageQuantity)
    }

    if(item_data.expireDateEnabled) {
        item_data.itemProduceDate = page.data.itemProduceDate,
        item_data.itemExpireDate = page.data.itemExpireDate
    }

    var compeleted = []

    page.setData({
        updateTotall: parseInt(page.data.itemQuantity)
    })

    wx.showLoading({
        title: '上传' + page.data.updateDone + '/' + page.data.updateTotall,
        mask: true
    })

    for(let i = 0; i < parseInt(page.data.itemQuantity); i++) {
        uploadItem(page, item_data, compeleted, parseInt(page.data.itemQuantity))
    }
}

function uploadItem(page, item_data, compeleted, target) {
    wx.cloud.callFunction({
        name: 'databaseAction',
        data: {
            type: 'dbAddRecord',
            collection_name: 'item',
            add_data: item_data
        },
        success: res => {
            // return the result if successed
            compeleted.push(res.result._id)

            page.setData({
                updateDone: page.data.updateDone + 1
            })

            wx.showLoading({
                title: '上传' + page.data.updateDone + '/' + page.data.updateTotall,
                mask: true
            })

            if(compeleted.length == target) {

                if(printer.getconnectionstate()) {
                    printLabel(page, compeleted)
                }
                
                wx.hideLoading()
    
                setTimeout(() => {
                    wx.showToast({
                        title: '上传成功',
                        icon: 'success',
                        duration: 2000
                    })

                    setTimeout(() => {
                        wx.navigateBack()
                    }, 2500)
                }, 200)
            }
        },
        fail: err => {
            // if failed to use cloud function dbAdd
            console.log(err)
        }
    })
}

function printLabel(page, compeleted) {
    if(page.data.containSubPackage) {
        if(page.data.expireDateEnabled) {
            for(let i = 0; i < compeleted.length; i++) {
                bluetoothPrinter.printItem(printer, compeleted[i], page.data.itemName, page.data.itemWeight, page.data.subPackageQuantity, page.data.today, page.data.itemExpireDate, i + 1, compeleted.length)
            }
        } else {
            for(let i = 0; i < compeleted.length; i++) {
                bluetoothPrinter.printItem(printer, compeleted[i], page.data.itemName, page.data.itemWeight, page.data.subPackageQuantity, page.data.today, "长期", i + 1, compeleted.length)
            }
        }
    } else {
        if(page.data.expireDateEnabled) {
            for(let i = 0; i < compeleted.length; i++) {
                bluetoothPrinter.printItem(printer, compeleted[i], page.data.itemName, page.data.itemWeight, 1, page.data.today, page.data.itemExpireDate, i + 1, compeleted.length)
            }
        } else {
            for(let i = 0; i < compeleted.length; i++) {
                bluetoothPrinter.printItem(printer, compeleted[i], page.data.itemName, page.data.itemWeight, 1, page.data.today, "长期", i + 1, compeleted.length)
            }
        }
    }
}

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
