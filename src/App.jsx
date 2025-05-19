import AccountVerification from './pages/auth/AccountVerification'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from '../src/pages/auth/Login'
import Register from '../src/pages/auth/Register'
import {useSelector } from 'react-redux'
import { selectCurrentAccount } from './redux/user/accountSlice'
import Home from './pages/clients/Home'
import ClientLayout from './layouts/ClientLayout'
import AdminLayout from './layouts/AdminLayout'
import Member from './pages/clients/Member/Member'
import Profile from './pages/clients/Member/Profile'
import OrderHistory from './pages/clients/Member/OrderHistory'
import ClientAddress from './pages/clients/Member/ClientAddress'
import VoucherStorage from './pages/clients/Member/VoucherStorage'
import Cart from './pages/clients/Cart'
import Checkout from './pages/clients/Checkout'
import ProductDetail from './pages/clients/ProductDetail'
import AuthCallback from './pages/auth/AuthCallback'

// Import các màn hình admin
import Products from './pages/admin/Products'
import Categories from './pages/admin/Categories'
import Orders from './pages/admin/Orders'
import Brands from './pages/admin/Brands'
import Coupons from './pages/admin/Coupons'
import News from './pages/admin/News'
import Reviews from './pages/admin/Reviews'
import Users from './pages/admin/Users'
import Banners from './pages/admin/Banners'
import Imports from './pages/admin/Imports'
import AdminDashboardContainer from './pages/admin/Dashboard'
import BrandProducts from './pages/clients/BrandProducts'
import Search from './pages/clients/Search'
import ClientNews from './pages/clients/ClientNews'
import ClientNewsDetail from './pages/clients/ClientNewsDetail'
import ClientVouchers from './pages/clients/ClientVouchers'
import Support from './pages/clients/Member/Support'
import ClientOrderDetail from './pages/clients/Member/ClientOrderDetail'
import PaymentConfirmation from './pages/auth/PaymentConfirmation'
import ForgotPassword from './pages/auth/ForgotPassword'
import ProductCompare from './pages/clients/ProductCompare'

const ProtectedRoute = (user) => {
  if(!user) return <Navigate to='/login' replace={true}/>
  return <Outlet />
}

function App() {
  const currentAccount = useSelector(selectCurrentAccount);
  
  return (
    <Routes>
      <Route element={<ClientLayout/>}>
        <Route path='*' element={<Navigate to="/" replace={true}/>}/>
        <Route path='/' element={<Home/>}/>
        <Route path='/product/detail' element={<ProductDetail/>}/>
        <Route path='/brand/detail' element={<BrandProducts/>}/>
        <Route path="/search" element={<Search />} />
        <Route path='/news' element={<ClientNews/>}/>
        <Route path='/news/detail' element={<ClientNewsDetail/>}/>
        <Route path='/vouchers' element={<ClientVouchers/>}/>
        <Route path='/product/compare' element={<ProductCompare/>}/>
      </Route>
      
      <Route element={<ProtectedRoute user={currentAccount}/>}>
        {currentAccount?.role == "admin" && 
          <Route element={<AdminLayout/>}>
            <Route path='/admin' element={<Navigate to='/admin/dashboard' replace={true}/>}/>
            <Route path='/admin/products' element={<Products/>}/>
            <Route path='/admin/categories' element={<Categories/>}/>
            <Route path='/admin/orders' element={<Orders/>}/>
            <Route path='/admin/banners' element={<Banners/>}/>
            <Route path='/admin/brands' element={<Brands/>}/>
            <Route path='/admin/coupons' element={<Coupons/>}/>
            <Route path='/admin/news' element={<News/>}/>
            <Route path='/admin/reviews' element={<Reviews/>}/>
            <Route path='/admin/users' element={<Users/>}/>
            <Route path='/admin/imports' element={<Imports/>}/>
            <Route path='/admin/info' element={<Member/>}>
              <Route path='account' element={<Profile/>}/>
              <Route path='address' element={<ClientAddress/>}/>
              <Route path='orderhistory'>
                <Route path='' element={<OrderHistory/>}/>
                <Route path='detail' element={<ClientOrderDetail/>}/>
              </Route>
              <Route path='vouchers' element={<VoucherStorage/>}/>
            </Route>
            <Route path='/admin/dashboard' element={<AdminDashboardContainer/>}/>
          </Route>
        }
        <Route element={<ClientLayout/>}>
          {currentAccount?.role == "client" &&
            <Route path='/tmember' element={<Member/>}>
              <Route path='account' element={<Profile/>}/>
              <Route path='address' element={<ClientAddress/>}/>
              <Route path='orderhistory'>
                <Route path='' element={<OrderHistory/>}/>
                <Route path='detail' element={<ClientOrderDetail/>}/>
              </Route>
              <Route path='vouchers' element={<VoucherStorage/>}/>
              <Route path='support' element={<Support/>}/>
            </Route>
          }
          <Route path='/cart' element={<Cart/>}/>
          <Route path='/checkout' element={<Checkout/>}/>
        </Route>
        <Route path='/payment-status' element={<PaymentConfirmation/>}/>
      </Route>
      <Route path='/google/auth-callback' element={<AuthCallback />}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/forgot-password' element={<ForgotPassword/>}/>
      <Route path='/register' element={<Register/>}/>
      <Route path='/account/verification' element={<AccountVerification/>}/>
    </Routes>
  )
}

export default App
