import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const defaultAvatar = '/broken-image.jpg';

const ProfileComponent: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Link href="/profile" style={{ textDecoration: 'none' }}>
      <Box className="flex items-center space-x-2 cursor-pointer">
        <Avatar
          src={user.avatar || defaultAvatar}
          sx={{ width: 40, height: 40, mr: 1 }}
        />
        <Box>
          <Typography className="font-semibold">{`${user.firstName} ${user.lastName}`}</Typography>
          <Typography className="text-sm text-gray-500">{user.email}</Typography>
        </Box>
      </Box>
    </Link>
  );
};

export default ProfileComponent;