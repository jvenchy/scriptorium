import React, { useState, useEffect, SetStateAction } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/NavBar';
import TagEditor from '@/components/TagEditor';
import TemplateSearch from '@/components/TemplateSearch';
import { useTheme } from '@/contexts/ThemeContext';

interface Template {
  id: string;
  title: string;
}

const CreatePost: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    codeTemplates: [] as string[],
  });
  const [error, setError] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/blogPosts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.map(tag => tag.trim()), // Ensure tags are trimmed
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      await router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleTemplateToggle = (template: string) => {
    setFormData(prev => ({
      ...prev,
      codeTemplates: prev.codeTemplates.includes(template)
        ? prev.codeTemplates.filter(t => t !== template)
        : [...prev.codeTemplates, template],
    }));
  };

  const handleTemplateSelect = (template: Template) => {
    if (!selectedTemplates.some(t => t.id === template.id)) {
      setSelectedTemplates(prev => [...prev, template]);
      setFormData(prev => ({
        ...prev,
        codeTemplates: [...prev.codeTemplates, template.id],
      }));
    }
  };

  const handleTemplateRemove = (templateId: string) => {
    setSelectedTemplates(prev => prev.filter(t => t.id !== templateId));
    setFormData(prev => ({
      ...prev,
      codeTemplates: prev.codeTemplates.filter(id => id !== templateId),
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  // Define the setTags function
  const setTags = (newTags: SetStateAction<string[]>) => {
    setFormData(prev => ({ ...prev, tags: typeof newTags === 'function' ? newTags(prev.tags) : newTags }));
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: theme.colors.background,
      color: theme.colors.text,
      transition: 'all 0.3s ease'
    }}>
      <Navbar
        isAuthenticated={isAuthenticated}
        onAuthClick={() => {}}
        onLogoutClick={() => {}}
        user={user}
        onCreatePostClick={() => {}}
      />

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          ml: '240px', 
          p: 4,
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            p: 4,
            bgcolor: theme.colors.cardBackground,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 2,
            maxWidth: 800,
            mx: 'auto',
            transition: 'all 0.3s ease'
          }}
        >
          <Stack spacing={4}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 1,
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: 'bold',
                  color: theme.colors.text
                }}
              >
                Create a New Blog Post
              </Typography>
              <Typography 
                sx={{ 
                  fontFamily: 'monospace',
                  color: theme.colors.text,
                  opacity: 0.7
                }}
              >
                Share your knowledge with the Scriptorium community
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  sx={{
                    '& .MuiInputBase-root': { 
                      fontFamily: 'monospace',
                      bgcolor: theme.colors.cardBackground,
                      color: theme.colors.text,
                      fontSize: '1.25rem',
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.colors.text,
                      fontFamily: 'monospace',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.colors.border,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.colors.border,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.colors.text,
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  multiline
                  rows={4}
                  sx={{
                    '& .MuiInputBase-root': { 
                      fontFamily: 'monospace',
                      bgcolor: theme.colors.cardBackground,
                      color: theme.colors.text,
                      fontSize: '1rem',
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.colors.text,
                      fontFamily: 'monospace',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.colors.border,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.colors.border,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.colors.text,
                      },
                    },
                  }}
                />

                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontFamily: 'monospace',
                      color: theme.colors.text
                    }}
                  >
                    Tags
                  </Typography>
                  <TagEditor 
                    tags={formData.tags}
                    setTags={setTags}
                  />
                </Box>

                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontFamily: 'monospace',
                      color: theme.colors.text
                    }}
                  >
                    Code Templates
                  </Typography>
                  <TemplateSearch 
                    onSelect={handleTemplateSelect}
                    userOnly={true}
                    selectedTemplates={selectedTemplates}
                    onRemove={handleTemplateRemove}
                  />
                </Box>

                {error && (
                  <Typography 
                    color="error" 
                    sx={{ 
                      fontFamily: 'monospace'
                    }}
                  >
                    {error}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ 
                    fontFamily: 'monospace',
                    bgcolor: theme.isDarkMode ? theme.colors.text : 'common.black',
                    color: theme.isDarkMode ? theme.colors.background : 'common.white',
                    py: 1.5,
                    '&:hover': {
                      bgcolor: theme.isDarkMode ? theme.colors.text : 'common.black',
                      opacity: 0.9,
                    },
                  }}
                >
                  Create Blog Post
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreatePost;