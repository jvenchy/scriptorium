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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex' }}>
      <Navbar
        isAuthenticated={!!user}
        onAuthClick={() => {}}
        onLogoutClick={handleLogout}
        user={user}
        onCreatePostClick={() => {}}
      />
      
      <Box component="main" sx={{ flexGrow: 1, ml: '240px', p: 4 }}>
        <Card sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" component="h1" sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  Profile
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(!isEditing)}
                    variant="contained"
                  >
                    Edit Profile
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outlined"
                    color="error"
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
                <Typography variant="h6" sx={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  {profile.firstName} {profile.lastName}
                </Typography>
                <Typography color="text.secondary" sx={{ fontFamily: 'monospace' }}>
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
                  />
                  <TextField
                    label="First Name"
                    value={editedProfile.firstName}
                    onChange={(e) => setEditedProfile({...editedProfile, firstName: e.target.value})}
                    fullWidth
                  />
                  <TextField
                    label="Last Name"
                    value={editedProfile.lastName}
                    onChange={(e) => setEditedProfile({...editedProfile, lastName: e.target.value})}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    fullWidth
                  />
                  <TextField
                    label="Phone Number"
                    value={editedProfile.phoneNumber}
                    onChange={(e) => setEditedProfile({...editedProfile, phoneNumber: e.target.value})}
                    fullWidth
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    onChange={(e) => setEditedProfile({...editedProfile, password: e.target.value})}
                    fullWidth
                    helperText="Leave blank to keep current password"
                  />
                  <Button type="submit" variant="contained">
                    Save Changes
                  </Button>
                </Stack>
              </form>
            ) : (
              <Box>
                <Typography sx={{ mb: 1 }}><strong>Phone:</strong> {profile.phoneNumber}</Typography>
                <Typography><strong>Administrator:</strong> {profile.isAdministrator ? 'Yes' : 'No'}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}