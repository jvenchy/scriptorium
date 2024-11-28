import React from 'react';
import { Box } from '@mui/material';
import { Navbar } from '@/components/NavBar';
import { MyTemplatesList } from '@/components/MyTemplatesList';
import { useAuth } from '@/contexts/AuthContext';
import SearchBar from '@/components/SearchBar';
import { useTheme } from '@/contexts/ThemeContext';

const MyTemplatesPage: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { theme } = useTheme();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: theme.colors.background,
      transition: 'all 0.3s ease'
    }}>
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
            bgcolor: theme.colors.cardBackground,
            borderBottom: 1,
            borderColor: theme.colors.border,
            py: 2,
            px: 3,
            transition: 'all 0.3s ease'
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