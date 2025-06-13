import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
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
  Chip,
} from '@mui/material';
import { Refresh, TrendingUp, Memory, Storage, Computer } from '@mui/icons-material';

// Кастомный тултип для графиков
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: 14,
        }}
      >
        <Typography variant="caption" fontWeight="bold" sx={{ color: 'white', mb: 1, display: 'block' }}>
          🕐 {label}
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
                borderRadius: '50%',
                mr: 1.5,
                backgroundColor: entry.color,
                boxShadow: `0 0 8px ${entry.color}40`,
              }}
            />
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
              {entry.name}: {Math.round(entry.value)}%
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

// Кастомный тултип для donut диаграмм
const DonutTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const data = payload[0];
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
          {data.name}: {data.value}%
        </Typography>
      </Box>
    );
  }
  return null;
};

// Компонент Donut диаграммы
const DonutChart = ({ data, colors, title, icon, currentValue }) => {
  const centerText = `${currentValue}%`;
  
  return (
    <Card
      sx={{
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-5px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${colors[0]}, ${colors[1] || colors[0]})`,
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ fontWeight: 700, ml: 1, color: 'white' }}>
            {title}
          </Typography>
        </Box>
        
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={data}
                cx={100}
                cy={100}
                innerRadius={65}
                outerRadius={90}
                startAngle={90}
                endAngle={450}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index]} 
                    style={{
                      filter: `drop-shadow(0 0 8px ${colors[index]}40)`,
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Центральный текст */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                color: 'white',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                mb: 0.5
              }}
            >
              {centerText}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 600
              }}
            >
              Использовано
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
          {data.map((entry, index) => (
            <Chip
              key={entry.name}
              label={`${entry.name}: ${entry.value}%`}
              size="small"
              sx={{
                bgcolor: `${colors[index]}20`,
                color: colors[index],
                border: `1px solid ${colors[index]}40`,
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const MetricsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

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
        setLastUpdate(new Date());
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
    const interval = setInterval(fetchMetrics, 30000); // каждые 30 секунд для быстрого обновления
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          mb: 2, 
          bgcolor: 'rgba(211, 47, 47, 0.1)',
          border: '1px solid rgba(211, 47, 47, 0.2)',
          color: 'white'
        }}
      >
        {error}
        <IconButton
          size="small"
          onClick={fetchMetrics}
          sx={{ ml: 1, color: 'white' }}
        >
          <Refresh fontSize="small" />
        </IconButton>
      </Alert>
    );
  }

  if (loading && data.length === 0) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', my: 4 }}>
        <Skeleton 
          variant="rectangular" 
          height={400} 
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2
          }} 
        />
        <LinearProgress 
          color="secondary" 
          sx={{ 
            mt: 2,
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#4caf50'
            }
          }} 
        />
      </Box>
    );
  }

  const length = data.length;
  const tickInterval = Math.max(1, Math.floor(length / 8));
  const horizontalLines = [25, 50, 75];
  const gridColor = 'rgba(255, 255, 255, 0.08)';

  // Данные для donut диаграмм (берем последние значения)
  const latestData = data[data.length - 1] || { cpu: 0, memory_usage: 0, disk_usage: 0 };
  
  const cpuDonutData = [
    { name: 'Используется', value: latestData.cpu },
    { name: 'Свободно', value: 100 - latestData.cpu }
  ];
  
  const memoryDonutData = [
    { name: 'Используется', value: latestData.memory_usage },
    { name: 'Свободно', value: 100 - latestData.memory_usage }
  ];
  
  const diskDonutData = [
    { name: 'Используется', value: latestData.disk_usage },
    { name: 'Свободно', value: 100 - latestData.disk_usage }
  ];

  const renderAreaChart = (dataKey, name, color, gradientId, height = 350) => (
    <Card
      sx={{
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
          boxShadow: `0 0 20px ${color}40`,
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ mr: 1, color: color }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              {name}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${Math.round(latestData[dataKey] || 0)}%`}
              size="small"
              sx={{
                bgcolor: `${color}20`,
                color: color,
                border: `1px solid ${color}40`,
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            />
            <IconButton
              onClick={fetchMetrics}
              size="small"
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: `${color}20`,
                  transform: 'rotate(180deg)',
                }
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                <stop offset="50%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>

            {horizontalLines.map((value) => (
              <ReferenceLine
                key={value}
                y={value}
                stroke={gridColor}
                strokeWidth={1}
                strokeDasharray="5 5"
              />
            ))}

            <YAxis
              domain={[0, 100]}
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1 }}
              tickFormatter={(v) => `${v}%`}
              width={50}
            />

            <XAxis
              dataKey="timestamp"
              tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11 }}
              interval={tickInterval}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1 }}
              tickMargin={10}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey={dataKey}
              name={name}
              stroke={color}
              fill={`url(#${gradientId})`}
              strokeWidth={3}
              isAnimationActive={true}
              animationDuration={800}
              dot={false}
              activeDot={{ 
                r: 6, 
                stroke: color, 
                strokeWidth: 2, 
                fill: '#000',
                boxShadow: `0 0 10px ${color}`
              }}
            />
          </AreaChart>
        </ResponsiveContainer>

        <Typography
          variant="caption"
          sx={{ 
            color: 'rgba(255, 255, 255, 0.5)', 
            mt: 1,
            display: 'block',
            textAlign: 'center',
            fontSize: '0.75rem'
          }}
        >
          🔄 Обновлено: {lastUpdate.toLocaleTimeString()} • Автообновление каждые 30 сек
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, mt: 4 }}>
      {/* Donut диаграммы */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={4}>
          <DonutChart
            data={cpuDonutData}
            colors={['#1976d2', 'rgba(25, 118, 210, 0.1)']}
            title="Процессор"
            icon={<Computer sx={{ color: '#1976d2' }} />}
            currentValue={latestData.cpu}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={4}>
          <DonutChart
            data={memoryDonutData}
            colors={['#4caf50', 'rgba(76, 175, 80, 0.1)']}
            title="Память"
            icon={<Memory sx={{ color: '#4caf50' }} />}
            currentValue={latestData.memory_usage}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} lg={4}>
          <DonutChart
            data={diskDonutData}
            colors={['#ff9800', 'rgba(255, 152, 0, 0.1)']}
            title="Диск"
            icon={<Storage sx={{ color: '#ff9800' }} />}
            currentValue={latestData.disk_usage}
          />
        </Grid>
      </Grid>

      {/* Графики временных рядов */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          {renderAreaChart('cpu', 'Загрузка Процессора', '#1976d2', 'gradientCPU', 400)}
        </Grid>

        <Grid item xs={12} lg={6}>
          {renderAreaChart('memory_usage', 'Использование Памяти', '#4caf50', 'gradientMem', 400)}
        </Grid>
        
        <Grid item xs={12}>
          {renderAreaChart('disk_usage', 'Использование Диска', '#ff9800', 'gradientDisk', 300)}
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetricsChart;