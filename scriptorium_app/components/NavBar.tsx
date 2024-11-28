import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  ButtonGroup,
  Modal,
  Stack,
} from '@mui/material';
import {
  Code as CodeIcon,
  Book as BookIcon,
  Edit as EditIcon,
  Home as HomeIcon,
  AdminPanelSettings as AdminIcon,
  BookmarkBorder as BookmarkIcon,
} from '@mui/icons-material';
import Link from 'next/link';


interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isAdministrator?: boolean;
  phoneNumber?: string;
}

interface NavbarProps {
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onLogoutClick: () => void;
  user: User | null;
  onCreatePostClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  onAuthClick,
  onLogoutClick,
  user,
  onCreatePostClick,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    onCreatePostClick();
  };

  const closeModal = () => {
    setShowAuthModal(false);
    onAuthClick();
  };

  return (
    <Box
      component="nav"
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 'bold',
            color: 'black',
          }}
        >
          Scriptorium
        </Typography>
      </Box>

      <List sx={{ pt: 2 }}>
        <ListItem sx={{ pb: 2 }}>
          <Typography variant="overline" sx={{ color: 'black' }}>
            NAVIGATION
          </Typography>
        </ListItem>

        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText
              primary="Home"
              primaryTypographyProps={{
                fontFamily: 'monospace',
                color: 'black',
              }}
            />
          </ListItemButton>
        </Link>

        <Link href="/editor" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton>
            <ListItemIcon>
              <CodeIcon />
            </ListItemIcon>
            <ListItemText
              primary="Code Editor"
              primaryTypographyProps={{
                fontFamily: 'monospace',
                color: 'black',
              }}
            />
          </ListItemButton>
        </Link>

        {isAuthenticated ? (
          <Link href="/createPost" style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItemButton>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText
                primary="New Blog Post"
                primaryTypographyProps={{
                  fontFamily: 'monospace',
                  color: 'black',
                }}
              />
            </ListItemButton>
          </Link>
        ) : (
          <ListItemButton onClick={() => setShowAuthModal(true)}>
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText
              primary="New Blog Post"
              primaryTypographyProps={{
                fontFamily: 'monospace',
                color: 'black',
              }}
            />
          </ListItemButton>
        )}

        {user?.isAdministrator && (
          <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItemButton>
              <ListItemIcon>
                <AdminIcon />
              </ListItemIcon>
              <ListItemText
                primary="Reports"
                primaryTypographyProps={{
                  fontFamily: 'monospace',
                  color: 'black',
                }}
              />
            </ListItemButton>
          </Link>
        )}

        <ListItem sx={{ pt: 4, pb: 2 }}>
          <Typography variant="overline" sx={{ color: 'black' }}>
            CONTENT
          </Typography>
        </ListItem>

        <Link href="/myTemplates" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton>
            <ListItemIcon>
              <BookmarkIcon />
            </ListItemIcon>
            <ListItemText
              primary="Saved Templates"
              primaryTypographyProps={{
                fontFamily: 'monospace',
                color: 'black',
              }}
            />
          </ListItemButton>
        </Link>
      </List>

      {/* Auth Feedback Modal */}
      <Modal
        open={showAuthModal}
        onClose={closeModal}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Box
          sx={{
            width: 400,
            bgcolor: 'background.paper',
            color: 'black',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Sign In Required
          </Typography>
          <Typography sx={{ mb: 3 }}>
            You need to sign in to access features like creating posts, commenting, and saving templates.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" onClick={closeModal}>
              Sign In
            </Button>
            <Button variant="outlined" onClick={() => setShowAuthModal(false)}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};