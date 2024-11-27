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

  // useEffect(() => {
  //   setSearchParams({ contentType });
  // }, [contentType, setSearchParams]);

  const fetchTemplates = async (searchText: string) => {
    try {
      const queryParams = new URLSearchParams({
        title: searchText,
        sort: 'id_desc',
        page: '1',
        limit: '10'
      });

      const response = await fetch(`/api/code-templates?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch templates");

      const data = await response.json();
      setTemplateOptions(data.codeTemplates.map((template: any) => ({
        id: template.id,
        title: template.title
      })));
    } catch (error) {
      console.error("Error fetching templates:", error);
      setTemplateOptions([]);
    }
  };

  const handleTemplateSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInputChange("blogTemplates", value);
    await fetchTemplates(value);
  };

  const handleSearch = async () => {
    try {
      // Reset pagination before searching
      setSearchParams({ page: 1 });
      
      const queryParams = new URLSearchParams({
        title: searchParams.title,
        description: searchParams.description,
        tags: searchParams.tags,
        contentType: searchParams.contentType,
        sort: searchParams.sort,
        page: '1', // Always use page 1 for new searches
        limit: searchParams.limit.toString()
      });

      if (searchParams.blogTemplates) {
        queryParams.append('templateName', searchParams.blogTemplates);
      }

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
    // Reset pagination when any search field changes
    setSearchParams({ 
      [field]: value,
      page: 1 
    });
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
