var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
var objId = require('mongodb').ObjectID
const { ObjectID, ObjectId } = require('mongodb')
const { response } = require('express')
const moment = require('moment')
module.exports = {
    getTotalOrderNum: () => {
        let orderNum = {}
        return new Promise(async (resolve, reject) => {
            orderNum.totalOrders = await db.get().collection(collection.ORDER_COLLECTION).find().count()
            orderNum.readyToship = await db.get().collection(collection.ORDER_COLLECTION).find({ status: 'placed', ship: 'Not Dispatched' }).count()
            orderNum.completedOrder = await db.get().collection(collection.ORDER_COLLECTION).find({ ship: 'Order Dispatched' }).count()
            orderNum.cancelOrder = await db.get().collection(collection.ORDER_COLLECTION).find({ ship: 'Order Cancelled' }).count()
            if (orderNum == null) {
                reject()
            } else {
                orderNum.readyToshipPers = ((orderNum.totalOrders - (orderNum.totalOrders - orderNum.readyToship)) / orderNum.totalOrders) * 100
                orderNum.completedOrderPers = ((orderNum.totalOrders - (orderNum.totalOrders - orderNum.completedOrder)) / orderNum.totalOrders) * 100
                orderNum.cancelOrderPers = ((orderNum.totalOrders - (orderNum.totalOrders - orderNum.cancelOrder
                )) / orderNum.totalOrders) * 100
                console.log('operations', 'alldata', orderNum);
                resolve(orderNum)
            }

        })
    }
}