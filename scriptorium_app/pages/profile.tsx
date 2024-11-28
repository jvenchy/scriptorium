import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
  Stack,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Edit as EditIcon,
  Description as FileTextIcon,
  Code as CodeIcon,
  Comment as MessageIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { Navbar } from '@/components/NavBar';
import { useTheme } from '@/contexts/ThemeContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { theme } = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    avatar: user?.avatar || '/broken-image.jpg',
    phoneNumber: user?.phoneNumber || '',
    isAdministrator: user?.isAdministrator || false,
    password: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user) {
      const userData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        avatar: user.avatar || '/broken-image.jpg',
        phoneNumber: user.phoneNumber || '',
        isAdministrator: user.isAdministrator || false,
        password: '',
      };
      setProfile(userData);
      setEditedProfile(userData);
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        router.push('/');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, router]);

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        firstName: editedProfile.firstName,
        lastName: editedProfile.lastName,
        newEmail: editedProfile.email,
        avatar: editedProfile.avatar,
        phoneNumber: editedProfile.phoneNumber,
        password: editedProfile.password || undefined,
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/accounts/logout', {
        method: 'POST',
        headers: {
          'Authorization': localStorage.getItem('refreshToken') || '',
        },
      });
      
      logout();
      await router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: theme.colors.background,
      display: 'flex',
      transition: 'all 0.3s ease'
    }}>
      <Navbar
        isAuthenticated={!!user}
        onAuthClick={() => {}}
        onLogoutClick={handleLogout}
        user={user}
        onCreatePostClick={() => {}}
      />
      
      <Box component="main" sx={{ flexGrow: 1, ml: '240px', p: 4 }}>
        <Card sx={{ 
          maxWidth: 800, 
          mx: 'auto', 
          mb: 4,
          bgcolor: theme.colors.cardBackground,
          borderColor: theme.colors.border,
          transition: 'all 0.3s ease'
        }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography 
                  variant="h5" 
                  component="h1" 
                  sx={{ 
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    color: theme.colors.text 
                  }}
                >
                  Profile
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    startIcon={<EditIcon sx={{ color: theme.isDarkMode ? '#fff' : undefined }} />}
                    onClick={() => setIsEditing(!isEditing)}
                    variant="contained"
                    sx={{
                      bgcolor: theme.isDarkMode ? '#4a4b5d' : undefined,
                      '&:hover': {
                        bgcolor: theme.isDarkMode ? '#5a5b6d' : undefined,
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outlined"
                    color="error"
                    sx={{
                      borderColor: theme.isDarkMode ? '#f44336' : undefined,
                      color: theme.isDarkMode ? '#f44336' : undefined,
                    }}
                  >
                    Logout
                  </Button>
                </Stack>
              </Box>
            }
          />
          <CardContent>
            <Stack direction="row" spacing={4} alignItems="center" sx={{ mb: 4 }}>
              <Avatar
                src={profile.avatar}
                sx={{ width: 100, height: 100 }}
              />
              <Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    color: theme.colors.text 
                  }}
                >
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Typography 
                  sx={{ 
                    fontFamily: 'monospace',
                    color: theme.colors.text,
                    opacity: 0.7
                  }}
                >
                  {profile.email}
                </Typography>
              </Box>
            </Stack>

            {isEditing ? (
              <form onSubmit={handleEditProfile}>
                <Stack spacing={3}>
                  <TextField
                    label="Avatar URL"
                    value={editedProfile.avatar}
                    onChange={(e) => setEditedProfile({...editedProfile, avatar: e.target.value})}
                    fullWidth
                    helperText="Enter the URL of your profile picture"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.colors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.colors.border,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.colors.text,
                      },
                      '& .MuiInputBase-input': {
                        color: theme.colors.text,
                      },
                      '& .MuiFormHelperText-root': {
                        color: theme.colors.text,
                      }
                    }}
                  />
                  <TextField
                    label="First Name"
                    value={editedProfile.firstName}
                    onChange={(e) => setEditedProfile({...editedProfile, firstName: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.colors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.colors.border,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.colors.text,
                      },
                      '& .MuiInputBase-input': {
                        color: theme.colors.text,
                      },
                      '& .MuiFormHelperText-root': {
                        color: theme.colors.text,
                      }
                    }}
                  />
                  <TextField
                    label="Last Name"
                    value={editedProfile.lastName}
                    onChange={(e) => setEditedProfile({...editedProfile, lastName: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.colors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.colors.border,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.colors.text,
                      },
                      '& .MuiInputBase-input': {
                        color: theme.colors.text,
                      },
                      '& .MuiFormHelperText-root': {
                        color: theme.colors.text,
                      }
                    }}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.colors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.colors.border,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.colors.text,
                      },
                      '& .MuiInputBase-input': {
                        color: theme.colors.text,
                      },
                      '& .MuiFormHelperText-root': {
                        color: theme.colors.text,
                      }
                    }}
                  />
                  <TextField
                    label="Phone Number"
                    value={editedProfile.phoneNumber}
                    onChange={(e) => setEditedProfile({...editedProfile, phoneNumber: e.target.value})}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.colors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.colors.border,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.colors.text,
                      },
                      '& .MuiInputBase-input': {
                        color: theme.colors.text,
                      },
                      '& .MuiFormHelperText-root': {
                        color: theme.colors.text,
                      }
                    }}
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    onChange={(e) => setEditedProfile({...editedProfile, password: e.target.value})}
                    fullWidth
                    helperText="Leave blank to keep current password"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.colors.border,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.colors.border,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.colors.text,
                      },
                      '& .MuiInputBase-input': {
                        color: theme.colors.text,
                      },
                      '& .MuiFormHelperText-root': {
                        color: theme.colors.text,
                      }
                    }}
                  />
                  <Button 
                    type="submit" 
                    variant="contained"
                    sx={{
                      bgcolor: theme.isDarkMode ? '#4a4b5d' : undefined,
                      '&:hover': {
                        bgcolor: theme.isDarkMode ? '#5a5b6d' : undefined,
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </form>
            ) : (
              <Box>
                <Typography sx={{ mb: 1, color: theme.colors.text }}>
                  <strong>Phone:</strong> {profile.phoneNumber}
                </Typography>
                <Typography sx={{ color: theme.colors.text }}>
                  <strong>Administrator:</strong> {profile.isAdministrator ? 'Yes' : 'No'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}