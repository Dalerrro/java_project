// front/src/components/MetricsChart.jsx

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
import { Card, CardContent, Typography, Grid } from '@mui/material';

const MetricsChart = () => {
  const [data, setData] = useState([]);

  const fetchMetrics = useCallback(() => {
    fetch('http://localhost:8080/metrics')
      .then((res) => res.json())
      .then((json) => {
        const mapped = json.reverse().map((item, idx) => {
          const memory_usage = Math.round((item.memory_used / item.memory_total) * 100);
          const time = new Date(Date.now() - ((json.length - 1 - idx) * 60 * 1000));
          const timestamp = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return { ...item, memory_usage, timestamp };
        });
        setData(mapped);
      })
      .catch((err) => console.error('Ошибка получения /metrics:', err));
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 300000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (!data.length) return null;

  const tickInterval = Math.max(1, Math.floor(data.length / 6));

  return (
    <Grid container spacing={2}>
      {/* CPU Usage Chart */}
      <Grid item xs={12} md={12} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              CPU Usage (%)
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCPU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" tick={{ fill: 'text.secondary' }} interval={tickInterval} />
                <YAxis domain={[0, 100]} tick={{ fill: 'text.secondary' }} />
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Area type="monotone" dataKey="cpu" stroke="#8884d8" fill="url(#colorCPU)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
      {/* Memory Usage Chart */}
      <Grid item xs={12} md={6}>
        <Card sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Memory Usage (%)
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" tick={{ fill: 'text.secondary' }} interval={tickInterval} />
                <YAxis domain={[0, 100]} tick={{ fill: 'text.secondary' }} />
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" />
                <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} />
                <Area type="monotone" dataKey="memory_usage" stroke="#82ca9d" fill="url(#colorMemory)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MetricsChart;
