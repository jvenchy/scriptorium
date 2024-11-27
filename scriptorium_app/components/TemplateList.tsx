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
import { useSearch } from '@/contexts/SearchContext';
import Link from 'next/link';

interface Template {
  id: number;
  title: string;
  explanation: string;
  codeSnippet: string;
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
  createdAt: string;
}

const ITEMS_PER_PAGE = 10;

export const TemplateList: React.FC = () => {
  const { searchParams, setSearchParams, searchResults, setSearchResults, pagination, setPagination } = useSearch();
  const [isInitialMount, setIsInitialMount] = useState(true);

  const fetchTemplates = useMemo(() => async () => {
    try {
      const queryParams = new URLSearchParams({
        page: searchParams.page.toString(),
        limit: searchParams.limit.toString(),
        sort: searchParams.sort
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
  }, [searchParams, setSearchResults, setPagination]);

  useEffect(() => {
    if (isInitialMount) {
      fetchTemplates();
      setIsInitialMount(false);
    }
  }, [isInitialMount, fetchTemplates]);

  useEffect(() => {
    if (!isInitialMount) {
      const timeoutId = setTimeout(fetchTemplates, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [fetchTemplates, isInitialMount]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setSearchParams({ page: value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {searchResults.length > 0 ? (
          searchResults.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Link 
                href={`/templates/${template.id}`} 
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
                      {template.title}
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
                      {template.explanation}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                      {template.tags.map((tag: {id: number; name: string}) => (
                        <Chip key={tag.id} label={tag.name} size="small" />
                      ))}
                    </Stack>
                    
                    <Typography variant="caption" color="text.secondary">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
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
          />
        </Box>
      )}
    </Box>
  );
};