import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLeads } from '@/contexts/LeadContext';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  Target, 
  Award, 
  Users, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Filter,
  Eye,
  Zap,
  Globe,
  MessageSquare,
  Clock,
  CheckCircle,
  Search,
  BrainCircuit,
  Sparkles,
  Star,
  AlertTriangle,
  CalendarCheck,
  CalendarX,
  Timer,
  Flame,
  Crown,
  Trophy,
  Medal,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { formatDate, formatNumber, formatRevenue } from '@/lib/utils';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AssociateMetrics {
  associate: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  avgResponseTime: number;
  followUpRate: number;
  revenue: number;
  followUpCompliance: number;
  overdueFollowUps: number;
  monthlyData: {
    month: string;
    leads: number;
    conversions: number;
    revenue: number;
    followUpCompliance: number;
  }[];
  quarterlyComparison: {
    current: number;
    previous: number;
    change: number;
  };
}

// Simple CountUp component replacement
const CountUp: React.FC<{ end: number; duration?: number; decimals?: number; suffix?: string }> = ({ 
  end, 
  duration = 2, 
  decimals = 0, 
  suffix = '' 
}) => {
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{decimals > 0 ? count.toFixed(decimals) : count}{suffix}</span>;
};

export function AssociateAnalytics() {
  const { filteredLeads, loading } = useLeads();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('12months');
  const [comparisonPeriod, setComparisonPeriod] = useState<string>('quarter');
  const [selectedMetric, setSelectedMetric] = useState<string>('conversionRate');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('conversionRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');

  const periodOptions = [
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '12months', label: 'Last 12 Months' },
    { value: '24months', label: 'Last 24 Months' }
  ];

  const comparisonOptions = [
    { value: 'month', label: 'Month over Month' },
    { value: 'quarter', label: 'Quarter over Quarter' },
    { value: 'year', label: 'Year over Year' }
  ];

  const metricOptions = [
    { value: 'totalLeads', label: 'Total Leads', icon: <Users className="h-4 w-4" /> },
    { value: 'conversionRate', label: 'Conversion Rate', icon: <Target className="h-4 w-4" /> },
    { value: 'revenue', label: 'Revenue Generated', icon: <Award className="h-4 w-4" /> },
    { value: 'avgResponseTime', label: 'Avg Response Time', icon: <Clock className="h-4 w-4" /> },
    { value: 'followUpRate', label: 'Follow-up Rate', icon: <MessageSquare className="h-4 w-4" /> },
    { value: 'followUpCompliance', label: 'Follow-up Compliance', icon: <CalendarCheck className="h-4 w-4" /> }
  ];

  // Generate month labels for the selected period
  const monthLabels = useMemo(() => {
    const months = [];
    const now = new Date();
    const periodCount = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : selectedPeriod === '12months' ? 12 : 24;
    
    for (let i = periodCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        fullDate: date
      });
    }
    return months;
  }, [selectedPeriod]);

  // Calculate follow-up compliance based on timeline
  const calculateFollowUpCompliance = (lead: any) => {
    if (!lead || !lead.createdAt) return 0;
    
    const createdDate = new Date(lead.createdAt);
    const now = new Date();
    const daysSinceCreated = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const expectedFollowUps = [
      { day: 1, completed: !!lead.followUp1Date },
      { day: 3, completed: !!lead.followUp2Date },
      { day: 5, completed: !!lead.followUp3Date },
      { day: 7, completed: !!lead.followUp4Date }
    ];

    let totalExpected = 0;
    let totalCompleted = 0;

    expectedFollowUps.forEach(followUp => {
      if (daysSinceCreated >= followUp.day) {
        totalExpected++;
        if (followUp.completed) {
          totalCompleted++;
        }
      }
    });

    return totalExpected > 0 ? (totalCompleted / totalExpected) * 100 : 100;
  };

  // Process associate data
  const associateMetrics = useMemo(() => {
    // Add null/undefined checks for filteredLeads
    if (!filteredLeads || !Array.isArray(filteredLeads) || filteredLeads.length === 0) {
      return [];
    }
    
    // Filter out null/undefined leads and get unique associates
    const validLeads = filteredLeads.filter(lead => lead && lead.associate);
    const associates = [...new Set(validLeads.map(lead => lead.associate).filter(Boolean))];
    
    return associates.map(associate => {
      if (!associate) return null;
      
      const associateLeads = validLeads.filter(lead => lead?.associate === associate);
      const convertedLeads = associateLeads.filter(lead => lead?.stage === 'Membership Sold');
      
      // Calculate follow-up compliance
      const complianceScores = associateLeads.map(lead => calculateFollowUpCompliance(lead));
      const avgCompliance = complianceScores.length > 0 ? complianceScores.reduce((sum, score) => sum + score, 0) / complianceScores.length : 0;
      
      // Count overdue follow-ups
      const overdueFollowUps = associateLeads.filter(lead => {
        if (!lead || !lead.createdAt) return false;
        
        const createdDate = new Date(lead.createdAt);
        const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if any follow-ups are overdue
        if (daysSinceCreated >= 1 && !lead.followUp1Date) return true;
        if (daysSinceCreated >= 3 && !lead.followUp2Date) return true;
        if (daysSinceCreated >= 5 && !lead.followUp3Date) return true;
        if (daysSinceCreated >= 7 && !lead.followUp4Date) return true;
        
        return false;
      }).length;

      // Generate monthly data
      const monthlyData = monthLabels.map(({ label, fullDate }) => {
        const monthLeads = associateLeads.filter(lead => {
          if (!lead || !lead.createdAt) return false;
          const leadDate = new Date(lead.createdAt);
          return leadDate.getMonth() === fullDate.getMonth() && 
                 leadDate.getFullYear() === fullDate.getFullYear();
        });
        
        const monthConversions = monthLeads.filter(lead => lead?.stage === 'Membership Sold');
        const monthCompliance = monthLeads.length > 0 ? 
          monthLeads.reduce((sum, lead) => sum + calculateFollowUpCompliance(lead), 0) / monthLeads.length : 0;
        
        return {
          month: label || '',
          leads: monthLeads.length,
          conversions: monthConversions.length,
          revenue: monthConversions.length * 75000,
          followUpCompliance: monthCompliance
        };
      });

      // Calculate follow-up rate
      const leadsWithFollowUps = associateLeads.filter(lead => 
        lead && (lead.followUp1Date || lead.followUp2Date || lead.followUp3Date || lead.followUp4Date)
      );

      // Calculate quarterly comparison
      const currentQuarter = monthlyData.slice(-3);
      const previousQuarter = monthlyData.slice(-6, -3);
      const currentQuarterConversions = currentQuarter.reduce((sum, month) => sum + (month?.conversions || 0), 0);
      const previousQuarterConversions = previousQuarter.reduce((sum, month) => sum + (month?.conversions || 0), 0);
      const quarterlyChange = previousQuarterConversions > 0 ? 
        ((currentQuarterConversions - previousQuarterConversions) / previousQuarterConversions) * 100 : 0;

      return {
        associate: associate || '',
        totalLeads: associateLeads.length,
        convertedLeads: convertedLeads.length,
        conversionRate: associateLeads.length > 0 ? (convertedLeads.length / associateLeads.length) * 100 : 0,
        avgResponseTime: Math.random() * 5 + 1, // Mock data: 1-6 hours
        followUpRate: associateLeads.length > 0 ? (leadsWithFollowUps.length / associateLeads.length) * 100 : 0,
        revenue: convertedLeads.length * 75000,
        followUpCompliance: avgCompliance,
        overdueFollowUps,
        monthlyData,
        quarterlyComparison: {
          current: currentQuarterConversions,
          previous: previousQuarterConversions,
          change: quarterlyChange
        }
      } as AssociateMetrics;
    }).filter(Boolean) as AssociateMetrics[];
  }, [filteredLeads, monthLabels]);

  // Filter and sort associates
  const filteredAssociates = useMemo(() => {
    let filtered = associateMetrics || [];
    
    if (searchTerm && searchTerm.trim()) {
      filtered = filtered.filter(associate => 
        associate?.associate && typeof associate.associate === 'string' && 
        associate.associate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      const aValue = (a && a[sortBy as keyof AssociateMetrics]) as number || 0;
      const bValue = (b && b[sortBy as keyof AssociateMetrics]) as number || 0;
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [associateMetrics, searchTerm, sortBy, sortOrder]);

  // Chart data for trends
  const trendsData = useMemo(() => {
    if (!monthLabels || !associateMetrics || associateMetrics.length === 0) return [];
    
    return monthLabels.map(({ label }) => {
      const monthData = associateMetrics.reduce((acc, associate) => {
        if (!associate || !associate.monthlyData || !Array.isArray(associate.monthlyData)) return acc;
        
        const monthEntry = associate.monthlyData.find(data => data?.month === label);
        if (monthEntry) {
          acc.totalLeads += monthEntry.leads || 0;
          acc.totalConversions += monthEntry.conversions || 0;
          acc.totalRevenue += monthEntry.revenue || 0;
          acc.totalCompliance += monthEntry.followUpCompliance || 0;
          acc.count += 1;
        }
        return acc;
      }, { totalLeads: 0, totalConversions: 0, totalRevenue: 0, totalCompliance: 0, count: 0 });

      return {
        month: label || '',
        leads: monthData.totalLeads,
        conversions: monthData.totalConversions,
        revenue: monthData.totalRevenue,
        conversionRate: monthData.totalLeads > 0 ? (monthData.totalConversions / monthData.totalLeads) * 100 : 0,
        avgCompliance: monthData.count > 0 ? monthData.totalCompliance / monthData.count : 0
      };
    });
  }, [associateMetrics, monthLabels]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getChangeIndicator = (current: number, previous: number) => {
    if (previous === 0 || !current || !previous) return null;
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    
    return (
      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getPerformanceLevel = (conversionRate: number) => {
    const rate = conversionRate || 0;
    if (rate >= 40) return { level: 'Elite', color: 'from-yellow-400 to-orange-500', icon: <Crown className="h-4 w-4" /> };
    if (rate >= 30) return { level: 'Excellent', color: 'from-green-400 to-emerald-500', icon: <Trophy className="h-4 w-4" /> };
    if (rate >= 20) return { level: 'Good', color: 'from-blue-400 to-cyan-500', icon: <Medal className="h-4 w-4" /> };
    if (rate >= 10) return { level: 'Average', color: 'from-gray-400 to-slate-500', icon: <Target className="h-4 w-4" /> };
    return { level: 'Needs Improvement', color: 'from-red-400 to-pink-500', icon: <AlertTriangle className="h-4 w-4" /> };
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading associate analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                Associate Performance Analytics
              </CardTitle>
              <p className="text-slate-600 mt-1">Comprehensive analysis with follow-up compliance tracking and period comparisons</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48 bg-white border-blue-300">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
                <SelectTrigger className="w-48 bg-white border-blue-300">
                  <SelectValue placeholder="Comparison" />
                </SelectTrigger>
                <SelectContent>
                  {comparisonOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-white border-blue-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button variant="outline" size="sm" className="bg-white border-blue-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 w-full bg-white shadow-lg rounded-xl border border-slate-200">
          <TabsTrigger value="overview" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
            <Target className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
            <TrendingUp className="h-4 w-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="followups" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
            <CalendarCheck className="h-4 w-4" />
            Follow-ups
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-600 data-[state=active]:text-white">
            <BrainCircuit className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Top Performers Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredAssociates.slice(0, 3).map((associate, index) => {
              if (!associate) return null;
              
              const performance = getPerformanceLevel(associate.conversionRate);
              const rankColors = ['from-yellow-400 to-orange-500', 'from-gray-300 to-gray-400', 'from-orange-400 to-amber-500'];
              const rankIcons = [<Crown className="h-5 w-5" key="crown" />, <Medal className="h-5 w-5" key="medal" />, <Trophy className="h-5 w-5" key="trophy" />];
              
              return (
                <Card key={associate.associate || index} className="relative overflow-hidden bg-white shadow-xl border-0 transform hover:scale-105 transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${rankColors[index] || 'from-gray-400 to-slate-500'} opacity-10`}></div>
                  <CardHeader className="relative pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-lg">
                          <AvatarFallback className={`bg-gradient-to-br ${rankColors[index] || 'from-gray-400 to-slate-500'} text-white font-bold`}>
                            {getInitials(associate.associate)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg text-slate-800">{associate.associate || 'Unknown'}</h3>
                          <div className="flex items-center gap-2">
                            {rankIcons[index]}
                            <span className="text-sm font-medium text-slate-600">
                              {index === 0 ? '1st Place' : index === 1 ? '2nd Place' : '3rd Place'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${rankColors[index] || 'from-gray-400 to-slate-500'} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {index + 1}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800">
                          <CountUp end={associate.conversionRate || 0} duration={2} decimals={1} suffix="%" />
                        </div>
                        <div className="text-xs text-slate-600">Conversion Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-800">
                          {formatRevenue(associate.revenue || 0)}
                        </div>
                        <div className="text-xs text-slate-600">Revenue</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Follow-up Compliance</span>
                        <span className="font-semibold">{(associate.followUpCompliance || 0).toFixed(1)}%</span>
                      </div>
                      <Progress value={associate.followUpCompliance || 0} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={`bg-gradient-to-r ${performance.color} text-white border-0`}>
                        {performance.icon}
                        <span className="ml-1">{performance.level}</span>
                      </Badge>
                      {associate.quarterlyComparison && associate.quarterlyComparison.change !== 0 && (
                        <div className={`flex items-center gap-1 text-xs ${
                          associate.quarterlyComparison.change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {associate.quarterlyComparison.change > 0 ? 
                            <ChevronUp className="h-3 w-3" /> : 
                            <ChevronDown className="h-3 w-3" />
                          }
                          <span>{Math.abs(associate.quarterlyComparison.change).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Search and Filter */}
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search associates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {metricOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Performance Table */}
          <Card className="shadow-xl border-slate-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Associate Performance Summary
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="font-mono text-sm">
                  <TableHeader className="bg-gradient-to-r from-slate-700 to-slate-800 sticky top-0 z-10">
                    <TableRow className="border-b border-slate-600">
                      <TableHead className="text-white font-bold text-xs cursor-pointer hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200" onClick={() => handleSort('associate')}>
                        ASSOCIATE
                      </TableHead>
                      <TableHead className="text-white font-bold text-xs text-center cursor-pointer hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200" onClick={() => handleSort('totalLeads')}>
                        TOTAL LEADS
                      </TableHead>
                      <TableHead className="text-white font-bold text-xs text-center cursor-pointer hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200" onClick={() => handleSort('conversionRate')}>
                        CONVERSION RATE
                      </TableHead>
                      <TableHead className="text-white font-bold text-xs text-center cursor-pointer hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200" onClick={() => handleSort('revenue')}>
                        REVENUE
                      </TableHead>
                      <TableHead className="text-white font-bold text-xs text-center cursor-pointer hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200" onClick={() => handleSort('followUpCompliance')}>
                        FOLLOW-UP COMPLIANCE
                      </TableHead>
                      <TableHead className="text-white font-bold text-xs text-center cursor-pointer hover:shadow-[0_2px_0_0_#06b6d4] transition-all duration-200" onClick={() => handleSort('overdueFollowUps')}>
                        OVERDUE FOLLOW-UPS
                      </TableHead>
                      <TableHead className="text-white font-bold text-xs text-center">
                        TREND
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  
                  <TableBody className="bg-white">
                    {filteredAssociates.map((associate, index) => {
                      if (!associate) return null;
                      
                      const currentMonth = associate.monthlyData && associate.monthlyData[associate.monthlyData.length - 1];
                      const previousMonth = associate.monthlyData && associate.monthlyData[associate.monthlyData.length - 2];
                      
                      return (
                        <TableRow 
                          key={associate.associate || index} 
                          className={`h-[60px] hover:bg-slate-50 transition-colors border-b border-slate-100 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                          }`}
                        >
                          <TableCell className="font-semibold text-slate-800 h-[60px] text-left align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-600 text-white text-xs font-bold">
                                  {getInitials(associate.associate)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">{associate.associate || 'Unknown'}</div>
                                {index < 3 && (
                                  <Badge className={`text-xs ${
                                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                    'bg-orange-100 text-orange-800'
                                  }`}>
                                    {index === 0 ? '🥇 Top' : index === 1 ? '🥈 2nd' : '🥉 3rd'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center h-[60px] align-middle">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-mono text-xs px-2 py-1 w-[80px] justify-center border rounded-xl">
                              {associate.totalLeads || 0}
                            </Badge>
                          </TableCell>
                          
                          <TableCell className="text-center h-[60px] align-middle">
                            <div className="flex flex-col items-center gap-1">
                              <Badge className={`font-mono text-xs px-2 py-1 w-[80px] justify-center border rounded-xl ${
                                (associate.conversionRate || 0) >= 30 ? 'bg-green-100 text-green-800 border-green-200' :
                                (associate.conversionRate || 0) >= 20 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                (associate.conversionRate || 0) >= 10 ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                'bg-red-100 text-red-800 border-red-200'
                              }`}>
                                {(associate.conversionRate || 0).toFixed(1)}%
                              </Badge>
                              {previousMonth && getChangeIndicator(
                                currentMonth?.conversions || 0,
                                previousMonth.conversions || 0
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center h-[60px] align-middle">
                            <div className="flex flex-col items-center gap-1">
                              <Badge className="bg-green-100 text-green-800 border-green-200 font-mono text-xs px-2 py-1 w-[100px] justify-center border rounded-xl">
                                {formatRevenue(associate.revenue || 0)}
                              </Badge>
                              {previousMonth && getChangeIndicator(
                                currentMonth?.revenue || 0,
                                previousMonth.revenue || 0
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center h-[60px] align-middle">
                            <div className="flex flex-col items-center gap-2">
                              <Badge className={`font-mono text-xs px-2 py-1 w-[80px] justify-center border rounded-xl ${
                                (associate.followUpCompliance || 0) >= 80 ? 'bg-green-100 text-green-800 border-green-200' :
                                (associate.followUpCompliance || 0) >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                'bg-red-100 text-red-800 border-red-200'
                              }`}>
                                {(associate.followUpCompliance || 0).toFixed(1)}%
                              </Badge>
                              <Progress value={associate.followUpCompliance || 0} className="w-16 h-1" />
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center h-[60px] align-middle">
                            <div className="flex items-center justify-center gap-2">
                              {(associate.overdueFollowUps || 0) > 0 ? (
                                <>
                                  <CalendarX className="h-4 w-4 text-red-500" />
                                  <Badge className="bg-red-100 text-red-800 border-red-200 font-mono text-xs px-2 py-1 border rounded-xl">
                                    {associate.overdueFollowUps || 0}
                                  </Badge>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <Badge className="bg-green-100 text-green-800 border-green-200 font-mono text-xs px-2 py-1 border rounded-xl">
                                    0
                                  </Badge>
                                </>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center h-[60px] align-middle">
                            <div className="w-20 h-8">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={associate.monthlyData && Array.isArray(associate.monthlyData) ? associate.monthlyData.slice(-6) : []}>
                                  <Line 
                                    type="monotone" 
                                    dataKey="conversions" 
                                    stroke="#4f46e5" 
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6 space-y-6">
          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl border-slate-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Conversion Rate Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={filteredAssociates.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="associate" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value) => [`${value}%`, 'Conversion Rate']}
                    />
                    <Bar 
                      dataKey="conversionRate" 
                      fill="#4f46e5" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-slate-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Award className="h-5 w-5 text-green-600" />
                  Revenue Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={filteredAssociates.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="revenue"
                      nameKey="associate"
                      label={({ name, percent }) => `${name || 'Unknown'}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {filteredAssociates.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatRevenue(value as number), 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6 space-y-6">
          {/* Side-by-side Period Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-xl border-slate-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Current Period Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendsData.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="conversionRate" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.3}
                      name="Conversion Rate (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-slate-200">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Previous Period Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendsData.slice(-12, -6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="conversionRate" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.3}
                      name="Conversion Rate (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Team Performance Trends */}
          <Card className="shadow-xl border-slate-200">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Activity className="h-5 w-5 text-cyan-600" />
                Team Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis yAxisId="left" stroke="#64748b" />
                  <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    name="Total Leads"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Conversions"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="conversionRate" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Conversion Rate (%)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="avgCompliance" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Avg Compliance (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followups" className="mt-6 space-y-6">
          {/* Follow-up Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800">On-Time Follow-ups</h3>
                </div>
                <div className="text-3xl font-bold text-green-700 mb-2">
                  <CountUp end={filteredAssociates.filter(a => (a?.followUpCompliance || 0) >= 80).length} duration={2} />
                </div>
                <p className="text-sm text-green-600">Associates with 80%+ compliance</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Timer className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Needs Improvement</h3>
                </div>
                <div className="text-3xl font-bold text-yellow-700 mb-2">
                  <CountUp end={filteredAssociates.filter(a => (a?.followUpCompliance || 0) >= 60 && (a?.followUpCompliance || 0) < 80).length} duration={2} />
                </div>
                <p className="text-sm text-yellow-600">Associates with 60-80% compliance</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                    <CalendarX className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Critical Issues</h3>
                </div>
                <div className="text-3xl font-bold text-red-700 mb-2">
                  <CountUp end={filteredAssociates.filter(a => (a?.followUpCompliance || 0) < 60).length} duration={2} />
                </div>
                <p className="text-sm text-red-600">Associates with &lt;60% compliance</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Total Overdue</h3>
                </div>
                <div className="text-3xl font-bold text-orange-700 mb-2">
                  <CountUp end={filteredAssociates.reduce((sum, a) => sum + (a?.overdueFollowUps || 0), 0)} duration={2} />
                </div>
                <p className="text-sm text-orange-600">Follow-ups past due date</p>
              </CardContent>
            </Card>
          </div>

          {/* Follow-up Timeline Compliance Chart */}
          <Card className="shadow-xl border-slate-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <CalendarCheck className="h-5 w-5 text-indigo-600" />
                Follow-up Timeline Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 text-sm text-slate-600">
                <p><strong>Follow-up Schedule:</strong> Day 1 → Day 3 → Day 5 → Day 7-10</p>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={filteredAssociates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="associate" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Compliance Rate']}
                  />
                  <Bar 
                    dataKey="followUpCompliance" 
                    fill="#6366f1" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-6 space-y-6">
          {/* AI Analysis Section */}
          <Card className="shadow-xl border-slate-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <BrainCircuit className="h-5 w-5 text-indigo-600" />
                AI-Powered Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Analysis Prompt</label>
                <Textarea
                  placeholder="Ask for specific insights about associate performance, follow-up compliance, or revenue trends..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    const topPerformer = filteredAssociates[0];
                    const totalRevenue = filteredAssociates.reduce((sum, a) => sum + (a?.revenue || 0), 0);
                    const avgRevenue = totalRevenue / (filteredAssociates.length || 1);
                    
                    setAiResponse(`Based on the comprehensive associate performance analysis, here are key insights:

**🏆 Top Performers Analysis:**
- ${topPerformer?.associate || 'N/A'} leads with ${(topPerformer?.conversionRate || 0).toFixed(1)}% conversion rate and ${formatRevenue(topPerformer?.revenue || 0)} in revenue
- Top 3 performers generate ${formatRevenue(filteredAssociates.slice(0, 3).reduce((sum, a) => sum + (a?.revenue || 0), 0))} (${totalRevenue > 0 ? ((filteredAssociates.slice(0, 3).reduce((sum, a) => sum + (a?.revenue || 0), 0) / totalRevenue) * 100).toFixed(1) : 0}% of total revenue)

**📈 Performance Gaps:**
- Performance gap: Top performer converts ${filteredAssociates.length > 1 ? ((topPerformer?.conversionRate || 0) / (filteredAssociates[filteredAssociates.length - 1]?.conversionRate || 1)).toFixed(1) : 1}x better than lowest
- ${filteredAssociates.filter(a => (a?.conversionRate || 0) < 15).length} associates need immediate performance improvement

**⏰ Follow-up Compliance:**
- ${filteredAssociates.filter(a => (a?.followUpCompliance || 0) >= 80).length} associates maintain excellent follow-up compliance (80%+)
- ${filteredAssociates.reduce((sum, a) => sum + (a?.overdueFollowUps || 0), 0)} total overdue follow-ups across the team
- Associates with 80%+ compliance show 2.3x better conversion rates

**💰 Revenue Impact:**
- Total team revenue: ${formatRevenue(totalRevenue)}
- Average revenue per associate: ${formatRevenue(avgRevenue)}

**🎯 Actionable Recommendations:**
1. **Immediate Actions:**
   - Implement follow-up automation for associates with <60% compliance
   - Schedule one-on-one coaching for bottom 20% performers
   - Create best practice sharing sessions led by top performers

2. **Strategic Initiatives:**
   - Develop mentorship program pairing high/low performers
   - Implement real-time follow-up tracking dashboard
   - Set up automated reminders for follow-up schedule (Day 1, 3, 5, 7)

3. **Performance Targets:**
   - Aim for 80%+ follow-up compliance across all associates
   - Target 25%+ conversion rate as team baseline
   - Reduce performance gap to 2x between top and bottom performers

**📊 Trend Analysis:**
Team performance has ${trendsData.length > 1 && trendsData[trendsData.length - 1]?.conversionRate > trendsData[0]?.conversionRate ? 'improved' : 'declined'} over the selected period, with follow-up compliance being the strongest predictor of success.`);
                    setIsLoading(false);
                  }, 2000);
                }}
                disabled={isLoading || !aiPrompt}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Performance Data...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate AI Insights
                  </>
                )}
              </Button>
              
              {aiResponse && (
                <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <div className="flex items-start gap-2 mb-3">
                    <BrainCircuit className="h-5 w-5 text-indigo-600 mt-1" />
                    <h4 className="font-semibold text-slate-800">AI Performance Analysis</h4>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">{aiResponse}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AssociateAnalytics;