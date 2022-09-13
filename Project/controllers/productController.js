const { Types, default: mongoose } = require('mongoose')
const { response } = require('../app')
const product = require('../data/product')
const { db } = require('../models/product')
const Product = require('../models/product')
const Cart = require('../models/userCart')
const Order = require('../models/order')
const Address = require('../models/address')
const Category = require('../models/category')


module.exports= {
    addProduct:(product)=>{
        return new Promise (async(resolve,reject)=>{
            await new Product({...product}).save().then((data)=>{
                resolve(data._id)
        })   
        })
    },
    findProduct:()=>{
        return new Promise (async(resolve,reject)=>{
            await Product.find().then((data)=>{
                resolve(data)
            })
        })
    },
    findCategory:()=>{
        return new Promise (async(resolve,reject)=>{
            await Category.find().then((response)=>{
                resolve(response)
            })
        })
    },
    deleteProduct:(id)=>{
        return new Promise (async(resolve,reject)=>{
            let softdelete = await Product.findByIdAndUpdate({_id:Types.ObjectId(id)},{$set:{isDeleted:true}})
            resolve(softdelete)
        })
    },
    updateProduct:(id)=>{
        return new Promise (async(resolve,reject)=>{
            await Product.findById(id).then((data)=>{
                resolve(data)
            })
        })
    },
    updatedProduct:(updatedData,id)=>{
        const {name, description, category, price} = updatedData;
        return new Promise (async(resolve,reject)=>{
        await Product.updateOne({_id: Types.ObjectId(id)},{$set: {
            name: name,
            description: description,
            category: category,
            price: price,
        }}).then((data)=>{
                resolve(data._id)
            })
        })
    },
    getAllProducts:()=>{
        return new Promise (async(resolve,reject)=>{
            await Product.find().then((data)=>{
                resolve(data)
            })
        })
    },
    productDetails:(id)=>{
        return new Promise (async(resolve,reject)=>{
            await Product.findById(id).then((data)=>{
                resolve(data)
            })
        })
    },
    addToCart:(productId,userId)=>{
        let productadd ={
            item:Types.ObjectId(productId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            
            let userCart = await Cart.findOne({user:Types.ObjectId(userId)})
            
            if (userCart) {
                const alreadyExists = userCart.products.findIndex(product => product.item == productId)
                if(alreadyExists === -1 ){
                    const adding = await Cart.updateOne(
                        {
                            user:Types.ObjectId(userId)
                        },{
                            $push:{products:{item:Types.ObjectId(productId),quantity:1}}
                        }).then((response)=>{
                            resolve(response)
                        })
                }else{
                    await Cart.updateOne({'user':Types.ObjectId(userId),'products.item':Types.ObjectId(productId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then((response)=>{
                        resolve(response)
                    })
                }
            } else {
                let newCart ={ 
                    user : userId,
                    products:[productadd]
                }
                await Cart(newCart).save().then((response)=>{
                    resolve(response)
                })
            } 
           
            
        })
    },
    getCartProducts:(userId)=>{
            return new Promise (async(resolve,reject)=>{
            let cartitems = await Cart.aggregate([{
                $match:{user: mongoose.Types.ObjectId(userId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:'products',
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    item:1,
                    quantity:1,
                    product:{ $arrayElemAt:['$product',0]}
                }
            },
            
        ]).then((cart)=>{
           resolve(cart) 
        })
        })
    },
    deleteCart:(productId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderlist = await Cart.updateOne({user:Types.ObjectId(userId),"products.item":Types.ObjectId(productId) },{$pull:{products:{item:Types.ObjectId(productId)}}})
            console.log(orderlist);
            resolve(orderlist)
        })
    },
    getCartProductList:(userId)=>{
        return new Promise (async(resolve ,reject)=>{
            let cart = await Cart.findOne({user:Types.ObjectId(userId)})
            if (cart) {
                resolve(cart.products)
            }else{
                resolve('your cart is empty')
            }
            
        })
    },
    getOrderProducts:(orderId)=>{
        return new Promise (async(resolve,reject)=>{
            let orderitems = await Order.aggregate([{
                $match:{_id: mongoose.Types.ObjectId(orderId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:'products',
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    item:1,
                    quantity:1,
                    product:{ $arrayElemAt:['$product',0]}
                }
            },
            
        ]).then((orderitems)=>{
            resolve(orderitems)
        })
        
        
        })
    },
    getorderId:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderId = await Order.findById({user:(userId)})
            console.log(orderId);
            resolve(orderId)
        })
    },
    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await Order.find({userId:mongoose.Types.ObjectId(userId)})
            resolve(orders)
        })
    },
    cancelOrder:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderC = await Order.findByIdAndUpdate({_id:Types.ObjectId(orderId)},{$set:{ordercanceled:true}})
            resolve(orderC)
        })
    },
    cancelOrderadmin:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderC = await Order.findByIdAndUpdate({_id:Types.ObjectId(orderId)},{$set:{ordercanceled:true}})
            resolve(orderC)
        })
    },
    changeOrderStatus:(orderId)=>{
        return new Promise (async(resolve,reject)=>{
            let orderstatuschanged = await Order.findByIdAndUpdate({_id:Types.ObjectId(orderId)},{$set:{status:'placed'}})
            resolve(orderstatuschanged)
        })
    },
    addAddress:(firstname,lastname,address,town,state,pincode,userId)=>{
        let saveaddress = {
            userId:Types.ObjectId(userId),
            firstname:firstname,
            lastname:lastname,
            address:address,
            town:town,
            state:state,
            pincode:pincode,
        }
        return new Promise (async(resolve,reject)=>{
            let addedAddress = await Address(saveaddress).save();
            resolve(addedAddress)
        })
    },
    removeAddress:(addressId)=>{
        return new Promise (async(resolve,reject)=>{
            let removeAddress = await Address.findByIdAndRemove(addressId)
            console.log(removeAddress);
            resolve(removeAddress)
        })
        
    }
}

    