import React, { useState, useMemo, useCallback } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  Plus, 
  MoreHorizontal, 
  Grip,
  Calendar,
  CalendarCheck,
  BookmarkCheck,
  User,
  Users,
  Globe,
  Link,
  Share2,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  Flag,
  Target,
  MessageSquare,
  Clock,
  Activity,
  TrendingUp,
  Star,
  Award,
  Zap,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';
import { formatDate, groupBy } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface LeadsKanbanViewProps {
  onLeadClick: (lead: any) => void;
}

export function LeadsKanbanView({ onLeadClick }: LeadsKanbanViewProps) {
  const { filteredLeads, loading, settings, updateSettings } = useLeads();
  const [groupByField, setGroupByField] = useState<string>(settings.kanbanGroupBy || 'status');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [compactMode, setCompactMode] = useState(false);
  const [showAvatars, setShowAvatars] = useState(true);
  const [cardHeight, setCardHeight] = useState([120]);
  const [columnsPerRow, setColumnsPerRow] = useState([4]);
  const [showEmptyColumns, setShowEmptyColumns] = useState(true);
  
  const groupByOptions = [
    { value: 'status', label: 'Status' },
    { value: 'stage', label: 'Stage' },
    { value: 'source', label: 'Source' },
    { value: 'associate', label: 'Associate' },
    { value: 'center', label: 'Center' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'fullName', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' }
  ];
  
  // Memoized grouped leads with performance optimization
  const groupedLeads = useMemo(() => {
    if (!filteredLeads.length) return {};
    
    const grouped = groupBy(filteredLeads, groupByField as keyof typeof filteredLeads[0]);
    
    // Sort leads within each group
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a];
        const bValue = b[sortBy as keyof typeof b];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    });
    
    return grouped;
  }, [filteredLeads, groupByField, sortBy, sortOrder]);
  
  const handleGroupByChange = useCallback((value: string) => {
    setGroupByField(value);
    updateSettings({
      ...settings,
      kanbanGroupBy: value
    });
  }, [settings, updateSettings]);
  
  const sortedGroups = useMemo(() => {
    const groups = Object.keys(groupedLeads);
    if (!showEmptyColumns) {
      return groups.filter(group => groupedLeads[group].length > 0);
    }
    return groups.sort((a, b) => a.localeCompare(b));
  }, [groupedLeads, showEmptyColumns]);
  
  const getInitials = useCallback((name: string): string => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }, []);
  
  const getStatusColor = useCallback((status: string): string => {
    const colors: Record<string, string> = {
      'Hot': 'from-red-500 to-orange-500',
      'Warm': 'from-amber-500 to-yellow-500',
      'Cold': 'from-blue-500 to-cyan-500',
      'Converted': 'from-green-500 to-emerald-500',
      'Won': 'from-green-600 to-emerald-600',
      'Lost': 'from-red-600 to-red-700',
      'Open': 'from-orange-500 to-orange-600'
    };
    return colors[status] || 'from-gray-500 to-gray-400';
  }, []);
  
  const getGroupColor = useCallback((group: string): string => {
    if (groupByField === 'status') {
      return getStatusColor(group);
    }
    
    const colors = [
      'from-indigo-600 to-purple-600',
      'from-sky-600 to-indigo-600',
      'from-emerald-600 to-teal-600',
      'from-amber-600 to-orange-600',
      'from-fuchsia-600 to-pink-600',
      'from-violet-600 to-indigo-600'
    ];
    
    const index = group.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }, [groupByField, getStatusColor]);

  const getSourceIcon = useCallback((source: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Website': <Globe className="h-3 w-3" />,
      'Referral': <Users className="h-3 w-3" />,
      'Social Media': <Share2 className="h-3 w-3" />,
      'Event': <Calendar className="h-3 w-3" />,
      'Cold Call': <Phone className="h-3 w-3" />,
      'Partner': <Building className="h-3 w-3" />,
      'Email Campaign': <Mail className="h-3 w-3" />
    };
    return icons[source] || <Link className="h-3 w-3" />;
  }, []);

  const getStageIcon = useCallback((stage: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Qualification': <Target className="h-3 w-3" />,
      'Needs Analysis': <FileText className="h-3 w-3" />,
      'Proposal': <FileText className="h-3 w-3" />,
      'Negotiation': <MessageSquare className="h-3 w-3" />,
      'Closed Won': <CheckCircle className="h-3 w-3" />,
      'Closed Lost': <XCircle className="h-3 w-3" />
    };
    return icons[stage] || <Flag className="h-3 w-3" />;
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Hot': <Star className="h-3 w-3 text-amber-500" fill="currentColor" />,
      'Warm': <TrendingUp className="h-3 w-3 text-orange-500" />,
      'Cold': <Clock className="h-3 w-3 text-blue-500" />,
      'Converted': <Award className="h-3 w-3 text-green-600" />,
      'Won': <CheckCircle className="h-3 w-3 text-green-600" />,
      'Lost': <XCircle className="h-3 w-3 text-red-600" />
    };
    return icons[status] || <Activity className="h-3 w-3 text-gray-500" />;
  }, []);

  const getFollowUpBadges = useCallback((lead: any) => {
    const followUps = [];
    for (let i = 1; i <= 4; i++) {
      const dateField = `followUp${i}Date`;
      const commentField = `followUp${i}Comments`;
      if (lead[dateField]) {
        followUps.push({
          date: lead[dateField],
          comment: lead[commentField] || '',
          index: i
        });
      }
    }
    return followUps;
  }, []);
  
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground text-sm">Loading kanban board...</p>
      </div>
    );
  }
  
  if (Object.keys(groupedLeads).length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <Zap className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No leads found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your filters or import some leads to get started.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Enhanced Header with Controls */}
      <Card className="border-border/30 shadow-lg bg-gradient-to-r from-slate-50 to-white">
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-teal-600 rounded-lg">
                <Grid3X3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Advanced Kanban Board</h2>
                <p className="text-xs text-slate-600">Drag, drop, and customize your lead management workflow</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select value={groupByField} onValueChange={handleGroupByChange}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  {groupByOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      Group by {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-xs">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-8 px-2"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <Settings className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Kanban Settings</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="compact-mode" className="text-xs">Compact Mode</Label>
                        <Switch
                          id="compact-mode"
                          checked={compactMode}
                          onCheckedChange={setCompactMode}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-avatars" className="text-xs">Show Avatars</Label>
                        <Switch
                          id="show-avatars"
                          checked={showAvatars}
                          onCheckedChange={setShowAvatars}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-empty" className="text-xs">Show Empty Columns</Label>
                        <Switch
                          id="show-empty"
                          checked={showEmptyColumns}
                          onCheckedChange={setShowEmptyColumns}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">Card Height: {cardHeight[0]}px</Label>
                        <Slider
                          value={cardHeight}
                          onValueChange={setCardHeight}
                          max={200}
                          min={80}
                          step={10}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-xs">Columns per Row: {columnsPerRow[0]}</Label>
                        <Slider
                          value={columnsPerRow}
                          onValueChange={setColumnsPerRow}
                          max={6}
                          min={2}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Kanban refreshed")}
                className="h-8 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Kanban Board */}
      <div 
        className="kanban-board grid gap-4 pb-4 pt-1"
        style={{
          gridTemplateColumns: `repeat(${Math.min(columnsPerRow[0], sortedGroups.length)}, minmax(280px, 1fr))`
        }}
      >
        {sortedGroups.map(group => (
          <div key={group} className="kanban-column flex flex-col rounded-xl overflow-hidden shadow-lg border border-slate-200/60 bg-white">
            <div className={`sticky top-0 z-10 bg-gradient-to-r ${getGroupColor(group)} p-3 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <h3 className="text-sm font-semibold truncate">{group || 'Undefined'}</h3>
                  <Badge className="bg-white/30 text-white hover:bg-white/40 border-white/20 text-xs">
                    {groupedLeads[group].length}
                  </Badge>
                </div>
                
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div 
              className="flex-1 space-y-2 p-3 bg-slate-50/50 overflow-y-auto"
              style={{ maxHeight: '70vh' }}
            >
              {groupedLeads[group].map(lead => (
                <Card 
                  key={lead.id} 
                  className="kanban-card shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 bg-white group"
                  style={{
                    borderLeftColor: `hsl(var(--${
                      lead.status === 'Hot' ? 'destructive' : 
                      lead.status === 'Warm' ? 'warning' : 
                      lead.status === 'Cold' ? 'info' : 
                      lead.status === 'Converted' ? 'success' : 'muted'
                    }))`,
                    minHeight: `${cardHeight[0]}px`
                  }}
                  onClick={() => onLeadClick(lead)}
                >
                  <CardContent className={`p-3 ${compactMode ? 'space-y-1' : 'space-y-2'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 flex-1">
                        {showAvatars && (
                          <Avatar className={`border-2 border-white shadow-md ${compactMode ? 'h-6 w-6' : 'h-8 w-8'}`}>
                            <AvatarFallback className={`text-white bg-gradient-to-br ${
                              groupByField === 'status' ? getGroupColor(lead.status) : getGroupColor(group)
                            } ${compactMode ? 'text-xs' : 'text-sm'}`}>
                              {getInitials(lead.fullName)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="space-y-1 flex-1 min-w-0">
                          <h4 className={`font-semibold line-clamp-1 text-slate-800 group-hover:text-indigo-600 transition-colors ${
                            compactMode ? 'text-xs' : 'text-sm'
                          }`}>
                            {lead.fullName}
                          </h4>
                          {groupByField !== 'status' && lead.status && (
                            <div className="flex items-center gap-1">
                              {getStatusIcon(lead.status)}
                              <Badge 
                                variant="outline"
                                className={`bg-white border-slate-200 ${compactMode ? 'text-xs px-1 py-0' : 'text-xs'}`}
                              >
                                {lead.status}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!compactMode && (
                      <div className="text-xs space-y-1 text-slate-600">
                        {lead.email && (
                          <div className="flex items-center gap-1 overflow-hidden">
                            <Mail className="h-2.5 w-2.5 flex-shrink-0 text-slate-400" />
                            <span className="truncate text-xs">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5 flex-shrink-0 text-slate-400" />
                            <span className="text-xs">{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {lead.source && groupByField !== 'source' && (
                        <Badge variant="outline" className={`flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-700 ${
                          compactMode ? 'text-xs px-1 py-0' : 'text-xs'
                        }`}>
                          {getSourceIcon(lead.source)}
                          <span className="truncate max-w-[60px]">{lead.source}</span>
                        </Badge>
                      )}
                      
                      {groupByField !== 'stage' && lead.stage && (
                        <Badge variant="outline" className={`flex items-center gap-1 bg-purple-50 border-purple-200 text-purple-700 ${
                          compactMode ? 'text-xs px-1 py-0' : 'text-xs'
                        }`}>
                          {getStageIcon(lead.stage)}
                          <span className="truncate max-w-[80px]">{lead.stage}</span>
                        </Badge>
                      )}
                    </div>
                    
                    {/* Follow-up Section */}
                    {!compactMode && getFollowUpBadges(lead).length > 0 && (
                      <div className="mt-2">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-slate-500 font-medium flex items-center gap-1 hover:text-slate-700 transition-colors">
                            <MessageSquare className="h-2.5 w-2.5" />
                            Follow-ups ({getFollowUpBadges(lead).length})
                          </summary>
                          <div className="mt-1 space-y-1 bg-slate-50 p-2 rounded-md border border-slate-100">
                            {getFollowUpBadges(lead).slice(0, 2).map((followUp, idx) => (
                              <div key={idx} className="text-xs flex flex-col">
                                <div className="flex items-center gap-1 font-medium text-slate-700">
                                  <CalendarCheck className="h-2.5 w-2.5 text-green-600" />
                                  <span>F{followUp.index}: {formatDate(followUp.date)}</span>
                                </div>
                                {followUp.comment && (
                                  <p className="ml-3 text-slate-600 mt-0.5 line-clamp-1 text-xs">{followUp.comment}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className={`text-slate-500 flex items-center gap-1 ${compactMode ? 'text-xs' : 'text-xs'}`}>
                        <Clock className="h-2.5 w-2.5" />
                        {formatDate(lead.createdAt)}
                      </span>
                      
                      <div className="flex items-center">
                        <Avatar className={`border border-white shadow-sm ${compactMode ? 'h-4 w-4' : 'h-5 w-5'}`}>
                          <AvatarFallback className="bg-slate-200 text-slate-600" style={{ fontSize: compactMode ? '6px' : '8px' }}>
                            {getInitials(lead.associate || 'NA')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                variant="ghost" 
                className={`w-full justify-start text-slate-500 hover:text-slate-700 hover:bg-white border-2 border-dashed border-slate-200 hover:border-slate-300 transition-all ${
                  compactMode ? 'text-xs py-1' : 'text-xs'
                }`}
                onClick={() => toast.info("Add new lead functionality coming soon")}
              >
                <Plus className={`mr-2 ${compactMode ? 'h-3 w-3' : 'h-4 w-4'}`} />
                Add Card
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}