import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { Chip, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/contexts/AuthContext';

interface Template {
  id: string;
  title: string;
}

interface TemplateSearchProps {
  onSelect: (template: Template) => void;
  userOnly?: boolean;
  selectedTemplates: Template[];
  onRemove: (templateId: string) => void;
}

const TemplateSearch: React.FC<TemplateSearchProps> = ({ 
  onSelect, 
  userOnly = false, 
  selectedTemplates,
  onRemove 
}) => {
  const { user } = useAuth();

  const loadOptions = async (inputValue: string) => {
    try {
      const queryParams = new URLSearchParams({
        sort: 'id_desc',
        page: '1',
        limit: '10'
      });

      // Add title parameter for both empty and non-empty searches
      queryParams.append('title', inputValue);

      const response = await fetch(`/api/code-templates?${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      
      // Filter out already selected templates
      const selectedIds = selectedTemplates.map(t => t.id);
      const filteredTemplates = data.codeTemplates
        .filter((template: any) => !selectedIds.includes(template.id))
        .map((template: any) => ({
          label: template.title,
          value: template.id,
          template: {
            id: template.id,
            title: template.title
          }
        }));

      return filteredTemplates;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return [];
    }
  };

  const handleChange = (selectedOption: any) => {
    if (selectedOption) {
      onSelect(selectedOption.template);
      // Clear the select input after selection
      return null;
    }
  };

  return (
    <div>
      <AsyncSelect
        cacheOptions={false} // Disable caching to ensure fresh results
        loadOptions={loadOptions}
        onChange={handleChange}
        value={null}
        placeholder="Search for templates"
        defaultOptions={true}
        noOptionsMessage={({ inputValue }) => 
          "No templates found"
        }
        styles={{
          container: (provided) => ({
            ...provided,
            marginBottom: '16px',
          }),
          control: (provided) => ({
            ...provided,
            fontFamily: 'monospace',
            borderColor: '#ccc',
            minHeight: '40px',
          }),
          input: (provided) => ({
            ...provided,
          }),
          menu: (provided) => ({
            ...provided,
            fontFamily: 'monospace',
          }),
          option: (provided, state) => ({
            ...provided,
            fontFamily: 'monospace',
            backgroundColor: state.isFocused ? '#e0e0e0' : '#fff',
            color: '#333',
          }),
        }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {selectedTemplates.map((template) => (
          <Chip
            key={template.id}
            label={template.title}
            onDelete={() => onRemove(template.id)}
            sx={{
              fontFamily: 'monospace',
              backgroundColor: '#e0e0e0',
            }}
          />
        ))}
      </Box>
    </div>
  );
};

export default TemplateSearch;