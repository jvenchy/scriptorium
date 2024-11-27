import React, { useState, useEffect, useMemo } from "react";
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

const ITEMS_PER_PAGE = 10;

export const BlogPostList: React.FC = () => {
  const { searchParams, setSearchParams, searchResults, setSearchResults, pagination, setPagination } = useSearch();
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Create a stable reference for the fetch function
  const fetchPosts = useMemo(() => async () => {
    try {
      const queryParams = new URLSearchParams({
        page: searchParams.page.toString(),
        limit: searchParams.limit.toString(),
        sort: searchParams.sort
      });

      if (searchParams.title) queryParams.append('title', searchParams.title);
      if (searchParams.description) queryParams.append('description', searchParams.description);
      if (searchParams.tags) queryParams.append('tags', searchParams.tags);
      if (searchParams.blogTemplates) queryParams.append('codeTemplateId', searchParams.blogTemplates);

      const response = await fetch(`/api/blogPosts?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      
      const data = await response.json();
      setSearchResults(data.posts);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setSearchResults([]);
    }
  }, [searchParams, setSearchResults, setPagination]);

  // Initial fetch on mount
  useEffect(() => {
    if (isInitialMount) {
      fetchPosts();
      setIsInitialMount(false);
    }
  }, [isInitialMount, fetchPosts]);

  // Handle subsequent search parameter changes
  useEffect(() => {
    if (!isInitialMount) {
      const timeoutId = setTimeout(fetchPosts, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [fetchPosts, isInitialMount]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams({ page: value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {searchResults.length > 0 ? (
          searchResults.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Link 
                href={`/blog/${post.id}`} 
                style={{ textDecoration: 'none' }}
              >
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        fontWeight: 'bold',
                        mb: 1
                      }}
                    >
                      {post.title}
                    </Typography>

                    <Typography 
                      variant="body2" 
                      color="text.primary"
                      sx={{ 
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        height: '2em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      // {post.author.firstName} {post.author.lastName}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontFamily: 'monospace',
                        mb: 2,
                        height: '3em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {post.description}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                      {post.tags.map((tag: {id: number; name: string}) => (
                        <Chip key={tag.id} label={tag.name} size="small" />
                      ))}
                    </Stack>
                    
                    {post.codeTemplates.length > 0 && (
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
                          <IconButton
                            size="small"
                            sx={{
                              color: 'dodgerblue',
                              padding: 0,
                            }}
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        Template: {post.codeTemplates[0].title}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Box>
                        <Tooltip title="Upvotes">
                          <IconButton size="small">
                            <ThumbUpIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption" sx={{ mr: 1 }}>{post.stats.upvotes}</Typography>
                        <Tooltip title="Downvotes">
                          <IconButton size="small">
                            <ThumbDownIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption" sx={{ mr: 1 }}>{post.stats.downvotes}</Typography>
                        <Tooltip title="Comments">
                          <IconButton size="small">
                            <CommentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Typography variant="caption">{post.stats.comments}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
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
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
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
          />
        </Box>
      )}
    </Box>
  );
};