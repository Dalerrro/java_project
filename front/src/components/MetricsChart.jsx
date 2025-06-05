import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Alert,
  IconButton,
  Skeleton,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';

// Кастомный тултип для графиков
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          fontSize: 14,
        }}
      >
        <Typography variant="caption" fontWeight="bold">
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box
            key={index}
            sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
          >
            <Box
              sx={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                mr: 1,
                backgroundColor: entry.color,
              }}
            />
            <Typography variant="body2">
              {entry.name}: {Math.round(entry.value)}%
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

const MetricsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция загрузки метрик из /metrics
  const fetchMetrics = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:8080/metrics')
      .then((res) => res.json())
      .then((json) => {
        const mapped = json
          .reverse()
          .map((item, idx) => {
            const memory_usage = Math.round(
              (item.memory_used / item.memory_total) * 100
            );
            const time = new Date(
              Date.now() - (json.length - 1 - idx) * 60 * 1000
            );
            const timestamp = time.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return { ...item, memory_usage, timestamp };
          });
        setData(mapped);
        setError(null);
      })
      .catch((err) => {
        console.error('Ошибка получения /metrics:', err);
        setError('Не удалось загрузить метрики. Нажмите «↻» для повтора.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 300000); // каждые 5 минут
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <IconButton
          size="small"
          onClick={fetchMetrics}
          sx={{ ml: 1 }}
          color="inherit"
        >
          <Refresh fontSize="small" />
        </IconButton>
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', my: 4 }}>
        <Skeleton variant="rectangular" height={300} />
        <LinearProgress color="secondary" sx={{ mt: 2 }} />
      </Box>
    );
  }

  const length = data.length;
  const tickInterval = Math.max(1, Math.floor(length / 6));
  const horizontalLines = [25, 50, 75, 100];
  const gridColor = 'rgba(255, 255, 255, 0.1)';

  const renderAreaChart = (dataKey, name, color, gradientId) => (
    <Card
      sx={{
        bgcolor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
            {name}
          </Typography>
          <IconButton
            onClick={fetchMetrics}
            size="small"
            sx={{ color: 'white' }}
          >
            <Refresh fontSize="small" />
          </IconButton>
        </Box>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            {horizontalLines.map((value) => (
              <ReferenceLine
                key={value}
                y={value}
                stroke={gridColor}
                strokeWidth={1}
              />
            ))}

            <YAxis
              domain={[0, 100]}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1 }}
              tickFormatter={(v) => `${v}%`}
              width={40}
            />

            <XAxis
              dataKey="timestamp"
              tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
              interval={tickInterval}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1 }}
              tickMargin={8}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey={dataKey}
              name={name}
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={2}
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        <Typography
          variant="caption"
          sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}
        >
          Обновляется автоматически каждые 5 минут
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, mt: 4 }}>
      <Grid container spacing={1}>
        {/* 1. CPU Usage */}
        <Grid item xs={12} md={8}>
          {renderAreaChart('cpu', 'Загрузка CPU (%)', '#1976d2', 'gradientCPU')}
        </Grid>

        {/* 2. Memory Usage */}
        <Grid item xs={12} md={8}>
          {renderAreaChart('memory_usage', 'Использование Памяти (%)', '#4caf50', 'gradientMem')}
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetricsChart;