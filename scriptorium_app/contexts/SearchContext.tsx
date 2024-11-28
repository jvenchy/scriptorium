import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SearchParams {
  title: string;
  description: string;
  tags: string;
  blogTemplates: string;
  codeSnippet?: string;
  contentType: 'templates' | 'blogs';
  sort: 'createdAt_desc' | 'createdAt_asc' | 'upvotes' | 'downvotes';
  page: number;
  limit: number;
}

export interface SearchContextType {
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;
  searchResults: any[];
  setSearchResults: (results: any[]) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  setPagination: (pagination: any) => void;
  resetSearch: () => void;
  cleanup: () => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  console.log('SearchProvider rendering');
  
  const defaultSearchParams: SearchParams = {
    title: '',
    description: '',
    tags: '',
    blogTemplates: '',
    contentType: 'blogs',
    sort: 'createdAt_desc',
    page: 1,
    limit: 9
  };

  const [searchParams, setSearchParams] = useState<SearchParams>(defaultSearchParams);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const resetSearch = () => {
    setSearchParams(defaultSearchParams);
  };

  const updateSearchParams = (newParams: Partial<SearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  };

  const cleanup = () => {
    setSearchParams({
      ...defaultSearchParams,
      page: 1,
      limit: 9
    });
    setSearchResults([]);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  };

  return (
    <SearchContext.Provider 
      value={{ 
        searchParams, 
        setSearchParams: updateSearchParams, 
        searchResults, 
        setSearchResults,
        pagination,
        setPagination,
        resetSearch,
        cleanup
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}