import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { fetchLeads, updateLead, addLead, deleteLead, Lead } from '@/services/googleSheets';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { getUniqueValues, countByKey } from '@/lib/utils';
import { toast } from 'sonner';

// Filter criteria for leads
export interface LeadFilters {
  search: string;
  source: string[];
  associate: string[];
  center: string[];
  stage: string[];
  status: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  compareDate?: {
    start: Date | null;
    end: Date | null;
  };
}

// Sort configuration
export interface SortConfig {
  key: keyof Lead;
  direction: 'asc' | 'desc';
}

// View type
export type ViewType = 'table' | 'card' | 'kanban' | 'timeline' | 'pivot' | 'comparison';

// Table display mode
export type DisplayMode = 'compact' | 'detail';

// Tags for bookmarking and categorization
export interface Tag {
  id: string;
  name: string;
  color: string;
}

// Additional settings for display
export interface DisplaySettings {
  rowHeight: number;
  visibleColumns: string[];
  groupBy: string | null;
  kanbanGroupBy: string;
  pivotConfig: {
    rows: string[];
    columns: string[];
    values: string[];
    aggregator: 'count' | 'sum' | 'average';
  };
  theme: 'default' | 'purple' | 'blue' | 'green' | 'dark' | 'light';
}

// Context interface
interface LeadContextType {
  // Data
  leads: Lead[];
  filteredLeads: Lead[];
  loading: boolean;
  error: Error | null;
  
  // Filters
  filters: LeadFilters;
  setFilters: (filters: LeadFilters) => void;
  clearFilters: () => void;
  
  // CRUD operations
  updateLead: (lead: Lead) => Promise<void>;
  addLead: (lead: Lead) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  
  // Display settings
  view: ViewType;
  setView: (view: ViewType) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  settings: DisplaySettings;
  updateSettings: (settings: Partial<DisplaySettings>) => void;
  
  // Pagination
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  
  // Sorting
  sortConfig: SortConfig | null;
  setSortConfig: (config: SortConfig | null) => void;
  
  // Tagging and bookmarking
  tags: Tag[];
  addTag: (tag: Tag) => void;
  removeTag: (tagId: string) => void;
  taggedLeads: Record<string, string[]>; // tag id -> lead ids
  tagLead: (leadId: string, tagId: string) => void;
  untagLead: (leadId: string, tagId: string) => void;
  
  // Statistics
  statusCounts: Record<string, number>;
  sourceStats: Record<string, number>;
  associateStats: Record<string, number>;
  convertedLeadsCount: number;
  ltv: number;
  conversionRate: number;
  
  // Options for filters
  sourceOptions: string[];
  associateOptions: string[];
  centerOptions: string[];
  stageOptions: string[];
  statusOptions: string[];
  
  // Auto-refresh
  lastRefreshed: Date;
  isRefreshing: boolean;
  refreshData: () => Promise<void>;
  
  // Search history
  searchHistory: string[];
  addToSearchHistory: (term: string) => void;
  clearSearchHistory: () => void;
}

// Default values for context
const defaultFilters: LeadFilters = {
  search: '',
  source: [],
  associate: [],
  center: [],
  stage: [],
  status: [],
  dateRange: {
    start: null,
    end: null,
  },
  compareDate: {
    start: null,
    end: null,
  }
};

const defaultSettings: DisplaySettings = {
  rowHeight: 60,
  visibleColumns: [],
  groupBy: null,
  kanbanGroupBy: 'status',
  pivotConfig: {
    rows: ['associate'],
    columns: ['status'],
    values: ['id'],
    aggregator: 'count',
  },
  theme: 'default'
};

// Create context
const LeadContext = createContext<LeadContextType | undefined>(undefined);

// Context provider
export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for leads data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // State for filters, sorting, pagination
  const [filters, setFilters] = useState<LeadFilters>(defaultFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  
  // State for view settings
  const [view, setView] = useState<ViewType>('table');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('detail');
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);
  
  // State for tags and bookmarks
  const [tags, setTags] = useState<Tag[]>([]);
  const [taggedLeads, setTaggedLeads] = useState<Record<string, string[]>>({});
  
  // State for search history
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // Function to refresh data
  const fetchData = useCallback(async () => {
    console.log('Starting data fetch...');
    setLoading(true);
    try {
      const data = await fetchLeads();
      console.log('Data fetched successfully, leads count:', data.length);
      setLeads(data);
      
      // Initialize visible columns if not set
      if (settings.visibleColumns.length === 0 && data.length > 0) {
        const columns = Object.keys(data[0]).filter(key => key !== 'id');
        setSettings(prev => ({
          ...prev,
          visibleColumns: columns,
        }));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch leads'));
      toast.error('Failed to fetch leads data');
    } finally {
      setLoading(false);
      console.log('Data fetch complete, loading state set to false');
    }
  }, [settings.visibleColumns.length]);
  
  // Setup auto-refresh
  const {
    lastRefreshed,
    isRefreshing,
    refresh: refreshData,
  } = useAutoRefresh({
    intervalMs: 15 * 60 * 1000, // 15 minutes
    onRefresh: fetchData,
    enabled: true,
  });
  
  // Initial data fetch
  useEffect(() => {
    console.log('Initial data fetch triggered');
    fetchData();
  }, [fetchData]);
  
  // Update lead
  const handleUpdateLead = async (lead: Lead) => {
    try {
      console.log('Updating lead:', lead.id);
      
      // Show loading state
      toast.info('Saving changes...');
      
      // Save to Google Sheets first
      await updateLead(lead);
      
      // Optimistic update to local state
      setLeads(currentLeads =>
        currentLeads.map(l => (l.id === lead.id ? lead : l))
      );
      
      // Force a fresh fetch after a short delay to ensure data consistency
      setTimeout(async () => {
        try {
          const freshData = await fetchLeads();
          setLeads(freshData);
          console.log('Data refreshed after update');
        } catch (refreshError) {
          console.error('Error refreshing data after update:', refreshError);
        }
      }, 1000);
      
      toast.success('Lead updated successfully');
    } catch (err) {
      console.error('Error updating lead:', err);
      setError(err instanceof Error ? err : new Error('Failed to update lead'));
      toast.error('Failed to update lead. Please try again.');
      
      // Refresh data to get the current state
      await fetchData();
    }
  };
  
  // Add new lead
  const handleAddLead = async (lead: Lead) => {
    try {
      console.log('Adding new lead');
      // Save to Google Sheets
      await addLead(lead);
      
      // Refresh data to get the new lead
      await fetchData();
      toast.success('Lead added successfully');
    } catch (err) {
      console.error('Error adding lead:', err);
      setError(err instanceof Error ? err : new Error('Failed to add lead'));
      toast.error('Failed to add lead');
    }
  };
  
  // Delete lead
  const handleDeleteLead = async (leadId: string) => {
    try {
      console.log('Deleting lead:', leadId);
      // Optimistic delete
      setLeads(currentLeads => currentLeads.filter(l => l.id !== leadId));
      
      // Delete from Google Sheets
      await deleteLead(leadId);
      toast.success('Lead deleted successfully');
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete lead'));
      toast.error('Failed to delete lead');
      
      // Revert optimistic delete
      await fetchData();
    }
  };
  
  // Update display settings
  const updateSettings = (newSettings: Partial<DisplaySettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters(defaultFilters);
  };
  
  // Add tag
  const addTag = (tag: Tag) => {
    setTags(prev => [...prev, tag]);
    setTaggedLeads(prev => ({ ...prev, [tag.id]: [] }));
  };
  
  // Remove tag
  const removeTag = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId));
    setTaggedLeads(prev => {
      const { [tagId]: _, ...rest } = prev;
      return rest;
    });
  };
  
  // Tag a lead
  const tagLead = (leadId: string, tagId: string) => {
    setTaggedLeads(prev => {
      const tagLeads = prev[tagId] || [];
      if (!tagLeads.includes(leadId)) {
        return {
          ...prev,
          [tagId]: [...tagLeads, leadId],
        };
      }
      return prev;
    });
  };
  
  // Untag a lead
  const untagLead = (leadId: string, tagId: string) => {
    setTaggedLeads(prev => {
      const tagLeads = prev[tagId] || [];
      return {
        ...prev,
        [tagId]: tagLeads.filter(id => id !== leadId),
      };
    });
  };
  
  // Add to search history
  const addToSearchHistory = (term: string) => {
    if (term && !searchHistory.includes(term)) {
      setSearchHistory(prev => [term, ...prev].slice(0, 10));
    }
  };
  
  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
  };
  
  // Apply filters to the leads
  const applyFilters = useCallback((leads: Lead[], filters: LeadFilters): Lead[] => {
    let result = [...leads];
    
    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(lead => 
        Object.values(lead).some(value => 
          value && String(value).toLowerCase().includes(searchTerm)
        )
      );
    }
    
    // Apply source filter
    if (filters.source.length > 0) {
      result = result.filter(lead => filters.source.includes(lead.source));
    }
    
    // Apply associate filter
    if (filters.associate.length > 0) {
      result = result.filter(lead => filters.associate.includes(lead.associate));
    }
    
    // Apply center filter
    if (filters.center.length > 0) {
      result = result.filter(lead => filters.center.includes(lead.center));
    }
    
    // Apply stage filter
    if (filters.stage.length > 0) {
      result = result.filter(lead => filters.stage.includes(lead.stage));
    }
    
    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter(lead => filters.status.includes(lead.status));
    }
    
    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter(lead => {
        const createdDate = new Date(lead.createdAt);
        
        if (filters.dateRange.start && filters.dateRange.end) {
          return createdDate >= filters.dateRange.start && createdDate <= filters.dateRange.end;
        }
        
        if (filters.dateRange.start) {
          return createdDate >= filters.dateRange.start;
        }
        
        if (filters.dateRange.end) {
          return createdDate <= filters.dateRange.end;
        }
        
        return true;
      });
    }
    
    return result;
  }, []);
  
  // Apply sorting to the leads
  const applySorting = useCallback((leads: Lead[], sortConfig: SortConfig | null): Lead[] => {
    if (!sortConfig) return leads;
    
    return [...leads].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle different types of values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle dates
      if (aValue && bValue && !isNaN(Date.parse(aValue.toString())) && !isNaN(Date.parse(bValue.toString()))) {
        const dateA = new Date(aValue.toString());
        const dateB = new Date(bValue.toString());
        return sortConfig.direction === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      
      // Default comparison
      return sortConfig.direction === 'asc'
        ? (aValue > bValue ? 1 : -1)
        : (bValue > aValue ? 1 : -1);
    });
  }, []);
  
  // Compute filtered and sorted leads
  const filteredLeads = applySorting(applyFilters(leads, filters), sortConfig);
  
  // Get unique count of leads by email
  const getUniqueLeadsCount = useCallback((leads: Lead[]): number => {
    const uniqueEmails = new Set(leads.map(lead => lead.email));
    return uniqueEmails.size;
  }, []);
  
  // Calculate statistics
  const statusCounts = countByKey(filteredLeads, 'status');
  const sourceStats = countByKey(filteredLeads, 'source');
  const associateStats = countByKey(filteredLeads, 'associate');
  
  // Calculate converted leads (stage = "Membership Sold")
  const convertedLeadsCount = filteredLeads.filter(lead => lead.stage === 'Membership Sold').length;
  
  // Calculate LTV (in INR)
  const avgLeadValue = 75000; // ₹75,000 per conversion
  const ltv = convertedLeadsCount * avgLeadValue;
  
  // Calculate conversion rate based on unique leads
  const uniqueLeadsCount = getUniqueLeadsCount(filteredLeads);
  const conversionRate = uniqueLeadsCount > 0 
    ? (convertedLeadsCount / uniqueLeadsCount) * 100 
    : 0;
  
  // Get options for filters
  const sourceOptions = getUniqueValues(leads, 'source');
  const associateOptions = getUniqueValues(leads, 'associate');
  const centerOptions = getUniqueValues(leads, 'center');
  const stageOptions = getUniqueValues(leads, 'stage');
  const statusOptions = getUniqueValues(leads, 'status');
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  
  // Context value
  const contextValue: LeadContextType = {
    leads,
    filteredLeads,
    loading,
    error,
    
    filters,
    setFilters,
    clearFilters,
    
    updateLead: handleUpdateLead,
    addLead: handleAddLead,
    deleteLead: handleDeleteLead,
    
    view,
    setView,
    displayMode,
    setDisplayMode,
    settings,
    updateSettings,
    
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    
    sortConfig,
    setSortConfig,
    
    tags,
    addTag,
    removeTag,
    taggedLeads,
    tagLead,
    untagLead,
    
    statusCounts,
    sourceStats,
    associateStats,
    convertedLeadsCount,
    ltv,
    conversionRate,
    
    sourceOptions,
    associateOptions,
    centerOptions,
    stageOptions,
    statusOptions,
    
    lastRefreshed,
    isRefreshing,
    refreshData,
    
    searchHistory,
    addToSearchHistory,
    clearSearchHistory,
  };
  
  return (
    <LeadContext.Provider value={contextValue}>
      {children}
    </LeadContext.Provider>
  );
};

// Hook to use the context
export const useLeads = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};
