import React, { useState, useEffect } from "react";
import {
  TextField,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import { useSearch } from '@/contexts/SearchContext';
import type { SearchParams } from '@/contexts/SearchContext';

interface SearchBarProps {
  contentType: "templates" | "blogs";
}

const SearchBar: React.FC<SearchBarProps> = ({
  contentType,
}) => {
  const [open, setOpen] = useState(false);
  const [templateOptions, setTemplateOptions] = useState<Array<{id: string, title: string}>>([]);
  const { searchParams, setSearchParams, setSearchResults, setPagination } = useSearch();

  const handleClose = () => setOpen(false);

  const handleSearch = async () => {
    try {
      setSearchParams({ page: 1 });
      
      const queryParams = new URLSearchParams({
        title: searchParams.title,
        sort: searchParams.sort,
        page: '1',
        limit: searchParams.limit.toString()
      });

      if (contentType === 'blogs') {
        if (searchParams.description) queryParams.append('description', searchParams.description);
        if (searchParams.tags) queryParams.append('tags', searchParams.tags);
        if (searchParams.blogTemplates) queryParams.append('templateName', searchParams.blogTemplates);
      } else {
        if (searchParams.description) queryParams.append('explanation', searchParams.description);
        if (searchParams.tags) queryParams.append('tags', searchParams.tags);
        if (searchParams.codeSnippet) queryParams.append('codeSnippet', searchParams.codeSnippet);
      }

      const endpoint = contentType === 'blogs' ? '/api/blogPosts' : '/api/code-templates';
      const response = await fetch(`${endpoint}?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch search results");

      const data = await response.json();
      setSearchResults(contentType === 'blogs' ? data.posts : data.codeTemplates);
      setPagination(data.pagination);
      setOpen(false);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    }
  };

  const handleInputChange = (field: keyof SearchParams, value: string) => {
    setSearchParams({ [field]: value });
  };

  const handleTemplateSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchParams({ blogTemplates: value });
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <SearchIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Search {contentType === 'blogs' ? 'Blog Posts' : 'Templates'}
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Title"
              variant="outlined"
              value={searchParams.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              fullWidth
              label={contentType === 'blogs' ? "Description" : "Explanation"}
              variant="outlined"
              multiline
              rows={2}
              value={searchParams.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />

            {contentType === 'templates' && (
              <TextField
                fullWidth
                label="Code Content"
                variant="outlined"
                multiline
                rows={2}
                value={searchParams.codeSnippet || ''}
                onChange={(e) => handleInputChange("codeSnippet", e.target.value)}
                placeholder="Search within template code"
              />
            )}

            <TextField
              fullWidth
              label="Tags"
              variant="outlined"
              placeholder="Separate tags with commas"
              value={searchParams.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              helperText="Example: javascript, react, typescript"
            />

            {contentType === 'blogs' && (
              <TextField
                fullWidth
                label="Templates"
                variant="outlined"
                value={searchParams.blogTemplates}
                onChange={handleTemplateSearchChange}
                helperText="Search by template name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {contentType === 'blogs' && (
              <TextField
                select
                fullWidth
                label="Sort By"
                value={searchParams.sort}
                onChange={(e) => setSearchParams({ 
                  sort: e.target.value as SearchParams['sort'] 
                })}
              >
                <MenuItem value="createdAt_desc">Newest First</MenuItem>
                <MenuItem value="createdAt_asc">Oldest First</MenuItem>
                <MenuItem value="upvotes">Most Upvoted</MenuItem>
                <MenuItem value="downvotes">Most Downvoted</MenuItem>
              </TextField>
            )}

            {contentType === 'templates' && (
              <TextField
                select
                fullWidth
                label="Sort By"
                value={searchParams.sort}
                onChange={(e) => setSearchParams({ 
                  sort: e.target.value as SearchParams['sort'] 
                })}
              >
                <MenuItem value="createdAt_desc">Newest First</MenuItem>
                <MenuItem value="createdAt_asc">Oldest First</MenuItem>
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              textTransform: 'none',
              color: 'text.secondary'
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ 
              textTransform: 'none',
              px: 3
            }}
          >
            Search
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SearchBar;
