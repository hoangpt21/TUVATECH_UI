import React, { useEffect, useMemo, useState } from 'react'
import { Button, Space, Badge, Tooltip, Avatar } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  PhoneOutlined,
  TruckOutlined ,
} from "@ant-design/icons";
import { useSelector, useDispatch } from 'react-redux'
import {getUserCart, selectCartItems, setCartItems} from '../../redux/cart/cartSlice'
import { selectCurrentAccount } from '../../redux/user/accountSlice'
import { useNavigate } from "react-router-dom";
import AuthModal from './AuthModal';

const styles = {
  badge: {
    '.antBadgeCount': {
      background: '#1a237e',
    },
  },
  button: {
    color: '#1a237e',
    fontWeight: 500,
    height: '40px',
    padding: '0 10px',
    width: '100%',
  },
  avatar: {
    backgroundColor: '#1a237e',
  },
}

function ClientHeaderAction({ isMobile }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentAccount = useSelector(selectCurrentAccount);
  const cartItems = useSelector(selectCartItems);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  useEffect(() => {
    (async () => {
      if (currentAccount) {
        await dispatch(getUserCart({isAll: true}));
        setIsAuthModalOpen(false);
      } else {
        dispatch(setCartItems([]));
      }
    })()
  }, [currentAccount]);
  
  const totalQuantity = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);
  const handleUser = () => {
    if (currentAccount?.role === 'client') {
      navigate('/tmember/account');
    } else if(currentAccount?.role === 'admin') navigate('/admin') 
    else {
      setIsAuthModalOpen(true);
    }
  };

  const handleCart = () => {
    if (!currentAccount) {
      setIsAuthModalOpen(true);
      return;
    }
    navigate('/cart');
  };

  const handleOrderSearch = () => {
    if (!currentAccount) {
      setIsAuthModalOpen(true);
      return;
    } else if (currentAccount?.role === 'admin') {
      navigate('/admin/info/orderhistory');
      return;
    }
    navigate('/tmember/orderhistory');
  };
    
  return (
    <Space size="middle" align="center" direction={isMobile ? "vertical" : "horizontal"} style={{width: '100%'}} styles={{item: {width: '25%'}}}>
      <Tooltip title="Hotline: 1800 1060">
        <Button 
          type="text" 
          icon={<PhoneOutlined style={{ fontSize: '16px' }} />} 
          style={styles.button}
          onClick={() => window.location.href = 'tel:18001060'}
        >
          Gọi mua hàng
        </Button>
      </Tooltip>

      <Tooltip title="Tra cứu đơn hàng">
        <Button 
          type="text" 
          icon={<TruckOutlined style={{ fontSize: '16px' }} />} 
          style={styles.button}
          onClick={handleOrderSearch}
        >
          Tra cứu đơn hàng
        </Button>
      </Tooltip>

      <Tooltip title="Giỏ hàng">
        <Button 
          type="text" 
          icon={
            <Badge count={totalQuantity} size="small" style={styles.badge}>
                <ShoppingCartOutlined style={{ fontSize: '16px' }} />
            </Badge>
          } 
          style={styles.button}
          onClick={handleCart}
        >
          Giỏ hàng
        </Button>
      </Tooltip>

      <Tooltip title={currentAccount ? "Tài khoản" : "Đăng nhập"}>
        <Button 
          type="text" 
          icon={currentAccount?.avatar_url ? 
            <Avatar src={currentAccount.avatar_url} alt="avatar" size={24} /> : 
            <UserOutlined style={{ fontSize: '16px' }} />
          } 
          style={styles.button}
          onClick={handleUser}
        >
          {currentAccount ? currentAccount.display_name : "Đăng nhập"}
        </Button>
      </Tooltip>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </Space>
  )
}

export default ClientHeaderAction