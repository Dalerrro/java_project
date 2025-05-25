import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

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
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">⏳ Uptime</Typography>
            <Typography>{status.uptime}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">⚙️ Процессов</Typography>
            <Typography>{status.processes}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">💾 Swap Total</Typography>
            <Typography>{status.swap_total} KB</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">💽 Swap Used</Typography>
            <Typography>{status.swap_used} KB</Typography>
          </CardContent>
        </Card>
      </Grid>
      {status.cpu_temp !== undefined && (
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">🌡 Температура CPU</Typography>
              <Typography>{status.cpu_temp.toFixed(1)} °C</Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
          <Grid item xs={12} sm={6} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">🖥 Ядра (Physical)</Typography>
          <Typography>{status.physical_cores}</Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">💻 Ядра (Logical)</Typography>
          <Typography>{status.logical_cores}</Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Card>
        <CardContent>
          <Typography variant="h6">⚡ Частота CPU</Typography>
          <Typography>{status.cpu_freq.toFixed(2)} GHz</Typography>
        </CardContent>
      </Card>
    </Grid>
        </Grid>
  );
};

export default LiveStats;
