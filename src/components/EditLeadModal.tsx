import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Save, X, User, Mail, Phone, Calendar, MapPin, FileText, Star, TrendingUp, Clock, CheckCircle, AlertCircle, Users, Target, Activity, BarChart3, PieChart, LineChart, Zap, Globe, MessageSquare, UserPlus, Building, Award, Lightbulb, ArrowRight, Eye, Edit, Trash2, Plus, RefreshCw, Calculator, Brain, Sparkles } from 'lucide-react';
import { useLeads } from '@/contexts/LeadContext';
import { Lead } from '@/services/googleSheets';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';
import { SmartLeadScoring } from '@/components/SmartLeadScoring';
import { aiService } from '@/services/aiService';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  selectedLeads?: string[];
  clearSelection?: () => void;
}

export function EditLeadModal({
  isOpen,
  onClose,
  lead,
  selectedLeads = [],
  clearSelection
}: EditLeadModalProps) {
  const {
    updateLead,
    addLead,
    leads,
    sourceOptions,
    associateOptions,
    centerOptions,
    stageOptions,
    statusOptions
  } = useLeads();
  
  const [formData, setFormData] = useState<Lead>({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    source: '',
    associate: '',
    status: '',
    stage: '',
    createdAt: '',
    center: '',
    remarks: '',
    followUp1Date: '',
    followUp1Comments: '',
    followUp2Date: '',
    followUp2Comments: '',
    followUp3Date: '',
    followUp3Comments: '',
    followUp4Date: '',
    followUp4Comments: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAIConfigured, setIsAIConfigured] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Initialize form data when lead changes
  useEffect(() => {
    setIsAIConfigured(aiService.isConfigured());
    
    if (lead) {
      setFormData(lead);
      setHasUnsavedChanges(false);
      
      // Load AI suggestions if configured
      if (aiService.isConfigured()) {
        loadAISuggestions(lead);
      }
    } else {
      // Reset form for new lead
      setFormData({
        id: `new-${Date.now()}`,
        fullName: '',
        email: '',
        phone: '',
        source: sourceOptions[0] || '',
        associate: associateOptions[0] || '',
        status: statusOptions[0] || 'New',
        stage: stageOptions[0] || 'Initial Contact',
        createdAt: new Date().toISOString().split('T')[0],
        center: centerOptions[0] || '',
        remarks: '',
        followUp1Date: '',
        followUp1Comments: '',
        followUp2Date: '',
        followUp2Comments: '',
        followUp3Date: '',
        followUp3Comments: '',
        followUp4Date: '',
        followUp4Comments: ''
      });
      setHasUnsavedChanges(false);
    }
  }, [lead, sourceOptions, associateOptions, centerOptions, stageOptions, statusOptions]);

  const loadAISuggestions = async (leadData: Lead) => {
    try {
      const suggestions = await aiService.generateFollowUpSuggestions(leadData);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
    }
  };

  // Calculate dynamic lead score with detailed breakdown
  const leadScoreCalculation = useMemo(() => {
    let score = 0;
    const breakdown = [];
    
    // Basic information completeness (40 points)
    if (formData.fullName && formData.fullName.trim()) {
      score += 10;
      breakdown.push({ category: 'Full Name', points: 10, reason: 'Complete name provided' });
    } else {
      breakdown.push({ category: 'Full Name', points: 0, reason: 'Missing name' });
    }
    
    if (formData.email && formData.email.trim()) {
      score += 10;
      breakdown.push({ category: 'Email', points: 10, reason: 'Valid email address' });
    } else {
      breakdown.push({ category: 'Email', points: 0, reason: 'Missing email' });
    }
    
    if (formData.phone && formData.phone.trim()) {
      score += 10;
      breakdown.push({ category: 'Phone', points: 10, reason: 'Contact number provided' });
    } else {
      breakdown.push({ category: 'Phone', points: 0, reason: 'Missing phone number' });
    }
    
    if (formData.remarks && formData.remarks.trim()) {
      score += 10;
      breakdown.push({ category: 'Remarks', points: 10, reason: 'Additional notes provided' });
    } else {
      breakdown.push({ category: 'Remarks', points: 0, reason: 'No additional notes' });
    }
    
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
    const stagePoints = stageScores[formData.stage as keyof typeof stageScores] || 0;
    score += stagePoints;
    breakdown.push({ 
      category: 'Stage Progress', 
      points: stagePoints, 
      reason: `Current stage: ${formData.stage}` 
    });
    
    // Status quality (20 points)
    const statusScores = {
      'Hot': 20,
      'Warm': 15,
      'Cold': 10,
      'Converted': 20,
      'Lost': 0
    };
    const statusPoints = statusScores[formData.status as keyof typeof statusScores] || 0;
    score += statusPoints;
    breakdown.push({ 
      category: 'Lead Quality', 
      points: statusPoints, 
      reason: `Status: ${formData.status}` 
    });
    
    // Follow-up activity (10 points)
    let followUpCount = 0;
    if (formData.followUp1Date) followUpCount++;
    if (formData.followUp2Date) followUpCount++;
    if (formData.followUp3Date) followUpCount++;
    if (formData.followUp4Date) followUpCount++;
    
    const followUpPoints = followUpCount * 2.5;
    score += followUpPoints;
    breakdown.push({ 
      category: 'Follow-up Activity', 
      points: followUpPoints, 
      reason: `${followUpCount} follow-up(s) completed` 
    });
    
    return {
      total: Math.min(Math.round(score), 100),
      breakdown,
      maxPossible: 100
    };
  }, [formData]);

  // Get similar leads
  const similarLeads = useMemo(() => {
    if (!formData.email && !formData.phone) return [];
    return leads.filter(l => l.id !== formData.id && (formData.email && l.email.includes(formData.email.split('@')[1]) || formData.phone && l.phone.slice(0, 6) === formData.phone.slice(0, 6) || l.source === formData.source)).slice(0, 5);
  }, [leads, formData, formData.id]);

  // Activity timeline data
  const timelineData = useMemo(() => {
    const activities = [];
    if (formData.createdAt) {
      activities.push({
        date: formData.createdAt,
        type: 'created',
        title: 'Lead Created',
        description: `Lead was created from ${formData.source}`,
        icon: <Plus className="h-4 w-4" />
      });
    }

    // Add follow-up activities
    for (let i = 1; i <= 4; i++) {
      const dateField = `followUp${i}Date` as keyof Lead;
      const commentField = `followUp${i}Comments` as keyof Lead;
      if (formData[dateField]) {
        activities.push({
          date: formData[dateField] as string,
          type: 'followup',
          title: `Follow-up ${i}`,
          description: formData[commentField] as string || 'No comments',
          icon: <MessageSquare className="h-4 w-4" />
        });
      }
    }
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [formData]);

  // Chart data
  const engagementData = useMemo(() => {
    const followUps = timelineData.filter(item => item.type === 'followup');
    return followUps.map((item, index) => ({
      name: `Follow-up ${index + 1}`,
      engagement: Math.floor(Math.random() * 100) + 1,
      date: item.date
    }));
  }, [timelineData]);
  
  const sourceDistribution = useMemo(() => {
    const sourceCount = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(sourceCount).map(([source, count]) => ({
      name: source,
      value: count,
      fill: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
    }));
  }, [leads]);
  
  const handleInputChange = useCallback((field: keyof Lead, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  }, []);
  
  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      toast.error('Please enter a name for the lead');
      return;
    }
    setIsLoading(true);
    try {
      if (lead?.id && !lead.id.startsWith('new-')) {
        await updateLead(formData);
        toast.success('Lead updated successfully');
      } else {
        await addLead(formData);
        toast.success('Lead created successfully');
      }
      setHasUnsavedChanges(false);
      onClose();
      clearSelection?.();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Failed to save lead');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
        setHasUnsavedChanges(false);
      }
    } else {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl h-[95vh] p-0 bg-white border-0 shadow-2xl rounded-2xl flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-8 py-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-4 border-white/60 shadow-2xl ring-4 ring-blue-100/50">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 via-teal-600 to-cyan-500 text-white font-bold text-lg">
                      {formData.fullName ? formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'NL'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold text-white">
                    {lead?.id && !lead.id.startsWith('new-') ? 'Edit Lead Profile' : 'Create New Lead'}
                  </DialogTitle>
                  <p className="text-blue-100 mt-2 font-medium">
                    {formData.fullName || 'New Lead'} • {formData.source || 'No source'} • {formData.status || 'No status'}
                  </p>
                  {isAIConfigured && (
                    <div className="flex items-center gap-2 mt-1">
                      <Brain className="h-4 w-4 text-purple-200" />
                      <span className="text-purple-200 text-sm">AI Enhanced</span>
                      <Sparkles className="h-3 w-3 text-purple-200" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {/* Lead Score with Calculation */}
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/40 shadow-lg">
                  <div className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Lead Score
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={leadScoreCalculation.total} className="w-24 h-3 bg-white/20" />
                    <span className="text-2xl font-bold text-white">{leadScoreCalculation.total}%</span>
                  </div>
                  <div className="text-xs text-blue-100 mt-1">
                    {leadScoreCalculation.total >= 80 ? 'Excellent' : 
                     leadScoreCalculation.total >= 60 ? 'Good' : 
                     leadScoreCalculation.total >= 40 ? 'Fair' : 'Needs Improvement'}
                  </div>
                </div>
                
                {/* Auto-save toggle */}
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/40 shadow-lg">
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                  <span className="text-sm font-medium text-white">Auto-save</span>
                </div>
                
                <Button variant="ghost" size="icon" onClick={handleClose} className="hover:bg-white/20 rounded-full text-white">
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Navigation - Fixed */}
            <div className="flex-shrink-0 px-8 py-4 bg-gray-50 border-b border-gray-200">
              <TabsList className="grid grid-cols-7 w-full bg-white shadow-lg rounded-xl border border-gray-200">
                <TabsTrigger value="overview" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-xs">
                  <User className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-xs">
                  <FileText className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="followups" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-xs">
                  <MessageSquare className="h-4 w-4" />
                  Follow-ups
                </TabsTrigger>
                <TabsTrigger value="score" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-xs">
                  {isAIConfigured ? <Brain className="h-4 w-4" /> : <Calculator className="h-4 w-4" />}
                  {isAIConfigured ? 'AI Score' : 'Score'}
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-xs">
                  <BarChart3 className="h-4 w-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-xs">
                  <Activity className="h-4 w-4" />
                  Activity
                </TabsTrigger>
                {isAIConfigured && (
                  <TabsTrigger value="ai-suggestions" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white text-xs">
                    <Sparkles className="h-4 w-4" />
                    AI Suggestions
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Tab Content - Scrollable with proper height */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="p-8 pb-24">
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <Card className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
                          <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
                            <User className="h-5 w-5" />
                            Basic Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                          <div>
                            <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">Full Name *</Label>
                            <Input 
                              id="fullName" 
                              value={formData.fullName} 
                              onChange={e => handleInputChange('fullName', e.target.value)} 
                              className="bg-white border-gray-300 mt-1 focus:ring-2 focus:ring-blue-500/50 text-sm" 
                              placeholder="Enter full name" 
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={formData.email} 
                              onChange={e => handleInputChange('email', e.target.value)} 
                              className="bg-white border-gray-300 mt-1 focus:ring-2 focus:ring-blue-500/50 text-sm" 
                              placeholder="Enter email address" 
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Phone Number</Label>
                            <Input 
                              id="phone" 
                              value={formData.phone} 
                              onChange={e => handleInputChange('phone', e.target.value)} 
                              className="bg-white border-gray-300 mt-1 focus:ring-2 focus:ring-blue-500/50 text-sm" 
                              placeholder="Enter phone number" 
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Lead Classification */}
                      <Card className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
                          <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
                            <Target className="h-5 w-5" />
                            Lead Classification
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                          <div>
                            <Label htmlFor="source" className="text-xs font-semibold text-slate-700">Source</Label>
                            <Select value={formData.source} onValueChange={value => handleInputChange('source', value)}>
                              <SelectTrigger className="bg-white border-gray-300 mt-1 text-sm">
                                <SelectValue placeholder="Select source" />
                              </SelectTrigger>
                              <SelectContent>
                                {sourceOptions.map(option => <SelectItem key={option} value={option} className="text-sm">{option}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="status" className="text-xs font-semibold text-slate-700">Status</Label>
                            <Select value={formData.status} onValueChange={value => handleInputChange('status', value)}>
                              <SelectTrigger className="bg-white border-gray-300 mt-1 text-sm">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map(option => <SelectItem key={option} value={option} className="text-sm">{option}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="stage" className="text-xs font-semibold text-slate-700">Stage</Label>
                            <Select value={formData.stage} onValueChange={value => handleInputChange('stage', value)}>
                              <SelectTrigger className="bg-white border-gray-300 mt-1 text-sm">
                                <SelectValue placeholder="Select stage" />
                              </SelectTrigger>
                              <SelectContent>
                                {stageOptions.map(option => <SelectItem key={option} value={option} className="text-sm">{option}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Engagement Chart */}
                    {engagementData.length > 0 && (
                      <Card className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                          <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
                            <LineChart className="h-5 w-5" />
                            Engagement Timeline
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <ResponsiveContainer width="100%" height={200}>
                            <RechartsLineChart data={engagementData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="name" stroke="#64748b" className="text-xs" />
                              <YAxis stroke="#64748b" className="text-xs" />
                              <Tooltip contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '12px',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                fontSize: '12px'
                              }} />
                              <Line type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={3} dot={{
                                fill: '#6366f1',
                                strokeWidth: 2,
                                r: 6
                              }} />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="details" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                          <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
                            <Building className="h-5 w-5" />
                            Assignment & Location
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-6">
                          <div>
                            <Label htmlFor="associate" className="text-xs font-semibold text-slate-700">Associate</Label>
                            <Select value={formData.associate} onValueChange={value => handleInputChange('associate', value)}>
                              <SelectTrigger className="bg-white border-gray-300 mt-1 text-sm">
                                <SelectValue placeholder="Select associate" />
                              </SelectTrigger>
                              <SelectContent>
                                {associateOptions.map(option => <SelectItem key={option} value={option} className="text-sm">{option}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="center" className="text-xs font-semibold text-slate-700">Center</Label>
                            <Select value={formData.center} onValueChange={value => handleInputChange('center', value)}>
                              <SelectTrigger className="bg-white border-gray-300 mt-1 text-sm">
                                <SelectValue placeholder="Select center" />
                              </SelectTrigger>
                              <SelectContent>
                                {centerOptions.map(option => <SelectItem key={option} value={option} className="text-sm">{option}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="createdAt" className="text-xs font-semibold text-slate-700">Created Date</Label>
                            <Input 
                              id="createdAt" 
                              type="date" 
                              value={formData.createdAt} 
                              onChange={e => handleInputChange('createdAt', e.target.value)} 
                              className="bg-white border-gray-300 mt-1 focus:ring-2 focus:ring-blue-500/50 text-sm" 
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                          <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
                            <FileText className="h-5 w-5" />
                            Notes & Remarks
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div>
                            <Label htmlFor="remarks" className="text-xs font-semibold text-slate-700">Remarks</Label>
                            <Textarea 
                              id="remarks" 
                              value={formData.remarks} 
                              onChange={e => handleInputChange('remarks', e.target.value)} 
                              className="bg-white border-gray-300 min-h-[120px] mt-1 focus:ring-2 focus:ring-blue-500/50 text-sm" 
                              placeholder="Add any additional notes or remarks about this lead..." 
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="followups" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map(num => (
                        <Card key={num} className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                            <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
                              <MessageSquare className="h-5 w-5" />
                              Follow-up {num}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4 p-6">
                            <div>
                              <Label htmlFor={`followUp${num}Date`} className="text-xs font-semibold text-slate-700">Date</Label>
                              <Input 
                                id={`followUp${num}Date`} 
                                type="date" 
                                value={formData[`followUp${num}Date` as keyof Lead] as string || ''} 
                                onChange={e => handleInputChange(`followUp${num}Date` as keyof Lead, e.target.value)} 
                                className="bg-white border-gray-300 mt-1 focus:ring-2 focus:ring-blue-500/50 text-sm" 
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`followUp${num}Comments`} className="text-xs font-semibold text-slate-700">Comments</Label>
                              <Textarea 
                                id={`followUp${num}Comments`} 
                                value={formData[`followUp${num}Comments` as keyof Lead] as string || ''} 
                                onChange={e => handleInputChange(`followUp${num}Comments` as keyof Lead, e.target.value)} 
                                placeholder={`Add comments for follow-up ${num}...`} 
                                className="bg-white border-gray-300 mt-1 focus:ring-2 focus:ring-blue-500/50 min-h-[80px] text-sm" 
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="score" className="mt-0 space-y-6">
                    <SmartLeadScoring lead={formData} />
                  </TabsContent>

                  <TabsContent value="insights" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Source Distribution Chart */}
                      <Card className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50">
                          <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
                            <PieChart className="h-5 w-5" />
                            Source Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <ResponsiveContainer width="100%" height={250}>
                            <RechartsPieChart>
                              <Pie 
                                data={sourceDistribution} 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={80} 
                                dataKey="value" 
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                className="text-xs"
                              >
                                {sourceDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Similar Leads */}
                      <Card className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50">
                          <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
                            <Users className="h-5 w-5" />
                            Similar Leads
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {similarLeads.length > 0 ? (
                            <div className="space-y-3">
                              {similarLeads.map(similarLead => (
                                <div key={similarLead.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xs">
                                      {similarLead.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{similarLead.fullName}</p>
                                    <p className="text-xs text-slate-600">{similarLead.source} • {similarLead.status}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-600 text-center py-8 text-sm">No similar leads found</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-0 space-y-6">
                    <Card className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
                        <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
                          <Activity className="h-5 w-5" />
                          Activity Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {timelineData.length > 0 ? (
                          <div className="space-y-6">
                            {timelineData.map((activity, index) => (
                              <div key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                  {activity.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-slate-800 text-sm">{activity.title}</h4>
                                    <Badge variant="outline" className="text-xs bg-white border-gray-200">
                                      {formatDate(activity.date)}
                                    </Badge>
                                  </div>
                                  <p className="text-slate-600 text-sm">{activity.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 text-sm">No activity recorded yet</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {isAIConfigured && (
                    <TabsContent value="ai-suggestions" className="mt-0 space-y-6">
                      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
                          <CardTitle className="flex items-center gap-2 text-purple-800 text-sm">
                            <Sparkles className="h-5 w-5" />
                            AI-Powered Suggestions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          {aiSuggestions.length > 0 ? (
                            <div className="space-y-4">
                              <h4 className="font-semibold text-purple-800 mb-3">Follow-up Recommendations</h4>
                              {aiSuggestions.map((suggestion, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
                                  <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold mt-0.5">
                                    {index + 1}
                                  </div>
                                  <p className="text-sm text-purple-700 flex-1">{suggestion}</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
                                    onClick={() => {
                                      // Auto-fill next follow-up with suggestion
                                      const nextFollowUp = !formData.followUp1Date ? 1 : 
                                                          !formData.followUp2Date ? 2 : 
                                                          !formData.followUp3Date ? 3 : 4;
                                      if (nextFollowUp <= 4) {
                                        handleInputChange(`followUp${nextFollowUp}Comments` as keyof Lead, suggestion);
                                        toast.success(`Added to Follow-up ${nextFollowUp}`);
                                      }
                                    }}
                                  >
                                    Use
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Brain className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                              <p className="text-purple-600 text-sm">AI suggestions will appear here based on lead data</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  )}
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 px-8 py-4 bg-gray-50 border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {hasUnsavedChanges && (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">You have unsaved changes</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleClose} disabled={isLoading} className="bg-white border-gray-300 hover:bg-gray-50 text-sm">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading || !formData.fullName.trim()} className="bg-gradient-to-r from-blue-500 to-teal-600 hover:from-blue-600 hover:to-teal-700 shadow-lg text-sm">
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {lead?.id && !lead.id.startsWith('new-') ? 'Update Lead' : 'Create Lead'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}