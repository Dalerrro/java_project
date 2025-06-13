import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Box, 
  Chip,
  LinearProgress,
  Skeleton 
} from '@mui/material';
import { 
  Schedule, 
  Settings, 
  Memory, 
  Storage, 
  Thermostat, 
  Computer, 
  Speed 
} from '@mui/icons-material';

const LiveStats = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = () => {
      fetch('http://localhost:8080/status')
        .then(res => res.json())
        .then(data => {
          setStatus(data);
          setError(null);
        })
        .catch(err => {
          console.error('Ошибка получения /status:', err);
          setError('Не удалось получить статус системы');
        })
        .finally(() => setLoading(false));
    };

    fetchStatus();
    // Обновляем каждые 5 секунд для быстрого отклика
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, mb: 4 }}>
        <Grid container spacing={2}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={index}>
              <Skeleton 
                variant="rectangular" 
                height={120} 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 2
                }} 
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flexGrow: 1, mb: 4 }}>
        <Card sx={{ 
          bgcolor: 'rgba(211, 47, 47, 0.1)',
          border: '1px solid rgba(211, 47, 47, 0.2)',
          borderRadius: 2
        }}>
          <CardContent>
            <Typography color="error" variant="h6">
              ⚠️ {error}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!status) return null;

  // Функция для создания анимированных карточек
  const createStatCard = (title, value, icon, color, gradient, unit = '', progress = null) => (
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
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: `1px solid ${color}40`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: gradient,
          boxShadow: `0 0 20px ${color}40`,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '60px',
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translate(30px, -30px)',
        }
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: 2, 
              bgcolor: `${color}20`,
              border: `1px solid ${color}40`,
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {React.cloneElement(icon, { sx: { color: color, fontSize: '1.5rem' } })}
          </Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {title}
          </Typography>
        </Box>
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            color: 'white',
            mb: 1,
            textShadow: `0 0 20px ${color}40`,
            fontSize: '1.8rem'
          }}
        >
          {value}
          <Typography 
            component="span" 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              ml: 0.5,
              fontSize: '0.9rem',
              fontWeight: 400
            }}
          >
            {unit}
          </Typography>
        </Typography>

        {progress !== null && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: color,
                  borderRadius: 3,
                  boxShadow: `0 0 10px ${color}60`,
                },
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                mt: 1,
                display: 'block',
                textAlign: 'right'
              }}
            >
              {progress}% использовано
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Определяем цвета и градиенты для каждой метрики
  const colorScheme = {
    uptime: { color: '#00bcd4', gradient: 'linear-gradient(135deg, #00bcd4, #0097a7)' },
    processes: { color: '#9c27b0', gradient: 'linear-gradient(135deg, #9c27b0, #7b1fa2)' },
    swap: { color: '#ff5722', gradient: 'linear-gradient(135deg, #ff5722, #d84315)' },
    temp: { color: '#f44336', gradient: 'linear-gradient(135deg, #f44336, #c62828)' },
    cores: { color: '#2196f3', gradient: 'linear-gradient(135deg, #2196f3, #1565c0)' },
    freq: { color: '#4caf50', gradient: 'linear-gradient(135deg, #4caf50, #2e7d32)' },
  };

  // Рассчитываем процент использования swap
  const swapPercent = status.swap_total > 0 ? Math.round((status.swap_used / status.swap_total) * 100) : 0;

  return (
    <Box sx={{ flexGrow: 1, mb: 4 }}>
      {/* Заголовок секции */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            color: 'white',
            mb: 1,
            textShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
          }}
        >
          🖥️ Системная Информация
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1.1rem'
          }}
        >
          Обновляется в реальном времени каждые 5 секунд
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* 1. Uptime */}
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          {createStatCard(
            'Время работы',
            status.uptime.replace('up ', ''),
            <Schedule />,
            colorScheme.uptime.color,
            colorScheme.uptime.gradient
          )}
        </Grid>

        {/* 2. Processes */}
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          {createStatCard(
            'Процессы',
            status.processes,
            <Settings />,
            colorScheme.processes.color,
            colorScheme.processes.gradient
          )}
        </Grid>

        {/* 3. Swap Usage */}
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          {createStatCard(
            'Swap память',
            Math.round(status.swap_used / 1024),
            <Memory />,
            colorScheme.swap.color,
            colorScheme.swap.gradient,
            'MB',
            swapPercent
          )}
        </Grid>

        {/* 4. Температура CPU */}
        {status.cpu_temp !== undefined && (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
            {createStatCard(
              'Температура CPU',
              status.cpu_temp.toFixed(1),
              <Thermostat />,
              colorScheme.temp.color,
              colorScheme.temp.gradient,
              '°C'
            )}
          </Grid>
        )}

        {/* 5. Логические ядра */}
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          {createStatCard(
            'Логических ядер',
            status.logical_cores,
            <Computer />,
            colorScheme.cores.color,
            colorScheme.cores.gradient
          )}
        </Grid>

        {/* 6. Физические ядра */}
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          {createStatCard(
            'Физических ядер',
            status.physical_cores,
            <Computer />,
            colorScheme.cores.color,
            colorScheme.cores.gradient
          )}
        </Grid>

        {/* 7. Частота CPU */}
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
          {createStatCard(
            'Частота CPU',
            status.cpu_freq.toFixed(2),
            <Speed />,
            colorScheme.freq.color,
            colorScheme.freq.gradient,
            'GHz'
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default LiveStats;
