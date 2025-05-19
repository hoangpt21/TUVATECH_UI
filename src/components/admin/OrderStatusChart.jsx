import { Card } from 'antd';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_LABELS_VI = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
};

const COLORS = [
  '#ffa726', // pending
  '#42a5f5', // confirmed
  '#ab47bc', // shipping
  '#66bb6a', // delivered
  '#ef5350', // cancelled
  '#78909c', // refunded
];

const OrderStatusChart = ({ data }) => {
  // Map labels from EN -> VI
  const labels = data.map(item => STATUS_LABELS_VI[item.type] || item.type);
  const values = data.map(item => item.value);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Tình trạng đơn hàng',
        data: values,
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <Card
      style={{
        height: '100%',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
      title="Trạng thái đơn hàng"
      >
      <div style={{ 
        height: '300px', 
        width: "100%",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
       }}>
        <Pie data={chartData} options={options} style={{height: '100%'}}/>
      </div>
    </Card>
  );
};

export default OrderStatusChart;