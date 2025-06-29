
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Upload, 
  FileText, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  Download,
  Table,
  Settings
} from 'lucide-react';
import { useLeads } from '@/contexts/LeadContext';
import { importLeadsFromCSV } from '@/services/googleSheets';
import { toast } from 'sonner';
import Papa from 'papaparse';

export function CSVUploadView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([
    'Full Name', 'Email', 'Phone', 'Source', 'Associate', 'Center', 'Stage', 'Status', 
    'Created At', 'Remarks', 'Follow Up 1 Date', 'Follow Up Comments (1)', 
    'Follow Up 2 Date', 'Follow Up Comments (2)', 'Follow Up 3 Date', 
    'Follow Up Comments (3)', 'Follow Up 4 Date', 'Follow Up Comments (4)'
  ]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const { refreshData } = useLeads();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setParseError(null);
    setProgress(10);
    
    // Parse CSV
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(results.errors[0].message);
          setProgress(0);
          return;
        }
        
        setCsvData(results.data);
        setCsvHeaders(Object.keys(results.data[0] || {}));
        
        // Initialize mapping for matching header names
        const initialMapping: Record<string, string> = {};
        
        // Try to match headers automatically
        csvHeaders.forEach(csvHeader => {
          // Look for exact match first
          const exactMatch = sheetHeaders.find(
            sheetHeader => sheetHeader.toLowerCase() === csvHeader.toLowerCase()
          );
          
          if (exactMatch) {
            initialMapping[csvHeader] = exactMatch;
          } else {
            // Look for partial match
            const partialMatch = sheetHeaders.find(
              sheetHeader => sheetHeader.toLowerCase().includes(csvHeader.toLowerCase()) ||
                            csvHeader.toLowerCase().includes(sheetHeader.toLowerCase())
            );
            
            if (partialMatch) {
              initialMapping[csvHeader] = partialMatch;
            }
          }
        });
        
        setColumnMapping(initialMapping);
        setProgress(40);
      },
      error: (error) => {
        setParseError(error.message);
        setProgress(0);
      }
    });
  };
  
  const handleMappingChange = (csvHeader: string, sheetHeader: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [csvHeader]: sheetHeader
    }));
  };
  
  const handleUpload = async () => {
    if (!file || Object.keys(columnMapping).length === 0) {
      toast.error('Please select a file and map at least one column');
      return;
    }
    
    setIsUploading(true);
    setProgress(50);
    
    try {
      // Convert CSV data to string format for import
      const csvString = await file.text();
      
      // Import data
      await importLeadsFromCSV(csvString, columnMapping);
      
      setProgress(100);
      toast.success('Leads imported successfully');
      
      // Refresh data
      await refreshData();
      
      // Reset form
      setFile(null);
      setCsvData([]);
      setCsvHeaders([]);
      setColumnMapping({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing leads:', error);
      toast.error('Failed to import leads: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDownloadTemplate = () => {
    // Create template CSV content
    const headers = sheetHeaders.join(',');
    const template = headers + '\n' + ','.repeat(sheetHeaders.length - 1);
    
    // Create download
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload CSV</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Import Settings</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            <span>Import History</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Drag and drop CSV file here, or click to browse</p>
                  <p className="text-xs text-muted-foreground">Supported format: .csv</p>
                  
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                  
                  {file && (
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{file.name}</span>
                    </div>
                  )}
                  
                  {parseError && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{parseError}</span>
                    </div>
                  )}
                </div>
                
                {file && csvHeaders.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Map CSV Columns to Lead Fields</h3>
                      <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                        <Download className="h-4 w-4 mr-2" />
                        Template
                      </Button>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium">CSV Column</th>
                            <th className="px-4 py-2 text-left font-medium">Lead Field</th>
                            <th className="px-4 py-2 text-left font-medium">Sample Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {csvHeaders.map((header, index) => (
                            <tr key={index} className="bg-card">
                              <td className="px-4 py-2 font-medium">{header}</td>
                              <td className="px-4 py-2">
                                <select
                                  className="w-full p-2 rounded-md border border-input bg-background text-sm"
                                  value={columnMapping[header] || ''}
                                  onChange={(e) => handleMappingChange(header, e.target.value)}
                                >
                                  <option value="">-- Select Field --</option>
                                  {sheetHeaders.map((sheetHeader, idx) => (
                                    <option key={idx} value={sheetHeader}>
                                      {sheetHeader}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-2 text-muted-foreground truncate max-w-[200px]">
                                {csvData[0]?.[header] || ''}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>Import Progress</Label>
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFile(null);
                            setCsvData([]);
                            setCsvHeaders([]);
                            setColumnMapping({});
                            setProgress(0);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          disabled={isUploading}
                        >
                          Reset
                        </Button>
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading || Object.keys(columnMapping).length === 0}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin h-4 w-4 rounded-full border-2 border-t-transparent mr-2"></div>
                              Importing...
                            </>
                          ) : (
                            <>
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Import {csvData.length} Leads
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Import Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="duplicate-handling">Duplicate Handling</Label>
                  <select
                    id="duplicate-handling"
                    className="w-full mt-1 p-2 rounded-md border border-input bg-background"
                  >
                    <option value="skip">Skip duplicates</option>
                    <option value="update">Update existing records</option>
                    <option value="create">Create new records</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <select
                    id="date-format"
                    className="w-full mt-1 p-2 rounded-md border border-input bg-background"
                  >
                    <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                    <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-map"
                    className="rounded border border-input"
                  />
                  <Label htmlFor="auto-map">Auto-map columns by name</Label>
                </div>
                
                <Button className="w-full">Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Import History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md divide-y">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">leads_batch_1.csv</h3>
                      <p className="text-sm text-muted-foreground">Imported 42 leads</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">4 hours ago</p>
                      <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300">Success</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">leads_batch_2.csv</h3>
                      <p className="text-sm text-muted-foreground">Imported 18 leads</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Yesterday</p>
                      <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300">Success</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">leads_batch_3.csv</h3>
                      <p className="text-sm text-muted-foreground">Failed to import</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">2 days ago</p>
                      <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300">Failed</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button variant="outline">Load More</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
