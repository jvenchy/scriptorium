import React from 'react';
import { Box } from '@mui/material';
import { Navbar } from '@/components/NavBar';
import { MyTemplatesList } from '@/components/MyTemplatesList';
import { useAuth } from '@/contexts/AuthContext';
import SearchBar from '@/components/SearchBar';

const MyTemplatesPage: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar
        isAuthenticated={isAuthenticated}
        onAuthClick={() => {}}
        onLogoutClick={logout}
        user={user}
        onCreatePostClick={() => {}}
      />

      <Box component="main" sx={{ flexGrow: 1, ml: '240px' }}>
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            py: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SearchBar contentType="templates" />
          </Box>
        </Box>

        <MyTemplatesList />
      </Box>
    </Box>
  );
};

export default MyTemplatesPage;