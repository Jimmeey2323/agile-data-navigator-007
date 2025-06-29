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
  CalendarCheck,
  MessageSquareMore,
  MessageSquarePlus
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDate, groupBy } from '@/lib/utils';
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

  // Calculate lead score based on multiple factors
  const calculateLeadScore = (lead: any) => {
    let score = 0;
    
    // Basic information completeness (40 points)
    if (lead.fullName && lead.fullName.trim()) score += 10;
    if (lead.email && lead.email.trim()) score += 10;
    if (lead.phone && lead.phone.trim()) score += 10;
    if (lead.remarks && lead.remarks.trim()) score += 10;
    
    // Stage progression (30 points)
    const stageScores = {
      'New Enquiry': 5,
      'Initial Contact': 10,
      'Trial Scheduled': 20,
      'Trial Completed': 25,
      'Membership Sold': 30,
      'Not Interested': 0,
      'Lost': 0
    };
    score += stageScores[lead.stage as keyof typeof stageScores] || 0;
    
    // Status quality (20 points)
    const statusScores = {
      'Hot': 20,
      'Warm': 15,
      'Cold': 10,
      'Converted': 20,
      'Lost': 0
    };
    score += statusScores[lead.status as keyof typeof statusScores] || 0;
    
    // Follow-up activity (10 points)
    let followUpCount = 0;
    if (lead.followUp1Date) followUpCount++;
    if (lead.followUp2Date) followUpCount++;
    if (lead.followUp3Date) followUpCount++;
    if (lead.followUp4Date) followUpCount++;
    score += followUpCount * 2.5;
    
    return Math.min(Math.round(score), 100);
  };

  // Calculate follow-up status and overdue information
  const getFollowUpStatus = (lead: any) => {
    const createdDate = new Date(lead.createdAt);
    const now = new Date();
    const daysSinceCreated = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const followUps = [
      { date: lead.followUp1Date, comments: lead.followUp1Comments, expectedDay: 1 },
      { date: lead.followUp2Date, comments: lead.followUp2Comments, expectedDay: 3 },
      { date: lead.followUp3Date, comments: lead.followUp3Comments, expectedDay: 5 },
      { date: lead.followUp4Date, comments: lead.followUp4Comments, expectedDay: 7 }
    ];

    let completedCount = 0;
    let overdueCount = 0;
    let nextDue = null;

    followUps.forEach((followUp, index) => {
      if (followUp.date && followUp.date !== '-') {
        completedCount++;
      } else if (daysSinceCreated >= followUp.expectedDay) {
        overdueCount++;
        if (!nextDue) {
          nextDue = followUp.expectedDay;
        }
      }
    });

    return {
      completed: completedCount,
      total: 4,
      overdue: overdueCount,
      nextDue,
      daysSinceCreated
    };
  };

  const getSourceIcon = (source: string) => {
    const sourceIconMap: Record<string, JSX.Element> = {
      'Website': <Globe className="h-4 w-4" />,
      'Website Form': <FilePlus2 className="h-4 w-4" />,
      'Social Media': <Twitter className="h-4 w-4" />,
      'Social - Instagram': <Instagram className="h-4 w-4" />,
      'Social - Facebook': <FacebookIcon className="h-4 w-4" />,
      'Referral': <UserPlus className="h-4 w-4" />,
      'Event': <Locate className="h-4 w-4" />,
      'Cold Call': <PhoneCall className="h-4 w-4" />,
      'Email Campaign': <Mail className="h-4 w-4" />,
      'Other': <HelpCircle className="h-4 w-4" />
    };
    
    return sourceIconMap[source] || <Globe className="h-4 w-4" />;
  };

  const getStageIcon = (stage: string) => {
    const stageIconMap: Record<string, JSX.Element> = {
      'New Enquiry': <Zap className="h-4 w-4" />,
      'Initial Contact': <PhoneCall className="h-4 w-4" />,
      'Trial Scheduled': <Calendar className="h-4 w-4" />,
      'Trial Completed': <CheckCircle className="h-4 w-4" />,
      'Membership Sold': <ShoppingCart className="h-4 w-4" />,
      'Not Interested': <BookX className="h-4 w-4" />,
      'Lost': <UserX className="h-4 w-4" />
    };
    
    return stageIconMap[stage] || <HelpCircle className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Won':
        return <CheckCircle className="h-4 w-4" />;
      case 'Lost':
        return <XCircle className="h-4 w-4" />;
      case 'Hot':
        return <Star className="h-4 w-4" fill="currentColor" />;
      case 'Warm':
        return <TrendingUp className="h-4 w-4" />;
      case 'Cold':
        return <Clock className="h-4 w-4" />;
      case 'Converted':
        return <Award className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Check if lead is open (should show follow-up due icons)
  const isLeadOpen = (lead: any) => {
    const closedStatuses = ['Converted', 'Lost', 'Not Interested', 'Disqualified'];
    const closedStages = ['Membership Sold', 'Not Interested', 'Lost'];
    
    return !closedStatuses.includes(lead.status) && !closedStages.includes(lead.stage);
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
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-b-4 border-slate-600">
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
                Advanced table with intelligent grouping & analytics
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
                <TooltipContent className="bg-black text-white border-cyan-400">
                  <div className="text-center">
                    <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      Bookmarks
                    </div>
                    <div>{showBookmarkedOnly ? "Show all leads" : "Show only bookmarked leads"}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Select value={groupByField} onValueChange={setGroupByField}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white font-mono">
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
                  <Label>Visible Columns</Label>
                  {Object.entries(visibleColumns).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`column-${key}`} className="capitalize">{key}</Label>
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
          <Table className="font-mono text-sm">
            <TableHeader className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 border-b-4 border-slate-600 sticky top-0 z-10">
              <TableRow className="border-b border-white/10 transition-all duration-200 hover:shadow-[0_2px_0_0_#06b6d4]">
                <TableHead className="w-[50px] text-white h-[60px] font-bold text-center text-xs">
                  <Checkbox 
                    checked={selectedLeads.length === Object.values(groupedLeads).flat().length && Object.values(groupedLeads).flat().length > 0}
                    onCheckedChange={handleSelectAllLeads}
                    className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-slate-800"
                  />
                </TableHead>
                {visibleColumns.name && (
                  <TableHead className="min-w-[280px] text-white h-[60px] font-bold text-xs hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('fullName')}>
                      <User className="h-3 w-3 mr-2" />
                      FULL NAME
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.source && (
                  <TableHead className="min-w-[200px] text-white h-[60px] font-bold text-xs hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('source')}>
                      <Globe className="h-3 w-3 mr-2" />
                      SOURCE
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.created && (
                  <TableHead className="min-w-[160px] text-white h-[60px] font-bold text-xs hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('createdAt')}>
                      <Calendar className="h-3 w-3 mr-2" />
                      CREATED
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.associate && (
                  <TableHead className="min-w-[200px] text-white h-[60px] font-bold text-xs hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('associate')}>
                      <User className="h-3 w-3 mr-2" />
                      ASSOCIATE
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.stage && (
                  <TableHead className="min-w-[200px] text-white h-[60px] font-bold text-xs hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('stage')}>
                      <Target className="h-3 w-3 mr-2" />
                      STAGE
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.status && (
                  <TableHead className="min-w-[160px] text-white h-[60px] font-bold text-xs hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('status')}>
                      <Activity className="h-3 w-3 mr-2" />
                      STATUS
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                {visibleColumns.remarks && (
                  <TableHead className="min-w-[250px] text-white h-[60px] font-bold text-xs hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('remarks')}>
                      <FileText className="h-3 w-3 mr-2" />
                      REMARKS
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                )}
                <TableHead className="min-w-[300px] text-white h-[60px] font-bold text-xs">
                  <div className="flex items-center">
                    <MessageSquareMore className="h-4 w-4 mr-2" />
                    FOLLOW-UPS
                  </div>
                </TableHead>
                <TableHead className="text-right w-[120px] text-white h-[60px] font-bold text-xs">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {Object.entries(groupedLeads).map(([groupKey, groupLeads]) => (
                <React.Fragment key={groupKey}>
                  {groupByField !== 'none' && groupKey && (
                    <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 border-b-2 border-slate-300">
                      <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 3} className="h-[60px]">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleGroup(groupKey)}
                            className="flex items-center gap-2 font-bold text-slate-800 hover:text-slate-900"
                          >
                            {collapsedGroups.includes(groupKey) ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <Layers className="h-4 w-4" />
                            {groupKey} ({groupLeads.length} leads)
                          </Button>
                          <div className="flex items-center gap-4 text-sm text-slate-700 font-semibold">
                            <span>Subtotal: {groupLeads.length} leads</span>
                            <Badge variant="outline" className="bg-white border-slate-300">
                              {Math.round((groupLeads.length / filteredLeads.length) * 100)}% of total
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {(groupByField === 'none' || !collapsedGroups.includes(groupKey)) && groupLeads.map((lead) => {
                    const followUpStatus = getFollowUpStatus(lead);
                    const leadScore = calculateLeadScore(lead);
                    const isOpen = isLeadOpen(lead);
                    
                    return (
                      <TableRow 
                        key={lead.id} 
                        className="h-[60px] hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-100 font-mono"
                        onClick={() => onLeadClick(lead)}
                      >
                        <TableCell className="h-[60px] py-2 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <Checkbox 
                              checked={selectedLeads.includes(lead.id)}
                              onCheckedChange={(checked) => handleSelectLead(lead.id, checked === true)}
                              className="h-4 w-4"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-5 w-5 p-0 ${bookmarkedLeads.includes(lead.id) ? 'text-amber-500' : 'text-slate-400'}`}
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
                          <TableCell className="h-[60px] py-2 text-left align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-7 w-7 border">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-600 text-white text-xs font-bold">
                                  {getInitials(lead.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="font-bold text-sm text-gray-700 cursor-pointer">
                                        {lead.fullName}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-black text-white border-cyan-400">
                                      <div className="text-center">
                                        <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          Lead Profile
                                        </div>
                                        <div className="font-semibold">{lead.fullName}</div>
                                        <div className="text-xs">{lead.email}</div>
                                        <div className="text-xs">{lead.phone}</div>
                                        <div className="text-xs mt-1">Score: {leadScore}%</div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  {lead.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      <span className="truncate max-w-[140px]">{lead.email}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-amber-500" />
                                    <span className="font-semibold">{leadScore}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        )}
                        
                        {visibleColumns.source && (
                          <TableCell className="h-[60px] py-2 text-left align-middle">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-800 flex items-center gap-4 w-[180px] justify-start h-6 font-mono text-xs cursor-pointer border rounded-xl">
                                    {getSourceIcon(lead.source)}
                                    <span className="text-white font-semibold">{lead.source}</span>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white border-cyan-400">
                                  <div className="text-center">
                                    <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                                      <Globe className="h-3 w-3" />
                                      Source
                                    </div>
                                    <div>Source: {lead.source}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        )}
                        
                        {visibleColumns.created && (
                          <TableCell className="h-[60px] py-2 text-left align-middle">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm text-gray-700 font-semibold cursor-pointer">
                                    {formatDate(lead.createdAt)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white border-cyan-400">
                                  <div className="text-center">
                                    <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Created
                                    </div>
                                    <div>Created: {formatDate(lead.createdAt)}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        )}
                        
                        {visibleColumns.associate && (
                          <TableCell className="h-[60px] py-2 text-left align-middle">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xs font-bold">
                                  {getInitials(lead.associate)}
                                </AvatarFallback>
                              </Avatar>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-sm font-semibold text-gray-700 cursor-pointer">
                                      {lead.associate}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-black text-white border-cyan-400">
                                    <div className="text-center">
                                      <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        Associate
                                      </div>
                                      <div>Associate: {lead.associate}</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        )}
                        
                        {visibleColumns.stage && (
                          <TableCell className="h-[60px] py-2 text-left align-middle">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-emerald-800 flex items-center gap-4 w-[180px] justify-start h-6 font-mono text-xs cursor-pointer border rounded-xl">
                                    {getStageIcon(lead.stage)}
                                    <span className="text-white font-semibold">{lead.stage}</span>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white border-cyan-400">
                                  <div className="text-center">
                                    <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      Stage
                                    </div>
                                    <div>Stage: {lead.stage}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        )}
                        
                        {visibleColumns.status && (
                          <TableCell className="h-[60px] py-2 text-left align-middle">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white border-red-800 flex items-center gap-4 w-[180px] justify-start h-6 font-mono text-xs cursor-pointer border rounded-xl">
                                    {getStatusIcon(lead.status)}
                                    <span className="text-xs text-white font-semibold">{lead.status}</span>
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white border-cyan-400">
                                  <div className="text-center">
                                    <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                                      <Activity className="h-3 w-3" />
                                      Status
                                    </div>
                                    <div>Status: {lead.status}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        )}
                        
                        {visibleColumns.remarks && (
                          <TableCell className="h-[60px] py-2 text-left align-middle">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm text-gray-700 truncate max-w-[200px] block cursor-pointer">
                                    {lead.remarks || 'No remarks'}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="bg-black text-white border-cyan-400 max-w-xs">
                                  <div className="text-center">
                                    <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                                      <FileText className="h-3 w-3" />
                                      Remarks
                                    </div>
                                    <div>{lead.remarks || 'No remarks'}</div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        )}
                        
                        {/* Follow-ups Column - Enhanced */}
                        <TableCell className="h-[60px] py-2 text-left align-middle" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <MessageSquarePlus className="h-5 w-5 text-blue-600" />
                              <span className="text-sm font-semibold">
                                {followUpStatus.completed}/{followUpStatus.total}
                              </span>
                            </div>
                            
                            {isOpen && followUpStatus.overdue > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1">
                                      <AlertTriangleIcon className="h-5 w-5 text-red-500" />
                                      <span className="text-xs text-red-600 font-medium">
                                        {followUpStatus.overdue}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-black text-white border-red-400">
                                    <div className="text-center">
                                      <div className="text-red-400 font-semibold mb-1 flex items-center gap-1">
                                        <AlertTriangleIcon className="h-3 w-3" />
                                        Overdue
                                      </div>
                                      <div>{followUpStatus.overdue} follow-up(s) overdue</div>
                                      <div>Lead created {followUpStatus.daysSinceCreated} days ago</div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <ScrollArea className="h-64">
                                  <div className="space-y-3">
                                    <h4 className="font-semibold">Follow-up History</h4>
                                    {[1, 2, 3, 4].map(num => {
                                      const date = lead[`followUp${num}Date`];
                                      const comments = lead[`followUp${num}Comments`];
                                      const expectedDay = [1, 3, 5, 7][num - 1];
                                      const isOverdue = !date && followUpStatus.daysSinceCreated >= expectedDay && isOpen;
                                      
                                      return (
                                        <div key={num} className={`p-3 rounded border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                                          <div className="flex items-center gap-2 mb-1">
                                            <CalendarCheck className="h-4 w-4 text-blue-600" />
                                            <span className="font-medium text-sm">Follow-up {num}</span>
                                            {isOverdue && <AlertTriangleIcon className="h-4 w-4 text-red-500" />}
                                            {date && <CheckCircle className="h-4 w-4 text-green-500" />}
                                          </div>
                                          {date ? (
                                            <>
                                              <p className="text-xs text-gray-600">Date: {formatDate(date)}</p>
                                              <p className="text-xs">{comments || 'No comments'}</p>
                                            </>
                                          ) : (
                                            <p className="text-xs text-gray-500">
                                              {isOverdue ? `Overdue (expected day ${expectedDay})` : `Expected on day ${expectedDay}`}
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </ScrollArea>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right h-[60px] py-2 align-middle" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-200">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onLeadClick(lead)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Lead
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("View details coming soon")}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteLead(lead.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
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