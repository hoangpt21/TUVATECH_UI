import storage from 'redux-persist/lib/storage' // bản chất là đc kết nối với localstorage để lưu
import { configureStore } from '@reduxjs/toolkit'
import  {accountReducer}  from './user/accountSlice'
import { userReducer } from './user/usersSlice'
import { combineReducers } from 'redux' // module này có trong gói redux-toolkit
import { persistReducer } from 'redux-persist'
import { addressReducer } from './address/addressSlice'
import { categoryReducer } from './category/categorySlice'
import { brandReducer } from './brand/brandSlice'
import { productReducer, productAttributeReducer} from './product' 
import { imageReducer } from './image/imageSlice'
import { newsReducer } from './news/newsSlice'
import { couponReducer } from './coupon/couponSlice'
import {orderReducer} from './order/orderSlice'
import {orderItemReducer} from './order/orderItemSlice'
import { bannerReducer } from './banner/bannerSlice'
import { reviewReducer } from './review/reviewSlice'
import {cartReducer} from './cart/cartSlice'
import {importReducer} from './import/importSlice'
import { importDetailReducer } from './import/importDetailSlice'
import { userCouponReducer } from './coupon/userCouponSlice'

const rootPersistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['account'] // list các key(tên các slice) ĐƯỢC PHÉP duy trì dữ liệu qua mỗi lần f5 = bản chất là đc lưu vào localstorage 
}

//Kết hợp/ tổng hợp các reducers trong dự án ở đây
const reducers = combineReducers({
  account: accountReducer,
  address: addressReducer,
  category: categoryReducer,
  brand: brandReducer,
  product: productReducer,
  productAttribute: productAttributeReducer,
  image: imageReducer,
  news: newsReducer,
  coupon: couponReducer,
  order: orderReducer,
  orderItem: orderItemReducer,
  banner: bannerReducer,
  review: reviewReducer,
  cart: cartReducer,
  import: importReducer,
  importDetail: importDetailReducer,
  user: userReducer,
  userCoupon: userCouponReducer
})

//Thực hiện persit reducer
const persistedReducer = persistReducer(rootPersistConfig, reducers)

export const store = configureStore({
  reducer: persistedReducer,
  // Fix warning error khi dùng redux-persist do tương thích với redux-toolkit
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
})

export default store