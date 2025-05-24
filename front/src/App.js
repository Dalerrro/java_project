import React from 'react';
import LiveStats from './components/LiveStats';
import MetricsChart from './components/MetricsChart'; // если есть компонент графиков
import { Container, Typography, Box } from '@mui/material';

function App() {
  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Мониторинг системных ресурсов
      </Typography>
      <Box sx={{ mb: 4 }}>
        <LiveStats />
      </Box>
      <Box>
        <MetricsChart />
      </Box>
    </Container>
  );
}

export default App;
