
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLeads } from '@/contexts/LeadContext';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, BarChart2, PieChart as PieChartIcon, TrendingUp, Calendar, Filter, RefreshCw, Download } from 'lucide-react';

export function LeadAnalytics() {
  const { leads } = useLeads();
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [xAxis, setXAxis] = useState<string>('status');
  const [yAxis, setYAxis] = useState<string>('count');
  const [isLoading, setIsLoading] = useState(false);

  const fieldOptions = [
    { value: 'status', label: 'Status' },
    { value: 'source', label: 'Source' },
    { value: 'stage', label: 'Stage' },
    { value: 'associate', label: 'Associate' },
    { value: 'createdAtMonth', label: 'Created (Month)', formatter: (date: string) => {
      return new Date(date).toLocaleDateString('en-US', { month: 'long' });
    }}
  ];

  const valueOptions = [
    { value: 'count', label: 'Count' },
    { value: 'countUnique', label: 'Count Unique' }
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate loading for demonstration
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Generate chart data based on selected options
  const generateChartData = () => {
    const dataMap = new Map();
    
    leads.forEach(lead => {
      let xValue = lead[xAxis] || 'Undefined';
      if (xAxis === 'createdAtMonth' && lead.createdAt) {
        xValue = new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'long' });
      }
      
      if (!dataMap.has(xValue)) {
        dataMap.set(xValue, 0);
      }
      dataMap.set(xValue, dataMap.get(xValue) + 1);
    });
    
    const chartData = Array.from(dataMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
    
    return chartData;
  };

  const COLORS = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  
  const chartData = generateChartData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-3 md:col-span-1">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium mb-4">Chart Configuration</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Chart Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={chartType === 'bar' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setChartType('bar')}
                    className="flex items-center justify-center gap-2"
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span>Bar</span>
                  </Button>
                  <Button 
                    variant={chartType === 'line' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setChartType('line')}
                    className="flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    <span>Line</span>
                  </Button>
                  <Button 
                    variant={chartType === 'pie' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setChartType('pie')}
                    className="flex items-center justify-center gap-2"
                  >
                    <PieChartIcon className="h-4 w-4" />
                    <span>Pie</span>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">X-Axis (Category)</label>
                <Select value={xAxis} onValueChange={setXAxis}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Y-Axis (Value)</label>
                <Select value={yAxis} onValueChange={setYAxis}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select measurement" />
                  </SelectTrigger>
                  <SelectContent>
                    {valueOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
                <Button 
                  size="sm" 
                  className="flex items-center gap-2" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {fieldOptions.find(f => f.value === xAxis)?.label} by {valueOptions.find(v => v.value === yAxis)?.label}
              </CardTitle>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[400px] w-full">
              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name={valueOptions.find(v => v.value === yAxis)?.label} fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {chartType === 'line' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name={valueOptions.find(v => v.value === yAxis)?.label} 
                      stroke="#4f46e5" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, valueOptions.find(v => v.value === yAxis)?.label]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Lead Conversion Rate</h3>
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">23.5%</p>
              <p className="text-sm text-blue-600/70 dark:text-blue-400/70">+2.7% from previous month</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Average Response Time</h3>
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">3.2 hours</p>
              <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">-15.4% from previous month</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Leads Per Channel</h3>
                <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-bold">4.7</p>
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Website leads performing best</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">Customer Acquisition Cost</h3>
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold">$42.80</p>
              <p className="text-sm text-purple-600/70 dark:text-purple-400/70">-$3.25 from previous month</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LeadAnalytics;
