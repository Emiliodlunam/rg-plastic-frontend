import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f4f6f8' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <Header />
        <Box component="div" sx={{ mt: 2, flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;