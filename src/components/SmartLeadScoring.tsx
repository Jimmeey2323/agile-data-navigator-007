import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Calculator, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { aiService, LeadScore } from '@/services/aiService';
import { toast } from 'sonner';

interface SmartLeadScoringProps {
  lead: any;
  onScoreUpdate?: (score: LeadScore) => void;
}

export function SmartLeadScoring({ lead, onScoreUpdate }: SmartLeadScoringProps) {
  const [leadScore, setLeadScore] = useState<LeadScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(false);

  useEffect(() => {
    setIsAIEnabled(aiService.isConfigured());
    if (lead) {
      calculateScore();
    }
  }, [lead]);

  const calculateScore = async () => {
    if (!lead) return;
    
    setIsLoading(true);
    try {
      const score = await aiService.calculateLeadScore(lead);
      setLeadScore(score);
      onScoreUpdate?.(score);
    } catch (error) {
      console.error('Error calculating lead score:', error);
      toast.error('Failed to calculate lead score');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getPriorityIcon = (impact: number) => {
    if (impact >= 20) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (impact >= 15) return <TrendingUp className="h-4 w-4 text-orange-500" />;
    if (impact >= 10) return <Target className="h-4 w-4 text-blue-500" />;
    return <Info className="h-4 w-4 text-gray-500" />;
  };

  if (!leadScore) {
    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700">
                  {isAIEnabled ? 'AI is analyzing lead...' : 'Calculating score...'}
                </span>
              </div>
            ) : (
              <Button onClick={calculateScore} className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculate Lead Score
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            {isAIEnabled ? <Brain className="h-5 w-5" /> : <Calculator className="h-5 w-5" />}
            {isAIEnabled ? 'AI-Powered Lead Score' : 'Lead Score Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(leadScore.score)}`}>
                {leadScore.score}/100
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getScoreColor(leadScore.score)} bg-transparent border-current`}>
                  {getScoreLabel(leadScore.score)}
                </Badge>
                {isAIEnabled && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Enhanced
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <Progress value={leadScore.score} className="w-24 h-3 mb-2" />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={calculateScore}
                disabled={isLoading}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Recalculate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leadScore.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getPriorityIcon(factor.impact)}
                  <div>
                    <div className="font-medium text-sm text-gray-800">{factor.name}</div>
                    <div className="text-xs text-gray-600">
                      Weight: {Math.round(factor.weight * 100)}% • Value: {Math.round(factor.value * 100)}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-gray-800">
                    +{factor.impact.toFixed(1)} pts
                  </div>
                  <Progress value={factor.value * 100} className="w-16 h-2 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Best Action */}
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Target className="h-5 w-5" />
            Next Best Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800 mb-1">Recommended Action</p>
              <p className="text-sm text-green-700">{leadScore.nextBestAction}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {leadScore.recommendations.length > 0 && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Lightbulb className="h-5 w-5" />
              Improvement Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leadScore.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm text-blue-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}