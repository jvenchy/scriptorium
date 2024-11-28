import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Pagination,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import CommentIcon from '@mui/icons-material/Comment';
import LinkIcon from '@mui/icons-material/Link';
import { useSearch } from '@/contexts/SearchContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  description: string;
  author: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  tags: Array<{
    id: number;
    name: string;
  }>;
  codeTemplates: Array<{
    id: number;
    title: string;
  }>;
  stats: {
    upvotes: number;
    downvotes: number;
    comments: number;
    reports: number;
    visibility: boolean;
  };
  createdAt: string;
}

export const MyBlogPostList: React.FC = () => {
  const { searchParams, setSearchParams, searchResults, setSearchResults, pagination, setPagination } = useSearch();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPosts();
      setIsInitialMount(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isInitialMount && user) {
      setSearchParams({ page: 1 });
      const timeoutId = setTimeout(fetchPosts, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [
    searchParams.title,
    searchParams.description,
    searchParams.tags,
    searchParams.blogTemplates,
    searchParams.sort
  ]);

  useEffect(() => {
    if (!isInitialMount && searchParams.page && user) {
      fetchPosts();
    }
  }, [searchParams.page]);

  const fetchPosts = async () => {
    if (!user) return;

    try {
      const queryParams = new URLSearchParams({
        page: searchParams.page?.toString() || '1',
        limit: searchParams.limit.toString(),
        sort: searchParams.sort,
        author: user.id.toString()
      });

      if (searchParams.title) queryParams.append('title', searchParams.title);
      if (searchParams.description) queryParams.append('description', searchParams.description);
      if (searchParams.tags) {
        const tagNames = Array.isArray(searchParams.tags) ? 
          searchParams.tags.map(tag => tag.name || tag).join(',') : 
          searchParams.tags;
        queryParams.append('tags', tagNames);
      }
      if (searchParams.blogTemplates) queryParams.append('templateName', searchParams.blogTemplates);

      const response = await fetch(`/api/blogPosts?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setSearchResults(data.posts);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setSearchResults([]);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams({ page: value });
  };

  return (
    <Box sx={{ 
      p: 3,
      bgcolor: theme.colors.background,
      transition: 'all 0.3s ease'
    }}>
      <Grid container spacing={3}>
        {searchResults.length > 0 ? (
          searchResults.map((post: Post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Link 
                href={`/blog/${post.id}`}
                style={{ textDecoration: 'none' }}
              >
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  bgcolor: theme.colors.cardBackground,
                  borderColor: theme.colors.border,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: theme.isDarkMode 
                      ? '0 4px 20px rgba(0,0,0,0.4)'
                      : '0 4px 20px rgba(0,0,0,0.12)',
                    bgcolor: theme.colors.hover,
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        fontWeight: 'bold',
                        mb: 1,
                        color: theme.colors.text
                      }}
                    >
                      {post.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'monospace',
                        mb: 2,
                        height: '3em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        color: theme.colors.text
                      }}
                    >
                      {post.description}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                      {post.tags.map((tag) => (
                        <Chip 
                          key={tag.id} 
                          label={tag.name} 
                          size="small"
                          sx={{
                            bgcolor: theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : undefined,
                            color: theme.colors.text,
                            borderColor: theme.colors.border
                          }}
                        />
                      ))}
                    </Stack>

                    {post.codeTemplates && post.codeTemplates.length > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'dodgerblue',
                          fontFamily: 'monospace',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Template linked to blog post">
                          <IconButton size="small" sx={{ color: 'dodgerblue', padding: 0 }}>
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        Template: {post.codeTemplates[0].title}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Box>
                        <Tooltip title="Upvotes">
                          <IconButton size="small" sx={{ color: theme.colors.iconColor }}>
                            <ThumbUpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption" sx={{ mr: 1, color: theme.colors.text }}>
                          {post.stats?.upvotes || 0}
                        </Typography>
                        <Tooltip title="Downvotes">
                          <IconButton size="small" sx={{ color: theme.colors.iconColor }}>
                            <ThumbDownIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption" sx={{ mr: 1, color: theme.colors.text }}>
                          {post.stats?.downvotes || 0}
                        </Typography>
                        <Tooltip title="Comments">
                          <IconButton size="small" sx={{ color: theme.colors.iconColor }}>
                            <CommentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption" sx={{ color: theme.colors.text }}>
                          {post.stats?.comments || 0}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: theme.colors.text }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ 
              textAlign: 'center',
              color: theme.colors.text 
            }}>
              No posts found
            </Typography>
          </Grid>
        )}
      </Grid>

      {searchResults.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pagination.totalPages}
            page={searchParams.page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};