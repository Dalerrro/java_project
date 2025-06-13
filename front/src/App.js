// src/App.jsx

import React from 'react';
import LiveStats from './components/LiveStats';
import MetricsChart from './components/MetricsChart'
import { Container } from '@mui/material';

function App() {
  return (
    <Container maxWidth={false} disableGutters sx={{ mt: 4, mb: 4 }}>
      <LiveStats />

      {
      }
      <MetricsChart />
    </Container>
  );
}

export default App;
