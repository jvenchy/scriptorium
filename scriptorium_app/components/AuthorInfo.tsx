import Link from 'next/link'
import { Avatar, Box, Typography } from '@mui/material'

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
  return (
    <Box className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <Box className="flex items-center mb-2">
        <Avatar
          src={author.avatar || defaultAvatar}
          sx={{ width: 40, height: 40, mr: 1 }}
        />
        <Box>
          <Typography className="font-semibold">{`${author.firstName} ${author.lastName}`}</Typography>
          <Typography className="text-sm text-gray-500">{author.email}</Typography>
        </Box>
      </Box>
      {forkedFromId && (
        <Typography className="text-sm text-gray-600">
          Forked from: 
          <Link href={`/editor?template=${forkedFromId}`} className="text-blue-500 hover:underline ml-1">
            Template #{forkedFromId}
          </Link>
        </Typography>
      )}
    </Box>
  )
}

