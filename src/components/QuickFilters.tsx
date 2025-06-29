import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLeads } from '@/contexts/LeadContext';
import { 
  Clock, 
  Calendar,
  CalendarDays,
  CalendarRange,
  Building
} from 'lucide-react';

export function QuickFilters() {
  const { setFilters, filters, centerOptions } = useLeads();

  const getDateRange = (type: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (type) {
      case 'today':
        return {
          start: today,
          end: today
        };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          start: yesterday,
          end: yesterday
        };
      case 'thisWeek':
        // Get Monday of current week
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so 6 days back to Monday
        startOfWeek.setDate(today.getDate() - daysToMonday);
        
        // Get Sunday of current week
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return {
          start: startOfWeek,
          end: endOfWeek
        };
      case 'lastWeek':
        // Get Monday of last week
        const lastWeekStart = new Date(today);
        const currentDayOfWeek = today.getDay();
        const daysToLastMonday = currentDayOfWeek === 0 ? 13 : currentDayOfWeek + 6; // Go back to last Monday
        lastWeekStart.setDate(today.getDate() - daysToLastMonday);
        
        // Get Sunday of last week
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        
        return {
          start: lastWeekStart,
          end: lastWeekEnd
        };
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          start: startOfMonth,
          end: today
        };
      case 'lastMonth':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          start: lastMonthStart,
          end: lastMonthEnd
        };
      case 'last7Days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return {
          start: sevenDaysAgo,
          end: today
        };
      case 'last30Days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return {
          start: thirtyDaysAgo,
          end: today
        };
      default:
        return { start: null, end: null };
    }
  };

  const handleQuickFilter = (type: string) => {
    const dateRange = getDateRange(type);
    
    // Check if this filter is already active - if so, clear it
    const isCurrentlyActive = (
      filters.dateRange.start?.getTime() === dateRange.start?.getTime() &&
      filters.dateRange.end?.getTime() === dateRange.end?.getTime()
    );
    
    if (isCurrentlyActive) {
      // Clear the filter
      setFilters({
        ...filters,
        dateRange: { start: null, end: null }
      });
    } else {
      // Apply the filter
      setFilters({
        ...filters,
        dateRange
      });
    }
  };

  const handleCenterFilter = (center: string) => {
    const isCurrentlyActive = filters.center.includes(center);
    
    if (isCurrentlyActive) {
      // Remove the center filter
      setFilters({
        ...filters,
        center: filters.center.filter(c => c !== center)
      });
    } else {
      // Add the center filter
      setFilters({
        ...filters,
        center: [...filters.center, center]
      });
    }
  };

  const isActiveFilter = (type: string) => {
    const dateRange = getDateRange(type);
    return (
      filters.dateRange.start?.getTime() === dateRange.start?.getTime() &&
      filters.dateRange.end?.getTime() === dateRange.end?.getTime()
    );
  };

  const isActiveCenterFilter = (center: string) => {
    return filters.center.includes(center);
  };

  const quickFilterButtons = [
    { key: 'today', label: 'Today', icon: Clock },
    { key: 'yesterday', label: 'Yesterday', icon: Clock },
    { key: 'last7Days', label: 'Last 7 Days', icon: CalendarDays },
    { key: 'thisWeek', label: 'This Week', icon: Calendar },
    { key: 'lastWeek', label: 'Last Week', icon: Calendar },
    { key: 'thisMonth', label: 'This Month', icon: CalendarRange },
    { key: 'lastMonth', label: 'Last Month', icon: CalendarRange },
    { key: 'last30Days', label: 'Last 30 Days', icon: CalendarDays },
  ];

  return (
    <Card className="p-4 shadow-sm border-border/30">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Quick Date Filters</h4>
          <div className="flex flex-wrap gap-2">
            {quickFilterButtons.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={isActiveFilter(key) ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickFilter(key)}
                className={`gap-2 h-8 ${
                  isActiveFilter(key) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-primary/10'
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {centerOptions.length > 0 && (
          <div className="flex flex-col space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Center Filters</h4>
            <div className="flex flex-wrap gap-2">
              {centerOptions.map((center) => (
                <Button
                  key={center}
                  variant={isActiveCenterFilter(center) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCenterFilter(center)}
                  className={`gap-2 h-8 ${
                    isActiveCenterFilter(center) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-primary/10'
                  }`}
                >
                  <Building className="h-3 w-3" />
                  {center}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}