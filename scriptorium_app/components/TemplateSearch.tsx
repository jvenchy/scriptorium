import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { Chip, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();

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
        cacheOptions={false}
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
            backgroundColor: theme.colors.cardBackground,
            borderColor: theme.colors.border,
            minHeight: '40px',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: theme.colors.text,
              boxShadow: theme.isDarkMode 
                ? '0 0 0 1px rgba(255,255,255,0.3)'
                : '0 0 0 1px rgba(0,0,0,0.2)',
            },
          }),
          input: (provided) => ({
            ...provided,
            color: theme.colors.text,
          }),
          menu: (provided) => ({
            ...provided,
            fontFamily: 'monospace',
            backgroundColor: theme.colors.cardBackground,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.isDarkMode 
              ? '0 4px 20px rgba(0,0,0,0.4)'
              : '0 4px 20px rgba(0,0,0,0.1)',
          }),
          option: (provided, state) => ({
            ...provided,
            fontFamily: 'monospace',
            backgroundColor: state.isFocused ? theme.colors.hover : theme.colors.cardBackground,
            color: theme.colors.text,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            padding: '12px 16px',
            '&:hover': {
              backgroundColor: theme.colors.hover,
              transform: 'translateX(4px)',
            },
            '&:active': {
              backgroundColor: theme.colors.hover,
              transform: 'translateX(4px) scale(0.99)',
            },
          }),
          singleValue: (provided) => ({
            ...provided,
            color: theme.colors.text,
          }),
          placeholder: (provided) => ({
            ...provided,
            color: theme.colors.text,
            opacity: 0.7,
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            color: theme.colors.text,
            transition: 'all 0.2s ease',
            '&:hover': {
              color: theme.colors.text,
              opacity: 0.7,
            },
          }),
          indicatorSeparator: (provided) => ({
            ...provided,
            backgroundColor: theme.colors.border,
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
              backgroundColor: theme.isDarkMode ? theme.colors.hover : '#e0e0e0',
              color: theme.colors.text,
              borderColor: theme.colors.border,
              '& .MuiChip-deleteIcon': {
                color: theme.colors.text,
                '&:hover': {
                  color: theme.colors.text,
                  opacity: 0.7,
                },
              },
            }}
          />
        ))}
      </Box>
    </div>
  );
};

export default TemplateSearch;