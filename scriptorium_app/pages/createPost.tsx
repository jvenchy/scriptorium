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

// Sample data - replace with API calls
const availableTemplates = [
  'React Component Boilerplate',
  'Express API Endpoint',
  'Python Data Processing Script',
];

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

  if (!isAuthenticated) {
    return null;
  }

  const filteredTemplates = availableTemplates.filter(template =>
    template.toLowerCase().includes(templateSearch.toLowerCase())
  );

  // Define the setTags function
  const setTags = (newTags: SetStateAction<string[]>) => {
    setFormData(prev => ({ ...prev, tags: typeof newTags === 'function' ? newTags(prev.tags) : newTags }));
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
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
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          <Stack spacing={4}>
            {/* Header */}
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 1,
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: 'bold',
                  color: 'common.black'
                }}
              >
                Create a New Blog Post
              </Typography>
              <Typography 
                sx={{ 
                  fontFamily: 'monospace',
                  color: 'text.secondary'
                }}
              >
                Share your knowledge with the Scriptorium community
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {/* Title & Description */}
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  sx={{
                    '& .MuiInputBase-root': { 
                      fontFamily: 'monospace',
                      bgcolor: 'background.paper'
                    }
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
                      bgcolor: 'background.paper'
                    }
                  }}
                />

                {/* Tags Section */}
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontFamily: 'monospace'
                    }}
                  >
                    Tags
                  </Typography>
                  <TagEditor 
                    tags={formData.tags}
                    setTags={setTags}
                  />
                </Box>

                {/* Code Templates Section */}
                <Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 2,
                      fontFamily: 'monospace'
                    }}
                  >
                    Code Templates
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Search for templates"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiInputBase-root': { 
                        fontFamily: 'monospace',
                        bgcolor: 'background.paper'
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormGroup>
                    <Stack gap={1}>
                      {filteredTemplates.map(template => (
                        <FormControlLabel
                          key={template}
                          control={
                            <Checkbox
                              checked={formData.codeTemplates.includes(template)}
                              onChange={() => handleTemplateToggle(template)}
                              sx={{
                                '&.Mui-checked': {
                                  color: 'primary.main',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography sx={{ fontFamily: 'monospace' }}>
                              {template}
                            </Typography>
                          }
                        />
                      ))}
                    </Stack>
                  </FormGroup>
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
                    bgcolor: 'common.black',
                    color: 'common.white',
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'common.black',
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