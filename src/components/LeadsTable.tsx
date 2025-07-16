import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedBadge } from "@/components/ui/enhanced-badge";
import { useLeads } from '@/contexts/LeadContext';
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Phone, 
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
  Zap,
  Globe,
  LinkedinIcon,
  FacebookIcon,
  Twitter,
  Instagram,
  Megaphone,
  FilePlus2,
  UserPlus,
  Locate,
  CalendarClock,
  ShoppingCart,
  Hourglass,
  XCircle,
  PhoneCall,
  MessageCircle,
  WalletCards,
  Send,
  Landmark,
  BookX,
  UserX,
  Languages,
  PhoneOff,
  DollarSign,
  Calendar,
  Map,
  HeartPulse,
  LocateFixed,
  Plane,
  ThumbsUp,
  User,
  Ban,
  Settings,
  Bookmark,
  BookmarkCheck,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  X,
  Columns,
  EyeOff,
  Layers,
  TrendingUp,
  Activity,
  Sparkles,
  Target,
  Award,
  Star,
  AlertTriangle as AlertTriangleIcon,
  Flame,
  Snowflake,
  Crown
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDate, groupBy, getFollowUpStatus, formatRevenue } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadsTableProps {
  onLeadClick: (lead: any) => void;
  selectedLeads: string[];
  setSelectedLeads: (leadIds: string[]) => void;
  compactMode?: boolean;
}

export const LeadsTable = ({ onLeadClick, selectedLeads, setSelectedLeads, compactMode = false }: LeadsTableProps) => {
  const { 
    filteredLeads, 
    loading, 
    sortConfig, 
    setSortConfig,
    page,
    pageSize,
    deleteLead,
    setPageSize
  } = useLeads();

  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [bookmarkedLeads, setBookmarkedLeads] = useState<string[]>([]);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [groupByField, setGroupByField] = useState<string>('none');
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    source: true,
    created: true,
    associate: true,
    stage: true,
    status: true,
    remarks: true,
    followUps: true
  });

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('bookmarkedLeads');
    if (savedBookmarks) {
      setBookmarkedLeads(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bookmarkedLeads', JSON.stringify(bookmarkedLeads));
  }, [bookmarkedLeads]);

  const startIndex = (page - 1) * pageSize;
  let displayedLeads = filteredLeads;
  
  // Filter by bookmarks if enabled
  if (showBookmarkedOnly) {
    displayedLeads = displayedLeads.filter(lead => bookmarkedLeads.includes(lead.id));
  }
  
  // Group leads if grouping is enabled
  const groupedLeads = useMemo(() => {
    if (groupByField === 'none') {
      return { '': displayedLeads.slice(startIndex, startIndex + pageSize) };
    }
    
    const grouped = groupBy(displayedLeads, groupByField as keyof typeof displayedLeads[0]);
    
    // Apply pagination to each group
    const paginatedGroups: Record<string, any[]> = {};
    Object.entries(grouped).forEach(([key, leads]) => {
      paginatedGroups[key] = leads;
    });
    
    return paginatedGroups;
  }, [displayedLeads, groupByField, startIndex, pageSize]);

  const handleSort = (key: string) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      deleteLead(id)
        .then(() => {
          toast.success("Lead deleted successfully");
          if (bookmarkedLeads.includes(id)) {
            handleToggleBookmark(id, false);
          }
        })
        .catch((error) => {
          toast.error("Failed to delete lead");
          console.error(error);
        });
    }
  };

  const handleSelectAllLeads = (checked: boolean) => {
    if (checked) {
      const allLeads = Object.values(groupedLeads).flat();
      setSelectedLeads(allLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleToggleBookmark = (id: string, isBookmarked: boolean) => {
    if (isBookmarked) {
      setBookmarkedLeads([...bookmarkedLeads, id]);
      toast.success("Lead bookmarked for quick access");
    } else {
      setBookmarkedLeads(bookmarkedLeads.filter(leadId => leadId !== id));
      toast.success("Lead removed from bookmarks");
    }
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => 
      prev.includes(groupKey) 
        ? prev.filter(key => key !== groupKey)
        : [...prev, groupKey]
    );
  };

  // Get enhanced badge variant for different categories
  const getSourceBadgeVariant = (source: string) => {
    const sourceVariants: Record<string, string> = {
      'Website': 'website',
      'Website Form': 'website',
      'Social Media': 'social',
      'Social - Instagram': 'social',
      'Social - Facebook': 'social',
      'Referral': 'referral',
      'Event': 'event',
      'Cold Call': 'coldcall',
      'Email Campaign': 'email',
      'Other': 'other'
    };
    
    return sourceVariants[source] || 'other';
  };

  const getStageBadgeVariant = (stage: string) => {
    const stageVariants: Record<string, string> = {
      'New Enquiry': 'newenquiry',
      'Initial Contact': 'initialcontact',
      'Trial Scheduled': 'trialscheduled',
      'Trial Completed': 'trialcompleted',
      'Membership Sold': 'membershipsold',
      'Not Interested': 'notinterested',
      'Lost': 'lost'
    };
    
    return stageVariants[stage] || 'default';
  };

  const getStatusBadgeVariant = (status: string) => {
    const statusVariants: Record<string, string> = {
      'Won': 'won',
      'Lost': 'lost',
      'Hot': 'hot',
      'Warm': 'warm',
      'Cold': 'cold',
      'Converted': 'converted',
      'Open': 'open',
      'Disqualified': 'disqualified',
      'Unresponsive': 'unresponsive'
    };
    
    return statusVariants[status] || 'default';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <Card className="shadow-md border-border/30">
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            {Array(5).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-8 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-border/30 overflow-hidden bg-white backdrop-blur-xl">
      {/* Enhanced Header with darker gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b-4 border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 via-slate-900/20 to-slate-800/20 animate-pulse"></div>
        <div className="relative flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Activity className="h-6 w-6 text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide font-mono">
                LEAD MANAGEMENT SYSTEM
              </h2>
              <p className="text-slate-300 mt-1 font-mono text-xs uppercase tracking-wider">
                Enhanced table with intelligent analytics & refined badges
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                    className={`text-white hover:bg-white/20 ${showBookmarkedOnly ? "bg-white/20" : ""}`}
                  >
                    {showBookmarkedOnly ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showBookmarkedOnly ? "Show all leads" : "Show only bookmarked leads"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Select value={groupByField} onValueChange={setGroupByField}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white font-mono text-xs">
                <SelectValue placeholder="Group by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No grouping</SelectItem>
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="stage">Stage</SelectItem>
                <SelectItem value="associate">Associate</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Columns className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <Label className="text-xs">Visible Columns</Label>
                  {Object.entries(visibleColumns).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`column-${key}`} className="capitalize text-xs">{key}</Label>
                      <Checkbox 
                        id={`column-${key}`} 
                        checked={value}
                        onCheckedChange={() => toggleColumn(key)}
                      />
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="font-mono text-xs">
            <TableHeader className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 border-b-4 border-slate-600 sticky top-0 z-10">
              <TableRow className="hover:bg-gradient-to-r hover:from-slate-600 hover:via-slate-700 hover:to-slate-600 border-b border-white/10 transition-all duration-200">
                <TableHead className="w-[50px] text-white h-[50px] font-bold text-center text-xs">
                  <Checkbox 
                    checked={selectedLeads.length === Object.values(groupedLeads).flat().length && Object.values(groupedLeads).flat().length > 0}
                    onCheckedChange={handleSelectAllLeads}
                    className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-slate-800"
                  />
                </TableHead>
                {visibleColumns.name && (
                  <TableHead className="min-w-[250px] text-white h-[50px] font-bold text-xs">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('fullName')}>
                      <User className="h-3 w-3 mr-2" />
                      FULL NAME
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.source && (
                  <TableHead className="min-w-[100px] text-white h-[50px] font-bold text-xs">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('source')}>
                      <Globe className="h-3 w-3 mr-2" />
                      SOURCE
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.created && (
                  <TableHead className="min-w-[120px] text-white h-[50px] font-bold text-xs">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('createdAt')}>
                      <Calendar className="h-3 w-3 mr-2" />
                      CREATED
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.associate && (
                  <TableHead className="min-w-[160px] text-white h-[50px] font-bold text-xs">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('associate')}>
                      <User className="h-3 w-3 mr-2" />
                      ASSOCIATE
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.stage && (
                  <TableHead className="min-w-[100px] text-white h-[50px] font-bold text-xs">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('stage')}>
                      <Target className="h-3 w-3 mr-2" />
                      STAGE
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.status && (
                  <TableHead className="min-w-[80px] text-white h-[50px] font-bold text-xs">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                      <Activity className="h-3 w-3 mr-2" />
                      STATUS
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.remarks && (
                  <TableHead className="min-w-[200px] text-white h-[50px] font-bold text-xs">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('remarks')}>
                      <FileText className="h-3 w-3 mr-2" />
                      REMARKS
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                <TableHead className="min-w-[120px] text-white h-[50px] font-bold text-xs">
                  <div className="flex items-center">
                    <MessageCircle className="h-3 w-3 mr-2" />
                    FOLLOW-UPS
                  </div>
                </TableHead>
                <TableHead className="text-right w-[100px] text-white h-[50px] font-bold text-xs">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {Object.entries(groupedLeads).map(([groupKey, groupLeads]) => (
                <React.Fragment key={groupKey}>
                  {groupByField !== 'none' && groupKey && (
                    <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 border-b-2 border-slate-300">
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 3} className="h-[50px]">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleGroup(groupKey)}
                            className="flex items-center gap-2 font-bold text-slate-800 hover:text-slate-900 text-xs"
                          >
                            {collapsedGroups.includes(groupKey) ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <Layers className="h-4 w-4" />
                            {groupKey} ({groupLeads.length} leads)
                          </Button>
                          <div className="flex items-center gap-4 text-xs text-slate-700 font-semibold">
                            <span>Subtotal: {groupLeads.length} leads</span>
                            <Badge variant="outline" className="bg-white border-slate-300 text-xs">
                              {Math.round((groupLeads.length / filteredLeads.length) * 100)}% of total
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {(groupByField === 'none' || !collapsedGroups.includes(groupKey)) && groupLeads.map((lead) => {
                    const followUpStatus = getFollowUpStatus(lead);
                    
                    return (
                      <TableRow 
                        key={lead.id} 
                        className="h-[50px] hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-100 font-mono"
                        onClick={() => onLeadClick(lead)}
                      >
                        <TableCell className="h-[50px] py-2 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <Checkbox 
                              checked={selectedLeads.includes(lead.id)}
                              onCheckedChange={(checked) => handleSelectLead(lead.id, checked === true)}
                              className="h-3 w-3"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-4 w-4 p-0 ${bookmarkedLeads.includes(lead.id) ? 'text-amber-500' : 'text-slate-400'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBookmark(lead.id, !bookmarkedLeads.includes(lead.id));
                              }}
                            >
                              {bookmarkedLeads.includes(lead.id) ? (
                                <BookmarkCheck className="h-3 w-3" />
                              ) : (
                                <Bookmark className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        
                        {visibleColumns.name && (
                          <TableCell className="h-[50px] py-2 text-left align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-6 w-6 border">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-600 text-white text-xs font-bold">
                                  {getInitials(lead.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="font-bold text-xs text-gray-700 truncate max-w-[180px] cursor-pointer">
                                        {lead.fullName}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-slate-800 text-white">
                                      <p className="font-semibold">{lead.fullName}</p>
                                      <p className="text-xs">{lead.email}</p>
                                      <p className="text-xs">{lead.phone}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  {lead.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-2 w-2" />
                                      <span className="truncate max-w-[120px]">{lead.email}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        
{visibleColumns.source && (
  <TableCell className="h-[50px] py-2 text-center align-middle">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="badge flex items-center gap-1 justify-center whitespace-nowrap">
            <Globe className="h-3 w-3" />
            {lead.source}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-800 text-white">
          <p>Source: {lead.source}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </TableCell>
)}
                        
                        {visibleColumns.created && (
                          <TableCell className="h-[50px] py-2 text-left align-middle">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs text-gray-700 font-semibold cursor-pointer">
                                    {formatDate(lead.createdAt)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-800 text-white">
                                  <p>Created: {formatDate(lead.createdAt)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        )}
                        
                        {visibleColumns.associate && (
                          <TableCell className="h-[50px] py-2 text-left align-middle">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xs font-bold">
                                  {getInitials(lead.associate)}
                                </AvatarFallback>
                              </Avatar>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="truncate text-xs font-semibold text-gray-700 max-w-[120px] cursor-pointer">
                                      {lead.associate}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-800 text-white">
                                    <p>Associate: {lead.associate}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        )}
                        
{visibleColumns.stage && (
  <TableCell className="h-[50px] py-2 text-center align-middle">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="badge flex items-center gap-1 justify-center whitespace-nowrap">
            <Target className="h-3 w-3" />
            {lead.stage}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-800 text-white">
          <p>Stage: {lead.stage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </TableCell>
)}
                        
{visibleColumns.status && (
  <TableCell className="h-[50px] py-2 text-center align-middle">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="badge flex items-center gap-1 justify-center whitespace-nowrap">
            <Activity className="h-3 w-3" />
            {lead.status}
          </span>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-800 text-white">
          <p>Status: {lead.status}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </TableCell>
)}
                        
                        {visibleColumns.remarks && (
                          <TableCell className="h-[50px] py-2 text-left align-middle">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs text-gray-700 truncate max-w-[180px] block cursor-pointer">
                                    {lead.remarks || 'No remarks'}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs bg-slate-800 text-white">
                                  <p className="font-semibold">Remarks:</p>
                                  <p>{lead.remarks || 'No remarks'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        )}
                        
                        {/* Enhanced Follow-ups Column */}
                        <TableCell className="h-[50px] py-2 text-left align-middle" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-semibold">
                                {followUpStatus.completed}/{followUpStatus.total}
                              </span>
                            </div>
                            
                            {followUpStatus.overdue > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1">
                                      <AlertTriangleIcon className="h-3 w-3 text-red-500" />
                                      <span className="text-xs text-red-600 font-medium">
                                        {followUpStatus.overdue}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-red-600 text-white">
                                    <p>{followUpStatus.overdue} follow-up(s) overdue</p>
                                    <p>Lead created {followUpStatus.daysSinceCreated} days ago</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-xs">Follow-up History</h4>
                                  {followUpStatus.followUps.map((followUp, index) => {
                                    const isOverdue = !followUp.isValid && followUpStatus.daysSinceCreated >= followUp.expectedDay;
                                    
                                    return (
                                      <div key={index} className={`p-2 rounded border text-xs ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium">Follow-up {index + 1}</span>
                                          {isOverdue && <AlertTriangleIcon className="h-3 w-3 text-red-500" />}
                                          {followUp.isValid && <CheckCircle className="h-3 w-3 text-green-500" />}
                                          <Clock className="h-3 w-3 text-gray-500" />
                                          <span className="text-xs text-gray-500">Day {followUp.expectedDay}</span>
                                        </div>
                                        {followUp.date ? (
                                          <>
                                            <p className="text-xs text-gray-600">Date: {formatDate(followUp.date)}</p>
                                            <p className="text-xs">{followUp.comments || 'No comments'}</p>
                                          </>
                                        ) : (
                                          <p className="text-xs text-gray-500">
                                            {isOverdue ? `Overdue (expected day ${followUp.expectedDay})` : `Expected on day ${followUp.expectedDay}`}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right h-[50px] py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-5 w-5 p-0 hover:bg-slate-200">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onLeadClick(lead)} className="text-xs">
                                <Edit className="mr-2 h-3 w-3" />
                                Edit Lead
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("View details coming soon")} className="text-xs">
                                <Eye className="mr-2 h-3 w-3" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive text-xs"
                                onClick={() => handleDeleteLead(lead.id)}
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete Lead
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))}
              
              {Object.values(groupedLeads).flat().length === 0 && (
                <TableRow>
                  <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 3} className="text-center py-10 text-slate-500">
                    {showBookmarkedOnly && bookmarkedLeads.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <Bookmark className="h-8 w-8 text-slate-400" />
                        <p>No bookmarked leads found. Bookmark some leads to see them here.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowBookmarkedOnly(false)}
                        >
                          Show All Leads
                        </Button>
                      </div>
                    ) : (
                      <>
                        No leads found. {filteredLeads.length > 0 ? "Try adjusting your filters or pagination." : "Add some leads to get started."}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};