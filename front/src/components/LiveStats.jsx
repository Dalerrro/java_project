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
    </Grid>
  );
};

export default LiveStats;
