// src/components/LiveStats.jsx

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

const LiveStats = () => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = () => {
      fetch('http://localhost:8080/status')
        .then(res => res.json())
        .then(data => setStatus(data))
        .catch(err => console.error('Ошибка получения /status:', err));
    };

    fetchStatus();
    // Обновляем каждые 2 секунды
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    // Пока нет данных — ничего не показываем
    return null;
  }

  // Общий стиль для всех карточек
  const cardSx = {
    bgcolor: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
  };

  const titleSx = {
    fontWeight: 600,
    color: 'white',
    mb: 0.5,
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        {/* 1. Uptime */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="subtitle1" sx={titleSx}>
                ⏳ Uptime
              </Typography>
              <Typography variant="body1">{status.uptime}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 2. Processes */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="subtitle1" sx={titleSx}>
                ⚙️ Процессов
              </Typography>
              <Typography variant="body1">{status.processes}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 3. Swap Total */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="subtitle1" sx={titleSx}>
                💾 Swap Total
              </Typography>
              <Typography variant="body1">{status.swap_total} KB</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 4. Swap Used */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="subtitle1" sx={titleSx}>
                💽 Swap Used
              </Typography>
              <Typography variant="body1">{status.swap_used} KB</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 5. CPU Temperature */}
        {status.cpu_temp !== undefined && (
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <Card sx={cardSx}>
              <CardContent>
                <Typography variant="subtitle1" sx={titleSx}>
                  🌡 Температура CPU
                </Typography>
                <Typography variant="body1">
                  {status.cpu_temp.toFixed(1)} °C
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* 6. Physical Cores */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="subtitle1" sx={titleSx}>
                🖥 Ядра (Physical)
              </Typography>
              <Typography variant="body1">{status.physical_cores}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 7. Logical Cores */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="subtitle1" sx={titleSx}>
                💻 Ядра (Logical)
              </Typography>
              <Typography variant="body1">{status.logical_cores}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 8. CPU Frequency */}
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <Card sx={cardSx}>
            <CardContent>
              <Typography variant="subtitle1" sx={titleSx}>
                ⚡ Частота CPU
              </Typography>
              <Typography variant="body1">
                {status.cpu_freq.toFixed(2)} GHz
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LiveStats;
