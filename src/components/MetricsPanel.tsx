import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Layers, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  Star,
  Activity,
  TrendingUp,
  Target,
  Award,
  Zap,
  Clock,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Info,
  HelpCircle
} from 'lucide-react';
import { useLeads } from '@/contexts/LeadContext';
import { cn, formatNumber, calculatePercentageChange } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CountUp from 'react-countup';

export function MetricsPanel() {
  const { 
    statusCounts, 
    filteredLeads, 
    leads, 
    convertedLeadsCount, 
    ltv, 
    conversionRate,
    loading 
  } = useLeads();
  
  const [collapsed, setCollapsed] = useState(false);
  
  // Calculate total leads count
  const totalLeads = filteredLeads.length;
  const totalAllLeads = leads.length;
  
  // For demo purposes, calculate week-over-week change
  const weekOnWeekChange = calculatePercentageChange(
    totalLeads,
    totalLeads > 10 ? totalLeads - Math.floor(Math.random() * 10) : totalLeads
  );
  
  // Calculate active leads (not closed)
  const closedStatuses = ['Converted', 'Lost', 'Rejected'];
  const activeLeads = filteredLeads.filter(lead => 
    !closedStatuses.includes(lead.status)
  ).length;

  // Calculate response time metrics
  const avgResponseTime = 3.2; // hours (mock data)
  const responseTimeChange = -15.4; // percentage improvement

  // Calculate follow-up metrics
  const followUpRate = 78.5; // percentage of leads with follow-ups
  const followUpChange = 12.3; // percentage improvement

  // Format revenue values
  const formatRevenue = (value: number): string => {
    if (value >= 10000000) { // 1 Crore
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) { // 1 Lakh
      return `₹${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) { // 1 Thousand
      return `₹${(value / 1000).toFixed(1)}K`;
    } else {
      return `₹${value}`;
    }
  };

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium animate-pulse bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Key Metrics</h2>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-secondary rounded-md focus:outline-none"
        >
          {collapsed ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
      </div>
      
      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <TooltipProvider>
            <MetricCard
              title="Total Leads"
              value={totalLeads}
              change={weekOnWeekChange}
              icon={<Users className="h-6 w-6 text-blue-600" />}
              description={`${formatNumber(totalLeads)} of ${formatNumber(totalAllLeads)} total leads`}
              loading={loading}
              tooltip={{
                title: "Total Leads",
                content: "Total number of leads in your current filtered view. This includes all leads regardless of their status or stage.",
                insights: [
                  "Represents your current lead pipeline",
                  "Use filters to segment by source, status, or date",
                  "Track growth trends over time"
                ]
              }}
            />
            
            <MetricCard
              title="Active Leads"
              value={activeLeads}
              change={calculatePercentageChange(
                activeLeads,
                activeLeads > 5 ? activeLeads - Math.floor(Math.random() * 5) : activeLeads
              )}
              icon={<Layers className="h-6 w-6 text-teal-600" />}
              description="Leads in active stages"
              loading={loading}
              tooltip={{
                title: "Active Leads",
                content: "Leads that are currently being worked on and haven't been closed (won or lost).",
                insights: [
                  "Excludes converted, lost, and rejected leads",
                  "Focus your efforts on these leads",
                  "Monitor for stagnant leads that need attention"
                ]
              }}
            />
            
            <MetricCard
              title="Conversion Rate"
              value={conversionRate.toFixed(1) + '%'}
              change={calculatePercentageChange(
                conversionRate,
                conversionRate > 2 ? conversionRate - Math.random() * 2 : conversionRate
              )}
              icon={<Activity className="h-6 w-6 text-green-600" />}
              description={`${convertedLeadsCount} converted leads`}
              loading={loading}
              isPercentage={true}
              tooltip={{
                title: "Conversion Rate",
                content: "Percentage of leads that have been successfully converted to customers.",
                insights: [
                  "Industry average is typically 2-5%",
                  "Higher rates indicate effective sales process",
                  "Track by source to identify best channels"
                ]
              }}
            />
            
            <MetricCard
              title="Estimated Value"
              value={formatRevenue(ltv)}
              change={calculatePercentageChange(
                ltv,
                ltv > 2000 ? ltv - Math.random() * 2000 : ltv
              )}
              icon={<Star className="h-6 w-6 text-orange-600" />}
              description="Total revenue from conversions"
              loading={loading}
              isCurrency={true}
              currencyValue={ltv}
              tooltip={{
                title: "Estimated Value",
                content: "Total estimated revenue from converted leads based on average deal size.",
                insights: [
                  "Based on ₹75,000 average membership value",
                  "Helps track ROI of marketing efforts",
                  "Use to justify marketing spend"
                ]
              }}
            />

            <MetricCard
              title="Avg Response Time"
              value={`${avgResponseTime}h`}
              change={responseTimeChange}
              icon={<Clock className="h-6 w-6 text-red-600" />}
              description="Time to first response"
              loading={loading}
              tooltip={{
                title: "Average Response Time",
                content: "Average time between lead creation and first contact attempt.",
                insights: [
                  "Faster response times improve conversion rates",
                  "Aim for under 1 hour for best results",
                  "Leads contacted within 5 minutes are 21x more likely to convert"
                ]
              }}
            />

            <MetricCard
              title="Follow-up Rate"
              value={`${followUpRate}%`}
              change={followUpChange}
              icon={<MessageSquare className="h-6 w-6 text-cyan-600" />}
              description="Leads with follow-up activities"
              loading={loading}
              isPercentage={true}
              tooltip={{
                title: "Follow-up Rate",
                content: "Percentage of leads that have at least one follow-up activity recorded.",
                insights: [
                  "Higher follow-up rates lead to better conversions",
                  "Aim for 80%+ follow-up rate",
                  "Multiple follow-ups increase success probability"
                ]
              }}
            />
          </TooltipProvider>
        </div>
      )}
    </section>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  description: string;
  loading?: boolean;
  isPercentage?: boolean;
  isCurrency?: boolean;
  currencyValue?: number;
  tooltip?: {
    title: string;
    content: string;
    insights: string[];
  };
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  description, 
  loading = false,
  isPercentage = false,
  isCurrency = false,
  currencyValue = 0,
  tooltip
}: MetricCardProps) {
  const positive = change >= 0;
  const prevValueRef = useRef<string | number>(0);

  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  // Parse numeric value for CountUp
  const numericValue = (() => {
    if (typeof value === 'number') return value;
    if (isPercentage) return parseFloat(value.toString());
    if (isCurrency) return currencyValue;
    return parseInt(value.toString().replace(/[^0-9.-]+/g, '') || '0');
  })();
  
  const cardContent = (
    <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group cursor-pointer rounded-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <>
                  {isCurrency && !value.toString().includes('₹') ? '₹' : ''}
                  <CountUp
                    start={0}
                    end={numericValue}
                    duration={1.5}
                    separator=","
                    decimals={isPercentage ? 1 : 0}
                    decimal="."
                    suffix={isPercentage && !value.toString().includes('%') ? '%' : ''}
                  />
                </>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center text-xs font-medium",
                positive ? "text-green-600" : "text-red-600"
              )}>
                {positive ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {loading ? (
                  <div className="h-3 w-10 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `${Math.abs(change).toFixed(1)}%`
                )}
              </div>
              
              <span className="text-xs text-gray-500">
                {loading ? (
                  <div className="h-3 w-20 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  description
                )}
              </span>
            </div>
          </div>
          
          <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300">
            {icon}
          </div>
        </div>

        {tooltip && (
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Info className="h-3 w-3" />
              <span>Hover for insights</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {cardContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4" side="bottom">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">{tooltip.title}</h4>
              <p className="text-xs text-muted-foreground">{tooltip.content}</p>
            </div>
            
            <div>
              <h5 className="font-medium text-xs mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Key Insights
              </h5>
              <ul className="space-y-1">
                {tooltip.insights.map((insight, index) => (
                  <li key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return cardContent;
}