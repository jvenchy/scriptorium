import React, { useState, useEffect } from "react";
import {
  Button,
  Box,
  Typography,
  Stack,
  Switch,
  IconButton,
} from "@mui/material";
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { BlogPostList } from '@/components/BlogPostList';
import { TemplateList } from '@/components/TemplateList';
import SearchBar from "@/components/SearchBar";
import { Navbar } from '@/components/NavBar';
import ProfileComponent from '@/components/ProfileComponent';
import { useSearch } from '@/contexts/SearchContext';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';

const ScriptoriumLayout: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [contentType, setContentType] = useState<'templates' | 'blogs'>('blogs');

  const { cleanup } = useSearch();
  const { theme, toggleTheme } = useTheme();

  const handleContentTypeChange = () => {
    cleanup();
    setContentType(contentType === 'templates' ? 'blogs' : 'templates');
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      bgcolor: theme.colors.background,
      color: theme.colors.text,
      display: 'flex',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      <Navbar
        isAuthenticated={isAuthenticated}
        onAuthClick={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
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
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <SearchBar contentType={contentType} />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ 
                  fontFamily: 'monospace',
                  color: theme.colors.text 
                }}>
                  Templates
                </Typography>
                <Switch
                  checked={contentType === 'blogs'}
                  onChange={handleContentTypeChange}
                />
                <Typography sx={{ 
                  fontFamily: 'monospace',
                  color: theme.colors.text 
                }}>
                  Blogs
                </Typography>
                <IconButton onClick={toggleTheme} sx={{ ml: 2 }}>
                  {theme.isDarkMode ? (
                    <LightModeIcon sx={{ color: theme.colors.iconColor }} />
                  ) : (
                    <DarkModeIcon sx={{ color: theme.colors.iconColor }} />
                  )}
                </IconButton>
              </Stack>
            </Box>

            {!isAuthenticated && (
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                >
                  Log In
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                >
                  Sign Up
                </Button>
              </Stack>
            )}

            {isAuthenticated && <ProfileComponent />}
          </Stack>
        </Box>

        {contentType === 'blogs' ? (
          <BlogPostList />
        ) : (
          <TemplateList />
        )}
      </Box>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onModeChange={setAuthMode}
      />
    </Box>
  );
};

export default ScriptoriumLayout;

