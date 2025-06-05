// src/App.jsx

import React from 'react';
import LiveStats from './components/LiveStats';
import MetricsChart from './components/MetricsChart'
import { Container } from '@mui/material';

function App() {
  return (
    // 1) maxWidth={false} — контейнер займёт всю ширину экрана
    // 2) disableGutters     — убирает горизонтальные отступы слева/справа
    <Container maxWidth={false} disableGutters sx={{ mt: 4, mb: 4 }}>
      <LiveStats />

      {/*
        Если бы вы хотели оставить какой-то небольшой боковой отступ,
        можно вместо disableGutters написать, например, px={2} или px={3}.
      */}
      <MetricsChart />
    </Container>
  );
}

export default App;
