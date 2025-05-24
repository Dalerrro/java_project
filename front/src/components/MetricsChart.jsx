import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

const MetricsChart = () => {
  const [data, setData] = useState([]);

  const fetchMetrics = useCallback(() => {
    fetch('http://localhost:8080/metrics')
      .then((res) => res.json())
      .then((json) => setData(json.reverse()))
      .catch((err) => console.error('Ошибка получения /metrics:', err));
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (!data.length) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Графики метрик за последние {data.length} точек
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCPU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <XAxis dataKey="timestamp" tick={false} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area type="monotone" dataKey="cpu" stroke="#8884d8" fill="url(#colorCPU)" isAnimationActive={false} />
            <Area type="monotone" dataKey="memory_used" stroke="#82ca9d" fill="url(#colorMemory)" isAnimationActive={false} />
            <Area type="monotone" dataKey="disk_usage" stroke="#ffc658" fill="url(#colorDisk)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MetricsChart;
