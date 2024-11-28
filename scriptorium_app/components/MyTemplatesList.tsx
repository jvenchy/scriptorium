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
} from "@mui/material";
import { useSearch } from '@/contexts/SearchContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';

export const MyTemplatesList: React.FC = () => {
  const { searchParams, setSearchParams, searchResults, setSearchResults, pagination, setPagination } = useSearch();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    if (isInitialMount && user) {
      fetchTemplates();
      setIsInitialMount(false);
    }
  }, [isInitialMount, user]);

  useEffect(() => {
    if (!isInitialMount && user) {
      setSearchParams({ page: 1 });
      const timeoutId = setTimeout(fetchTemplates, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [
    searchParams.title,
    searchParams.description,
    searchParams.tags,
    searchParams.sort
  ]);

  useEffect(() => {
    if (!isInitialMount && searchParams.page && user) {
      fetchTemplates();
    }
  }, [searchParams.page]);

  const fetchTemplates = async () => {
    if (!user) return;

    try {
      const queryParams = new URLSearchParams({
        page: searchParams.page?.toString() || '1',
        limit: searchParams.limit.toString(),
        sort: searchParams.sort,
        author: user.id.toString()
      });

      if (searchParams.title) queryParams.append('title', searchParams.title);
      if (searchParams.tags) queryParams.append('tags', searchParams.tags);
      if (searchParams.description) queryParams.append('explanation', searchParams.description);

      const response = await fetch(`/api/code-templates?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      setSearchResults(data.codeTemplates);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching templates:', error);
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
          searchResults.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Link 
                href={`/editor?template=${template.id}`}
                style={{ textDecoration: 'none' }}
              >
                <Card 
                  sx={{ 
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
                  }}
                >
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
                      {template.title}
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
                      {template.explanation}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                      {template.tags.map((tag) => (
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
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.colors.text
                      }}
                    >
                      {new Date(template.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography 
              variant="body1" 
              sx={{ 
                textAlign: 'center',
                color: theme.colors.text 
              }}
            >
              No templates found
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