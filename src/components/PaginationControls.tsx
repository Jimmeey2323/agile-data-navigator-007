
import React from 'react';
import { useLeads } from '@/contexts/LeadContext';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function PaginationControls() {
  const { 
    page, 
    setPage, 
    pageSize, 
    setPageSize, 
    totalPages, 
    filteredLeads 
  } = useLeads();

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setPage(1); // Reset to page 1 when changing page size
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink 
          isActive={page === 1}
          onClick={() => setPage(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Calculate range to display
    let startPage = Math.max(2, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
    
    // Adjust if we're near the end
    if (endPage <= startPage) {
      endPage = startPage;
    }
    
    // Show ellipsis after first page if needed
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink 
            isActive={page === i}
            onClick={() => setPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Show ellipsis before last page if needed
    if (endPage < totalPages - 1 && totalPages > 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink 
            isActive={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div>
          Showing {Math.min((page - 1) * pageSize + 1, filteredLeads.length)} to {Math.min(page * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
        </div>
        <div className="flex items-center gap-2">
          <span>Show</span>
          <Select
            value={String(pageSize)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
      </div>
      
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage(page > 1 ? page - 1 : 1)}
              className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {generatePaginationItems()}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
              className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
