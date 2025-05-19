import React, { useState } from 'react';
import { Card } from 'antd';
import Dashboard from './Dashboard';
import InventoryDashboard from './InventoryDashboard';

const tabList = [
  {
    key: 'tab1',
    tab: 'Tổng quan',
  },
  {
    key: 'tab2',
    tab: 'Thống kê kho hàng',
  },
];

const contentList = {
  tab1: <Dashboard />,
  tab2: <InventoryDashboard />,
};

const AdminDashboardContainer = () => {
  const [activeTabKey, setActiveTabKey] = useState('tab1');

  const onTabChange = (key) => {
    setActiveTabKey(key);
  };

  return (
    <Card
      title="Bảng điều khiển"
      tabList={tabList}
      activeTabKey={activeTabKey}
      onTabChange={onTabChange}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
    >
      {contentList[activeTabKey]}
    </Card>
  );
};

export default AdminDashboardContainer;