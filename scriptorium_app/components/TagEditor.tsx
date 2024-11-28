import React, { useState } from 'react';
import { IconButton, TextField, InputAdornment } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTheme } from '@/contexts/ThemeContext';

interface TagEditorProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  isEditing?: boolean;
}

const TagEditor: React.FC<TagEditorProps> = ({ tags, setTags }) => {
  const [newTag, setNewTag] = useState('');
  const { theme } = useTheme();

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="mb-0">
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <span 
            key={index} 
            style={{
              backgroundColor: theme.isDarkMode ? '#3a3b4d' : '#e5e7eb',
              color: theme.colors.text,
              borderRadius: '9999px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {tag}
            <button 
              onClick={() => removeTag(tag)} 
              style={{ 
                marginLeft: '0.5rem',
                color: '#ef4444'
              }}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <TextField
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && addTag()}
        placeholder="Add a tag"
        variant="outlined"
        size="small"
        sx={{
          '& .MuiInputBase-root': { 
            fontFamily: 'monospace',
            bgcolor: theme.colors.cardBackground,
            color: theme.colors.text,
            '& fieldset': {
              borderColor: theme.colors.border,
            },
            '&:hover fieldset': {
              borderColor: theme.colors.border,
            },
          },
          '& .MuiInputLabel-root': {
            color: theme.colors.text,
          },
          width: '200px',
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                onClick={addTag} 
                sx={{ 
                  color: theme.colors.iconColor,
                  '&:hover': {
                    bgcolor: theme.colors.hover,
                  }
                }}
                aria-label="add tag"
              >
                <AddIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </div>
  );
};

export default TagEditor;

