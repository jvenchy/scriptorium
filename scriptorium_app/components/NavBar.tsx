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
  Article as ArticleIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
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
        borderColor: theme.colors.border,
        bgcolor: theme.colors.cardBackground,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
        transition: 'all 0.3s ease',
      }}
    >
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: theme.colors.border 
      }}>
        <Typography
          variant="h6"
          component="h1"
          sx={{
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 'bold',
            color: theme.colors.text,
          }}
        >
          Scriptorium
        </Typography>
      </Box>

      <List sx={{ pt: 2 }}>
        <ListItem sx={{ pb: 2 }}>
          <Typography variant="overline" sx={{ color: theme.colors.text }}>
            NAVIGATION
          </Typography>
        </ListItem>

        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton sx={{
            '&:hover': {
              bgcolor: theme.colors.hover,
            }
          }}>
            <ListItemIcon>
              <HomeIcon sx={{ color: theme.colors.iconColor }} />
            </ListItemIcon>
            <ListItemText
              primary="Home"
              primaryTypographyProps={{
                fontFamily: 'monospace',
                color: theme.colors.text,
              }}
            />
          </ListItemButton>
        </Link>

        <Link href="/editor" style={{ textDecoration: 'none', color: 'inherit' }}>
          <ListItemButton sx={{
            '&:hover': {
              bgcolor: theme.colors.hover,
            }
          }}>
            <ListItemIcon>
              <CodeIcon sx={{ color: theme.colors.iconColor }} />
            </ListItemIcon>
            <ListItemText
              primary="Code Editor"
              primaryTypographyProps={{
                fontFamily: 'monospace',
                color: theme.colors.text,
              }}
            />
          </ListItemButton>
        </Link>

        {isAuthenticated ? (
          <Link href="/createPost" style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItemButton sx={{
              '&:hover': {
                bgcolor: theme.colors.hover,
              }
            }}>
              <ListItemIcon>
                <EditIcon sx={{ color: theme.colors.iconColor }} />
              </ListItemIcon>
              <ListItemText
                primary="New Blog Post"
                primaryTypographyProps={{
                  fontFamily: 'monospace',
                  color: theme.colors.text,
                }}
              />
            </ListItemButton>
          </Link>
        ) : (
          <ListItemButton 
            onClick={() => setShowAuthModal(true)}
            sx={{
              '&:hover': {
                bgcolor: theme.colors.hover,
              }
            }}
          >
            <ListItemIcon>
              <EditIcon sx={{ color: theme.colors.iconColor }} />
            </ListItemIcon>
            <ListItemText
              primary="New Blog Post"
              primaryTypographyProps={{
                fontFamily: 'monospace',
                color: theme.colors.text,
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
          <Typography variant="overline" sx={{ color: theme.colors.text }}>
            CONTENT
          </Typography>
        </ListItem>

        {isAuthenticated ? (
          <>
            <Link href="/myTemplates" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton sx={{
                '&:hover': {
                  bgcolor: theme.colors.hover,
                }
              }}>
                <ListItemIcon>
                  <BookmarkIcon sx={{ color: theme.colors.iconColor }} />
                </ListItemIcon>
                <ListItemText
                  primary="Saved Templates"
                  primaryTypographyProps={{
                    fontFamily: 'monospace',
                    color: theme.colors.text,
                  }}
                />
              </ListItemButton>
            </Link>

            <Link href="/myBlogPosts" style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItemButton sx={{
                '&:hover': {
                  bgcolor: theme.colors.hover,
                }
              }}>
                <ListItemIcon>
                  <ArticleIcon sx={{ color: theme.colors.iconColor }} />
                </ListItemIcon>
                <ListItemText
                  primary="My Blog Posts"
                  primaryTypographyProps={{
                    fontFamily: 'monospace',
                    color: theme.colors.text,
                  }}
                />
              </ListItemButton>
            </Link>
          </>
        ) : (
          <>
            <ListItemButton 
              onClick={() => setShowAuthModal(true)}
              sx={{
                '&:hover': {
                  bgcolor: theme.colors.hover,
                }
              }}
            >
              <ListItemIcon>
                <BookmarkIcon sx={{ color: theme.colors.iconColor }} />
              </ListItemIcon>
              <ListItemText
                primary="Saved Templates"
                primaryTypographyProps={{
                  fontFamily: 'monospace',
                  color: theme.colors.text,
                }}
              />
            </ListItemButton>

            <ListItemButton 
              onClick={() => setShowAuthModal(true)}
              sx={{
                '&:hover': {
                  bgcolor: theme.colors.hover,
                }
              }}
            >
              <ListItemIcon>
                <ArticleIcon sx={{ color: theme.colors.iconColor }} />
              </ListItemIcon>
              <ListItemText
                primary="My Blog Posts"
                primaryTypographyProps={{
                  fontFamily: 'monospace',
                  color: theme.colors.text,
                }}
              />
            </ListItemButton>
          </>
        )}
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
            bgcolor: theme.colors.cardBackground,
            color: theme.colors.text,
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: theme.colors.text }}>
            Sign In Required
          </Typography>
          <Typography sx={{ mb: 3, color: theme.colors.text }}>
            You need to sign in to access features like creating posts, commenting, and saving templates.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="outlined" 
              onClick={() => setShowAuthModal(false)}
              sx={{
                color: theme.colors.text,
                borderColor: theme.colors.border,
                '&:hover': {
                  borderColor: theme.colors.text,
                  bgcolor: theme.colors.hover,
                }
              }}
            >
              Close
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};