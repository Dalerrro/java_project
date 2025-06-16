// src/components/MetricsPage.jsx
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Timeline } from '@mui/icons-material';

const MetricsPage = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
          Detailed Metrics
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Historical data and advanced analytics
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Timeline sx={{ fontSize: '4rem', color: '#d1d5db', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#374151', mb: 1 }}>
            Advanced Metrics Coming Soon
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            This section will contain detailed historical charts and analytics.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MetricsPage;
