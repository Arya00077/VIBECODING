import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { stockService } from '../../services/stockService';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockChartProps {
  symbol: string;
  name: string;
}

export const StockChart = ({ symbol, name }: StockChartProps) => {
  const [data, setData] = useState<number[]>([]);
  const [period, setPeriod] = useState('1M');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const historicalData = await stockService.getHistoricalData(symbol, period);
        setData(historicalData);
      } catch (error) {
        console.error('Failed to fetch historical data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, period]);

  const chartData = {
    labels: data.map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (data.length - 1 - index));
      return date.toLocaleDateString();
    }),
    datasets: [
      {
        label: symbol,
        data: data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const periods = ['1W', '1M', '3M', '1Y'];

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{symbol}</h3>
          <p className="text-white/60">{name} Price Chart</p>
        </div>
        <div className="flex space-x-2">
          {periods.map((p) => (
            <GlassButton
              key={p}
              size="sm"
              variant={period === p ? 'primary' : 'secondary'}
              onClick={() => setPeriod(p)}
            >
              {p}
            </GlassButton>
          ))}
        </div>
      </div>

      <div className="h-80 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </GlassCard>
  );
};