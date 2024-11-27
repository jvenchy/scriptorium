import React, { useState, useEffect } from "react";
import {
  Menu as MenuIcon,
  Code as CodeIcon,
  Book as BookIcon,
  Person as UserIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Button,
  IconButton,
  TextField,
  Modal,
  Box,
  Typography,
  Switch,
  Pagination,
  Card,
  CardContent,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { BlogPostList } from '@/components/BlogPostList';

// testing
import SearchBar from "@/components/SearchBar";
import { Navbar } from '@/components/NavBar';
import { useSearch } from '@/contexts/SearchContext';
import Link from 'next/link';
import ProfileComponent from '@/components/ProfileComponent';

const TemplateList = () => (
  <Box sx={{ p: 3 }}>
    <Typography>Template List Coming Soon</Typography>
  </Box>
);

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onModeChange: React.Dispatch<React.SetStateAction<'login' | 'signup'>>;
}

const ScriptoriumLayout: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { cleanup } = useSearch();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [contentType, setContentType] = useState<'templates' | 'blogs'>('blogs');

  return (
    <Box sx={{
      minHeight: "100vh",
      bgcolor: 'background.default',
      color: 'common.black',
      display: 'flex',
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
                <Typography sx={{ fontFamily: 'monospace' }}>Templates</Typography>
                <Switch
                  checked={contentType === 'blogs'}
                  onChange={() => setContentType(contentType === 'templates' ? 'blogs' : 'templates')}
                />
                <Typography sx={{ fontFamily: 'monospace' }}>Blogs</Typography>
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

