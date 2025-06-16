// src/components/AlertsPage.jsx
import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { NotificationsActive } from '@mui/icons-material';

const AlertsPage = () => {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
          Alerts & Notifications
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Configure Telegram notifications and thresholds
        </Typography>
      </Box>

      <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsActive sx={{ fontSize: '4rem', color: '#d1d5db', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#374151', mb: 1 }}>
            Alert Configuration Coming Soon
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Set up Telegram bot settings and notification thresholds here.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AlertsPage;