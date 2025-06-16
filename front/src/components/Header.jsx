// src/components/Header.jsx

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Avatar,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Refresh,
  Download,
  AccountCircle,
  Settings,
  Notifications,
  Computer
} from '@mui/icons-material';

const Header = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdate(new Date());
    }, 1000);
  };

  const handleExport = () => {
    // Логика экспорта данных
    console.log('Exporting data...');
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        color: '#111827'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Left side - Logo and title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            sx={{ 
              p: 1, 
              backgroundColor: '#3b82f6',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Computer sx={{ color: 'white', fontSize: '1.5rem' }} />
          </Box>
          
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                color: '#111827',
                fontSize: '1.25rem'
              }}
            >
              System Monitor
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#6b7280',
                fontSize: '0.875rem'
              }}
            >
              Real-time resource monitoring
            </Typography>
          </Box>
        </Box>

        {/* Right side - Actions and user */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Last update info */}
          <Chip
            label={`Updated: ${lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            size="small"
            variant="outlined"
            sx={{
              borderColor: '#d1d5db',
              color: '#6b7280',
              fontSize: '0.75rem',
              height: 28
            }}
          />

          {/* Refresh button */}
          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              sx={{
                border: '1px solid #d1d5db',
                borderRadius: 2,
                padding: '8px',
                '&:hover': {
                  backgroundColor: '#f3f4f6'
                }
              }}
            >
              <Refresh 
                sx={{ 
                  fontSize: '1.25rem',
                  color: '#6b7280',
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} 
              />
            </IconButton>
          </Tooltip>

          {/* Export button */}
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{
              backgroundColor: '#3b82f6',
              color: 'white',
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#2563eb'
              }
            }}
          >
            Export
          </Button>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              sx={{
                border: '1px solid #d1d5db',
                borderRadius: 2,
                padding: '8px'
              }}
            >
              <Notifications sx={{ fontSize: '1.25rem', color: '#6b7280' }} />
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              backgroundColor: '#f3f4f6',
              borderRadius: 2,
              padding: '6px 12px',
              border: '1px solid #e5e7eb'
            }}
          >
            <Avatar 
              sx={{ 
                width: 28, 
                height: 28, 
                backgroundColor: '#6b7280',
                fontSize: '0.875rem'
              }}
            >
              A
            </Avatar>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                color: '#374151',
                fontSize: '0.875rem'
              }}
            >
              Admin
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;