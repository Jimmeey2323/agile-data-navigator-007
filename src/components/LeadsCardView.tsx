import React, { useMemo } from 'react';
import { useLeads } from '@/contexts/LeadContext';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  StarHalf, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Globe,
  UserPlus,
  MessageSquare,
  Target,
  Activity,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface LeadsCardViewProps {
  onLeadClick: (lead: any) => void;
}

export function LeadsCardView({ onLeadClick }: LeadsCardViewProps) {
  const { 
    filteredLeads, 
    loading, 
    page, 
    pageSize,
    deleteLead
  } = useLeads();

  const startIndex = (page - 1) * pageSize;
  const paginatedLeads = useMemo(() => {
    return filteredLeads.slice(startIndex, startIndex + pageSize);
  }, [filteredLeads, startIndex, pageSize]);

  const handleDeleteLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this lead?")) {
      deleteLead(id)
        .then(() => {
          toast.success("Lead deleted successfully");
        })
        .catch((error) => {
          toast.error("Failed to delete lead");
          console.error(error);
        });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Converted': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Hot': return 'bg-red-100 text-red-800 border-red-300';
      case 'Cold': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Warm': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Hot': 
        return <Star className="h-4 w-4 text-amber-500" fill="currentColor" />;
      case 'Warm': 
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'Cold': 
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Converted': 
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: 
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Website': <Globe className="h-4 w-4 text-blue-500" />,
      'Referral': <UserPlus className="h-4 w-4 text-green-500" />,
      'Social Media': <MessageSquare className="h-4 w-4 text-purple-500" />,
      'Event': <Calendar className="h-4 w-4 text-indigo-500" />,
      'Cold Call': <Phone className="h-4 w-4 text-orange-500" />
    };
    return icons[source] || <Target className="h-4 w-4 text-gray-500" />;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, index) => (
          <Card key={index} className="shadow-md animate-pulse">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {paginatedLeads.length > 0 ? (
        paginatedLeads.map(lead => (
          <Card
            key={lead.id}
            className="group lead-card shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-border/40 backdrop-blur-sm hover:bg-card/80 cursor-pointer transform hover:-translate-y-2"
            onClick={() => onLeadClick(lead)}
          >
            {/* Status indicator bar */}
            <div className={`h-1.5 w-full ${
              lead.status === 'Hot' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              lead.status === 'Warm' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
              lead.status === 'Cold' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
              lead.status === 'Converted' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              'bg-gradient-to-r from-gray-300 to-gray-400'
            }`}></div>
            
            <CardHeader className="pb-3 pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                      {getInitials(lead.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {lead.fullName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(lead.status)}
                      <Badge 
                        className={`${getStatusColor(lead.status)} text-xs font-medium border`}
                      >
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onLeadClick(lead);
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Lead
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      toast.info("View details coming soon");
                    }}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => handleDeleteLead(lead.id, e)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Lead
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-0">
              {/* Contact Information */}
              <div className="space-y-2">
                {lead.email && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400 mr-3 flex-shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400 mr-3 flex-shrink-0" />
                    <span>{lead.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400 mr-3 flex-shrink-0" />
                  <span>{formatDate(lead.createdAt)}</span>
                </div>
              </div>
              
              {/* Lead Details */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Source:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                    {getSourceIcon(lead.source)}
                    <span className="text-xs">{lead.source}</span>
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Stage:</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span className="text-xs truncate max-w-[120px]">{lead.stage}</span>
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">Associate:</span>
                  <div className="flex items-center gap-1">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xs">
                        {getInitials(lead.associate)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-xs text-slate-700 truncate max-w-[100px]">{lead.associate}</span>
                  </div>
                </div>
              </div>
              
              {/* Remarks */}
              {lead.remarks && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 font-medium">Remarks:</p>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{lead.remarks}</p>
                </div>
              )}
              
              {/* Follow-up Section */}
              {(lead.followUp1Date || lead.followUp2Date || lead.followUp3Date || lead.followUp4Date) && (
                <div className="pt-3 border-t border-slate-100">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-xs text-slate-500 font-medium flex items-center gap-1 hover:text-slate-700 transition-colors">
                      <MessageSquare className="h-3 w-3" />
                      Follow-up History
                    </summary>
                    <div className="mt-3 space-y-2">
                      {lead.followUp1Date && (
                        <div className="bg-slate-50 p-2 rounded-md text-xs border border-slate-100">
                          <div className="font-medium text-slate-700 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            {formatDate(lead.followUp1Date)}
                          </div>
                          <p className="mt-1 text-slate-600">{lead.followUp1Comments || "No comments"}</p>
                        </div>
                      )}
                      {lead.followUp2Date && (
                        <div className="bg-slate-50 p-2 rounded-md text-xs border border-slate-100">
                          <div className="font-medium text-slate-700 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            {formatDate(lead.followUp2Date)}
                          </div>
                          <p className="mt-1 text-slate-600">{lead.followUp2Comments || "No comments"}</p>
                        </div>
                      )}
                      {lead.followUp3Date && (
                        <div className="bg-slate-50 p-2 rounded-md text-xs border border-slate-100">
                          <div className="font-medium text-slate-700 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            {formatDate(lead.followUp3Date)}
                          </div>
                          <p className="mt-1 text-slate-600">{lead.followUp3Comments || "No comments"}</p>
                        </div>
                      )}
                      {lead.followUp4Date && (
                        <div className="bg-slate-50 p-2 rounded-md text-xs border border-slate-100">
                          <div className="font-medium text-slate-700 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            {formatDate(lead.followUp4Date)}
                          </div>
                          <p className="mt-1 text-slate-600">{lead.followUp4Comments || "No comments"}</p>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="pt-0 pb-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all group-hover:shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onLeadClick(lead);
                }}
              >
                <Edit className="h-4 w-4" />
                <span>Edit Lead</span>
              </Button>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Zap className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No leads found</h3>
              <p className="text-slate-500">Try adjusting your filters or adding new leads to get started.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}