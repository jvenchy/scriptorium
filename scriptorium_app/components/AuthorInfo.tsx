import Link from 'next/link'
import { Avatar, Box, Typography } from '@mui/material'
import { useTheme } from '@/contexts/ThemeContext';

interface AuthorInfoProps {
  author: {
    id: number
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  forkedFromId: number | null
}

const defaultAvatar = '/broken-image.jpg';

export default function AuthorInfo({ author, forkedFromId }: AuthorInfoProps) {
  const { theme } = useTheme();

  return (
    <Box sx={{ 
      bgcolor: theme.colors.cardBackground,
      p: 3,
      borderRadius: 1,
      boxShadow: 1,
      border: `1px solid ${theme.colors.border}`,
      transition: 'all 0.3s ease'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar
          src={author.avatar || defaultAvatar}
          sx={{ width: 40, height: 40, mr: 1 }}
        />
        <Box>
          <Typography sx={{ fontWeight: 600, color: theme.colors.text }}>
            {`${author.firstName} ${author.lastName}`}
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: theme.colors.text, opacity: 0.7 }}>
            {author.email}
          </Typography>
        </Box>
      </Box>
      {forkedFromId && (
        <Typography sx={{ fontSize: '0.875rem', color: theme.colors.text, opacity: 0.8 }}>
          Forked from: 
          <Link 
            href={`/editor?template=${forkedFromId}`} 
            style={{ 
              color: '#3b82f6',
              marginLeft: '0.25rem',
              '&:hover': { textDecoration: 'underline' } 
            }}
          >
            Template #{forkedFromId}
          </Link>
        </Typography>
      )}
    </Box>
  )
}

