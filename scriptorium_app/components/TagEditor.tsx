import React, { useState } from 'react';
import { IconButton, TextField, InputAdornment } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface TagEditorProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

const TagEditor: React.FC<TagEditorProps> = ({ tags, setTags }) => {
  const [newTag, setNewTag] = useState('');

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
          <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
            {tag}
            <button onClick={() => removeTag(tag)} className="ml-2 text-red-500">&times;</button>
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
            bgcolor: 'background.paper'
          },
          width: '200px', // Adjust width as needed
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={addTag} color="primary" aria-label="add tag">
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

