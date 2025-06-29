import React, { useState, useMemo } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { Card, CardContent } from '@/components/ui/card';
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
  Zap
} from 'lucide-react';
import { formatDate, groupBy } from '@/lib/utils';
import { toast } from 'sonner';

interface LeadsKanbanViewProps {
  onLeadClick: (lead: any) => void;
}

export function LeadsKanbanView({ onLeadClick }: LeadsKanbanViewProps) {
  const { filteredLeads, loading, settings, updateSettings } = useLeads();
  const [groupByField, setGroupByField] = useState<string>(settings.kanbanGroupBy || 'status');
  
  const groupByOptions = [
    { value: 'status', label: 'Status' },
    { value: 'stage', label: 'Stage' },
    { value: 'source', label: 'Source' },
    { value: 'associate', label: 'Associate' },
    { value: 'center', label: 'Center' }
  ];
  
  const groupedLeads = useMemo(() => {
    return groupBy(filteredLeads, groupByField as keyof typeof filteredLeads[0]);
  }, [filteredLeads, groupByField]);
  
  const handleGroupByChange = (value: string) => {
    setGroupByField(value);
    updateSettings({
      ...settings,
      kanbanGroupBy: value
    });
  };
  
  const sortedGroups = Object.keys(groupedLeads).sort((a, b) => a.localeCompare(b));
  
  const getInitials = (name: string): string => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'Hot': return 'from-red-500 to-orange-500';
      case 'Warm': return 'from-amber-500 to-yellow-500';
      case 'Cold': return 'from-blue-500 to-cyan-500';
      case 'Converted': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-400';
    }
  };
  
  const getGroupColor = (group: string): string => {
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
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Website': <Globe className="h-4 w-4" />,
      'Referral': <Users className="h-4 w-4" />,
      'Social Media': <Share2 className="h-4 w-4" />,
      'Event': <Calendar className="h-4 w-4" />,
      'Cold Call': <Phone className="h-4 w-4" />,
      'Partner': <Building className="h-4 w-4" />,
      'Email Campaign': <Mail className="h-4 w-4" />
    };
    return icons[source] || <Link className="h-4 w-4" />;
  };

  const getStageIcon = (stage: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Qualification': <Target className="h-4 w-4" />,
      'Needs Analysis': <FileText className="h-4 w-4" />,
      'Proposal': <FileText className="h-4 w-4" />,
      'Negotiation': <MessageSquare className="h-4 w-4" />,
      'Closed Won': <CheckCircle className="h-4 w-4" />,
      'Closed Lost': <XCircle className="h-4 w-4" />
    };
    return icons[stage] || <Flag className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Hot': return <Star className="h-4 w-4 text-amber-500" fill="currentColor" />;
      case 'Warm': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'Cold': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Converted': return <Award className="h-4 w-4 text-green-600" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFollowUpBadges = (lead: any) => {
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
  };
  
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading kanban board...</p>
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
            <p className="text-slate-500">Try adjusting your filters or import some leads to get started.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grip className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Kanban Board</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={groupByField} onValueChange={handleGroupByChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              {groupByOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  Group by {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="kanban-board grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-4 pt-1">
        {sortedGroups.map(group => (
          <div key={group} className="kanban-column flex flex-col rounded-xl overflow-hidden shadow-lg border border-slate-200/60 bg-white">
            <div className={`sticky top-0 z-10 bg-gradient-to-r ${getGroupColor(group)} p-4 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">{group || 'Undefined'}</h3>
                  <Badge className="bg-white/30 text-white hover:bg-white/40 border-white/20">
                    {groupedLeads[group].length}
                  </Badge>
                </div>
                
                <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/20">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 space-y-3 p-4 bg-slate-50/50 overflow-y-auto max-h-[70vh]">
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
                    }))`
                  }}
                  onClick={() => onLeadClick(lead)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                          <AvatarFallback className={`text-xs text-white bg-gradient-to-br ${
                            groupByField === 'status' ? getGroupColor(lead.status) : getGroupColor(group)
                          }`}>
                            {getInitials(lead.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold line-clamp-1 text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {lead.fullName}
                          </h4>
                          {groupByField !== 'status' && lead.status && (
                            <div className="flex items-center gap-1">
                              {getStatusIcon(lead.status)}
                              <Badge 
                                variant="outline"
                                className="text-xs bg-white border-slate-200"
                              >
                                {lead.status}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs space-y-2 text-slate-600">
                      {lead.email && (
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Mail className="h-3 w-3 flex-shrink-0 text-slate-400" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 flex-shrink-0 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {lead.source && groupByField !== 'source' && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-700">
                          {getSourceIcon(lead.source)}
                          <span className="truncate max-w-[80px]">{lead.source}</span>
                        </Badge>
                      )}
                      
                      {groupByField !== 'stage' && lead.stage && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1 bg-purple-50 border-purple-200 text-purple-700">
                          {getStageIcon(lead.stage)}
                          <span className="truncate max-w-[100px]">{lead.stage}</span>
                        </Badge>
                      )}
                    </div>
                    
                    {/* Follow-up Section */}
                    {getFollowUpBadges(lead).length > 0 && (
                      <div className="mt-3">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-slate-500 font-medium flex items-center gap-1 hover:text-slate-700 transition-colors">
                            <MessageSquare className="h-3 w-3" />
                            Follow-ups ({getFollowUpBadges(lead).length})
                          </summary>
                          <div className="mt-2 space-y-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                            {getFollowUpBadges(lead).map((followUp, idx) => (
                              <div key={idx} className="text-xs flex flex-col">
                                <div className="flex items-center gap-1 font-medium text-slate-700">
                                  <CalendarCheck className="h-3 w-3 text-green-600" />
                                  <span>Follow-up {followUp.index}: {formatDate(followUp.date)}</span>
                                </div>
                                {followUp.comment && (
                                  <p className="ml-4 text-slate-600 mt-0.5 line-clamp-2">{followUp.comment}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(lead.createdAt)}
                      </span>
                      
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 border border-white shadow-sm">
                          <AvatarFallback className="text-[8px] bg-slate-200 text-slate-600">
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
                className="w-full justify-start text-xs text-slate-500 hover:text-slate-700 hover:bg-white border-2 border-dashed border-slate-200 hover:border-slate-300 transition-all"
                onClick={() => toast.info("Add new lead functionality coming soon")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}