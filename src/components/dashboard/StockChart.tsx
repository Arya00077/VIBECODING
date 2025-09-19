import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
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
  const [customPeriod, setCustomPeriod] = useState('');
  const [showCustom, setShowCustom] = useState(false);
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
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: 'rgb(34, 197, 94)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(34, 197, 94, 0.5)',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const periods = ['1D', '1W', '1M', '3M', '6M', '1Y', '2Y'];

  const handleCustomPeriod = () => {
    if (customPeriod) {
      setPeriod(customPeriod);
      setShowCustom(false);
    }
  };

  return (
    <GlassCard className="p-6 bg-gradient-to-br from-gray-900/95 to-black/95 border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{symbol}</h3>
          <p className="text-white/60">{name} Price Chart</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {periods.map((p) => (
              <GlassButton
                key={p}
                size="sm"
                variant={period === p ? 'success' : 'secondary'}
                onClick={() => setPeriod(p)}
                className="text-xs"
              >
                {p}
              </GlassButton>
            ))}
          </div>
          
          <div className="relative">
            <GlassButton
              size="sm"
              variant="secondary"
              onClick={() => setShowCustom(!showCustom)}
              className="flex items-center space-x-1"
            >
              <Calendar className="w-4 h-4" />
              <span>Custom</span>
            </GlassButton>
            
            {showCustom && (
              <div className="absolute right-0 top-full mt-2 p-3 bg-gray-800/95 border border-gray-600 rounded-lg backdrop-blur-lg z-10">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customPeriod}
                    onChange={(e) => setCustomPeriod(e.target.value)}
                    placeholder="e.g., 5Y, 10D"
                    className="w-20 px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
                  />
                  <GlassButton
                    size="sm"
                    onClick={handleCustomPeriod}
                    className="text-xs"
                  >
                    Apply
                  </GlassButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-96 relative bg-gradient-to-b from-transparent to-gray-900/20 rounded-lg p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span className="ml-3 text-white/60">Loading chart data...</span>
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-white/60">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Real-time data</span>
          </div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <div>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </GlassCard>
  );
};