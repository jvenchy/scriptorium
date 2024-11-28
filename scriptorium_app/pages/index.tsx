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
  const { theme, toggleTheme } = useTheme();

  const { cleanup } = useSearch();

  const handleContentTypeChange = () => {
    cleanup();
    setContentType(contentType === 'templates' ? 'blogs' : 'templates');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: theme.colors.background,
      color: theme.colors.text,
      transition: 'all 0.3s ease'
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
      
      <Box sx={{ 
        flexGrow: 1,
        marginLeft: '240px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: theme.colors.cardBackground,
          borderBottom: `1px solid ${theme.colors.border}`,
          transition: 'all 0.3s ease'
        }}>
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
                  sx={{
                    '& .MuiSwitch-thumb': {
                      color: theme.colors.iconColor,
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: theme.colors.border,
                    }
                  }}
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
            <Box>
              {isAuthenticated ? (
                <ProfileComponent user={user} />
              ) : (
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  sx={{ 
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    '&:hover': {
                      backgroundColor: theme.colors.hover
                    }
                  }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          </Stack>
        </Box>

        <Box sx={{ flexGrow: 1, p: 2 }}>
          {contentType === 'blogs' ? (
            <BlogPostList />
          ) : (
            <TemplateList />
          )}
        </Box>
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

