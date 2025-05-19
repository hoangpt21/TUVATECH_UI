import { Card } from 'antd';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const RevenueChart = ({ data }) => {
  // Lấy danh sách ngày (x-axis)
  const labels = [...new Set(data.map(item => item.date))]
    .sort((a, b) => new Date(a) - new Date(b)); // Sort dates in ascending order

  // Nhóm theo type để tạo multiple series
  const types = [...new Set(data.map(item => item.type))];
  // Use specific colors for revenue and profit
  const colors = {
    'Doanh thu (VND)': '#42a5f5', // Green for profit
  };

  const formatCurrency = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} tr`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  const datasets = types.map((type) => {
    const values = labels.map(date => {
      const found = data.find(d => d.date === date && d.type === type);
      return found ? found.value : 0;
    });

    return {
      label: type,
      data: values,
      borderColor: colors[type],
      backgroundColor: colors[type],
      tension: 0.4,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
    };
  });

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ngày',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Doanh thu',
        },
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
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
      title="Doanh thu và lợi nhuận theo thời gian"
    >
      <div style={{ 
        height: '300px', 
        width: "100%",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
       }}>
        <Line data={chartData} options={options} style={{height: '100%'}}/>
       </div>
    </Card>
  );
};

export default RevenueChart;