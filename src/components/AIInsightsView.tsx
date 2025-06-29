
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowUpRight, 
  BarChart2, 
  BrainCircuit, 
  ChevronDown, 
  Clock, 
  Lightbulb, 
  MessageCircle, 
  RefreshCw, 
  Sparkles, 
  Target, 
  ThumbsUp, 
  TrendingUp 
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  BarChart, 
  Bar,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export function AIInsightsView() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [insightTab, setInsightTab] = useState('overview');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResponse(null);
    
    // Simulate AI response
    setTimeout(() => {
      setResponse(
        "Based on your lead data, I've identified several key insights:\n\n" +
        "1. Your conversion rate has increased by 15% in the last month, primarily due to improvements in follow-up speed.\n\n" +
        "2. Website leads are converting 2.3x better than social media leads, suggesting you might want to reallocate marketing budget.\n\n" +
        "3. Leads that receive a response within 5 minutes are 21x more likely to convert than those contacted after 30+ minutes.\n\n" +
        "4. Your sales team's performance shows significant variation - your top performer is closing 3x more deals than your lowest performer.\n\n" +
        "5. Tuesday and Wednesday show the highest conversion rates, while Friday leads rarely convert."
      );
      setIsLoading(false);
      
      toast({
        title: "AI Analysis Complete",
        description: "New insights have been generated from your lead data",
      });
    }, 2000);
  };

  // Sample data for the insights charts
  const conversionData = [
    { name: 'Jan', conversion: 25 },
    { name: 'Feb', conversion: 32 },
    { name: 'Mar', conversion: 30 },
    { name: 'Apr', conversion: 35 },
    { name: 'May', conversion: 42 },
    { name: 'Jun', conversion: 48 },
    { name: 'Jul', conversion: 55 },
  ];
  
  const channelData = [
    { name: 'Website', value: 45, fill: '#4f46e5' },
    { name: 'Email', value: 28, fill: '#3b82f6' },
    { name: 'Social', value: 15, fill: '#06b6d4' },
    { name: 'Referral', value: 12, fill: '#10b981' },
  ];
  
  const responseTimeData = [
    { name: '<5 min', conversion: 42 },
    { name: '5-30 min', conversion: 28 },
    { name: '30-60 min', conversion: 18 },
    { name: '1-4 hrs', conversion: 12 },
    { name: '4-24 hrs', conversion: 8 },
    { name: '>24 hrs', conversion: 2 },
  ];
  
  const salesPerformanceData = [
    { name: 'John', deals: 32, value: 120000 },
    { name: 'Sarah', deals: 45, value: 180000 },
    { name: 'Mike', deals: 28, value: 95000 },
    { name: 'Lisa', deals: 38, value: 135000 },
    { name: 'David', deals: 15, value: 65000 },
  ];
  
  const weekdayData = [
    { name: 'Mon', conversion: 25 },
    { name: 'Tue', conversion: 42 },
    { name: 'Wed', conversion: 38 },
    { name: 'Thu', conversion: 30 },
    { name: 'Fri', conversion: 18 },
    { name: 'Sat', conversion: 12 },
    { name: 'Sun', conversion: 8 },
  ];

  // Array of pre-generated insights
  const insights = [
    {
      id: 1,
      title: "Response Time Impact",
      description: "Leads contacted within 5 minutes are 21x more likely to convert",
      type: "critical",
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      action: "Implement auto-response system"
    },
    {
      id: 2,
      title: "Channel Effectiveness",
      description: "Website leads convert at 2.3x the rate of social media leads",
      type: "opportunity",
      icon: <Target className="w-5 h-5 text-indigo-500" />,
      action: "Reallocate marketing budget"
    },
    {
      id: 3,
      title: "Sales Performance Gap",
      description: "Top sales rep is closing 3x more deals than lowest performer",
      type: "warning",
      icon: <TrendingUp className="w-5 h-5 text-red-500" />,
      action: "Schedule sales training"
    },
    {
      id: 4,
      title: "Optimal Contact Days",
      description: "Tuesday/Wednesday leads have 68% higher conversion rates",
      type: "insight",
      icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
      action: "Schedule campaigns midweek"
    },
    {
      id: 5,
      title: "Follow-up Frequency",
      description: "Leads with 3+ follow-ups convert 2x better than single-contact leads",
      type: "opportunity",
      icon: <MessageCircle className="w-5 h-5 text-green-500" />,
      action: "Implement follow-up sequence"
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-white dark:bg-gray-900 shadow-md overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-xl">
            <BrainCircuit className="w-5 h-5 mr-2 text-primary" />
            AI Lead Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={insightTab} onValueChange={setInsightTab} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Key Insights</span>
              </TabsTrigger>
              <TabsTrigger value="conversion" className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                <span>Conversion Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Performance</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4" />
                <span>Custom Analysis</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map(insight => (
                  <Card key={insight.id} className="overflow-hidden bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/90 hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800">
                          {insight.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h3 className="font-semibold">{insight.title}</h3>
                            <Badge className="ml-3" variant={
                              insight.type === "critical" ? "destructive" : 
                              insight.type === "warning" ? "default" :
                              insight.type === "opportunity" ? "success" : "secondary"
                            }>
                              {insight.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                          <Button variant="outline" size="sm" className="text-xs">
                            {insight.action}
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="border-border/30 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <ThumbsUp className="mr-2 h-5 w-5 text-primary" />
                        <h3 className="font-semibold">AI Recommendation</h3>
                      </div>
                      <p className="text-sm">
                        Based on your data, focusing on faster response times would yield the highest ROI. 
                        Implementing an automatic response system could increase conversions by an estimated 18%.
                      </p>
                    </div>
                    <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                      Apply Recommendation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="conversion" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Conversion Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={conversionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                        <Line 
                          type="monotone" 
                          dataKey="conversion" 
                          stroke="#4f46e5" 
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="border-border/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Channel Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={channelData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="border-border/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Response Time Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={responseTimeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                        <Bar dataKey="conversion" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="border-border/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Day of Week Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weekdayData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                        <Bar dataKey="conversion" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <Card className="border-border/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Sales Rep Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                      data={salesPerformanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
                      <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="deals" name="Deals Closed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="value" name="Revenue ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border/30 bg-white dark:bg-gray-900">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-center mb-2">Best Performer</h3>
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <ThumbsUp className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold">Sarah</p>
                      <p className="text-sm text-muted-foreground">45 deals closed</p>
                      <div className="mt-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                          180% of average
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border/30 bg-white dark:bg-gray-900">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-center mb-2">Team Average</h3>
                    <div className="text-center mb-4">
                      <p className="text-4xl font-bold">31.6</p>
                      <p className="text-sm text-muted-foreground">deals per rep</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Lisa</span>
                        <span>120%</span>
                      </div>
                      <Progress value={120} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>John</span>
                        <span>101%</span>
                      </div>
                      <Progress value={101} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Mike</span>
                        <span>89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>David</span>
                        <span>47%</span>
                      </div>
                      <Progress value={47} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border/30 bg-white dark:bg-gray-900">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-center mb-2">Improvement Needed</h3>
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 text-red-500" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold">David</p>
                      <p className="text-sm text-muted-foreground">15 deals closed</p>
                      <div className="mt-2">
                        <Badge variant="destructive">
                          47% of average
                        </Badge>
                      </div>
                      <Button className="mt-4 w-full" variant="outline">
                        Schedule Training
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <Card className="border-border/30 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/90">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Custom AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Ask a question about your lead data..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Button 
                        type="submit" 
                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            Generate Insights
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
                
                {isLoading && (
                  <CardFooter className="pt-0">
                    <div className="w-full">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Analyzing your data...</span>
                        <span>Please wait</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </CardFooter>
                )}
                
                {response && (
                  <CardFooter className="pt-0">
                    <div className="w-full bg-primary/5 p-4 rounded-md whitespace-pre-line">
                      <div className="flex items-start mb-2">
                        <BrainCircuit className="mr-2 h-5 w-5 text-primary mt-1" />
                        <h4 className="font-medium">AI Response</h4>
                      </div>
                      <p className="text-sm">{response}</p>
                    </div>
                  </CardFooter>
                )}
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-border/30 bg-white dark:bg-gray-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Sample Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto py-2 px-3 font-normal text-left"
                        onClick={() => setPrompt("What is our best performing lead source and why?")}
                      >
                        What is our best performing lead source and why?
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto py-2 px-3 font-normal text-left"
                        onClick={() => setPrompt("Which sales rep has the highest conversion ratio and what techniques do they use?")}
                      >
                        Which sales rep has the highest conversion ratio and what techniques do they use?
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-auto py-2 px-3 font-normal text-left"
                        onClick={() => setPrompt("What is the optimal time to contact new leads based on our historical data?")}
                      >
                        What is the optimal time to contact new leads based on our historical data?
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border/30 bg-white dark:bg-gray-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Previous Analyses</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="border rounded-md p-3">
                        <p className="text-sm font-medium mb-1">Q: Why are website leads converting better?</p>
                        <p className="text-xs text-muted-foreground">July 10, 2023 · Used by 5 team members</p>
                      </div>
                      <div className="border rounded-md p-3">
                        <p className="text-sm font-medium mb-1">Q: What factors predict a lead will close?</p>
                        <p className="text-xs text-muted-foreground">June 28, 2023 · Used by 3 team members</p>
                      </div>
                      <div className="border rounded-md p-3">
                        <p className="text-sm font-medium mb-1">Q: How can we optimize our follow-up sequence?</p>
                        <p className="text-xs text-muted-foreground">June 15, 2023 · Used by 8 team members</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIInsightsView;
