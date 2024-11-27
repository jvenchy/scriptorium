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
  const { searchParams, setSearchParams, setSearchResults, setPagination } = useSearch();

  // useEffect(() => {
  //   setSearchParams({ contentType });
  // }, [contentType, setSearchParams]);

  const handleSearch = async () => {
    try {
      const queryParams = new URLSearchParams({
        title: searchParams.title,
        description: searchParams.description,
        tags: searchParams.tags,
        contentType: searchParams.contentType,
        sort: searchParams.sort,
        page: '1',
        limit: searchParams.limit.toString()
      });

      const response = await fetch(`/api/blogPosts?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch search results");

      const data = await response.json();
      setSearchResults(data.posts);
      setPagination(data.pagination);
      setOpen(false);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchParams({ ...searchParams, [field]: value });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        startIcon={<SearchIcon />}
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          px: 2,
          py: 1,
          borderColor: "divider",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "background.paper",
          },
        }}
      >
        Search {contentType === "templates" ? "Templates" : "Blog Posts"}
      </Button>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6">
            Advanced Search
          </Typography>
          <IconButton 
            edge="end" 
            onClick={handleClose}
            size="small"
            sx={{ color: 'text.secondary' }}
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
              label="Description"
              variant="outlined"
              multiline
              rows={2}
              value={searchParams.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
            <TextField
              fullWidth
              label="Tags"
              variant="outlined"
              placeholder="Separate tags with commas"
              value={searchParams.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              helperText="Example: javascript, react, typescript"
            />
            <TextField
              fullWidth
              label="Templates"
              variant="outlined"
              placeholder="Separate templates with commas"
              value={searchParams.blogTemplates}
              onChange={(e) => handleInputChange("templates", e.target.value)}
              helperText="Example: blog, portfolio, dashboard"
            />
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
