
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { parseFileData, cleanData, DataColumn } from '@/services/dataService';
import { AlertCircle, Download, ArrowLeft, CheckCircle, X, Calendar, Sparkles } from 'lucide-react';

const CleanPage: React.FC = () => {
  const navigate = useNavigate();
  const [originalData, setOriginalData] = useState<{columns: DataColumn[], rows: any[]}>({ columns: [], rows: [] });
  const [cleanedData, setCleanedData] = useState<{columns: DataColumn[], rows: any[]}>({ columns: [], rows: [] });
  const [isProcessing, setIsProcessing] = useState(true);
  const [stats, setStats] = useState<{
    originalRows: number;
    cleanedRows: number;
    removedRows: number;
    missingValuesFixed: number;
    duplicatesRemoved: number;
    datesStandardized: number;
  } | null>(null);
  
  useEffect(() => {
    const fileContent = localStorage.getItem('dataGlowFile');
    if (!fileContent) {
      toast.error('No file data found. Please upload a file first.');
      navigate('/');
      return;
    }
    
    try {
      // Parse the original data
      const parsed = parseFileData(fileContent);
      setOriginalData(parsed);
      
      // Clean the data
      setTimeout(() => {
        const { rows, columns, stats } = cleanData(parsed.columns, parsed.rows);
        setCleanedData({ columns, rows });
        setStats(stats);
        setIsProcessing(false);
        
        // Save cleaned data to local storage for dashboard
        localStorage.setItem('dataGlowCleanedFile', JSON.stringify({ columns, rows }));
      }, 1500); // Add slight delay to show processing
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error('Error processing data. Please try again.');
      setIsProcessing(false);
    }
  }, [navigate]);
  
  const handleDownload = () => {
    try {
      // Convert to CSV
      const headers = cleanedData.columns.map(col => col.name).join(',');
      const rows = cleanedData.rows.map(row => 
        cleanedData.columns.map(col => row[col.name] || '').join(',')
      ).join('\n');
      
      const csv = `${headers}\n${rows}`;
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'cleaned_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Data downloaded successfully');
    } catch (error) {
      console.error('Error downloading data:', error);
      toast.error('Error downloading data');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Clean Your Data</h1>
        <p className="text-muted-foreground">
          We've automatically cleaned your data by removing duplicates, fixing dates, and handling missing values
        </p>
      </div>
      
      {/* Processing State */}
      {isProcessing ? (
        <Card className="p-10 flex flex-col items-center justify-center gap-4 text-center">
          <div className="size-16 border-4 border-t-primary border-muted rounded-full animate-spin" />
          <h3 className="text-xl font-semibold">Cleaning Your Data</h3>
          <p className="text-muted-foreground">
            We're removing duplicates, standardizing dates, and handling missing values...
          </p>
        </Card>
      ) : (
        <>
          {/* Cleaning Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 data-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rows Processed</p>
                    <h3 className="text-2xl font-bold">{stats.originalRows}</h3>
                  </div>
                  <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Sparkles className="size-5" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-600 font-medium">{stats.cleanedRows}</span> rows after cleaning
                </p>
              </Card>
              
              <Card className="p-6 data-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Duplicates Removed</p>
                    <h3 className="text-2xl font-bold">{stats.duplicatesRemoved}</h3>
                  </div>
                  <div className="size-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <X className="size-5" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-red-600 font-medium">{stats.removedRows}</span> rows with missing data removed
                </p>
              </Card>
              
              <Card className="p-6 data-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Dates Standardized</p>
                    <h3 className="text-2xl font-bold">{stats.datesStandardized}</h3>
                  </div>
                  <div className="size-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Calendar className="size-5" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-600 font-medium">{stats.missingValuesFixed}</span> fields formatted or fixed
                </p>
              </Card>
            </div>
          )}
          
          {/* Data Tables */}
          <Tabs defaultValue="cleaned">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="cleaned">
                <CheckCircle className="size-4 mr-2" />
                Cleaned Data
              </TabsTrigger>
              <TabsTrigger value="original">
                <AlertCircle className="size-4 mr-2" />
                Original Data
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="cleaned" className="mt-0 border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {cleanedData.columns.map((column, i) => (
                      <TableHead key={i} className="whitespace-nowrap">
                        {column.name}
                        <span className="ml-1 text-xs text-muted-foreground">({column.type})</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cleanedData.rows.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>
                      {cleanedData.columns.map((column, j) => (
                        <TableCell key={j} className="truncate max-w-[200px]">
                          {row[column.name] || <span className="text-muted-foreground italic">empty</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {cleanedData.rows.length > 10 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Showing 10 of {cleanedData.rows.length} rows
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="original" className="mt-0 border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {originalData.columns.map((column, i) => (
                      <TableHead key={i} className="whitespace-nowrap">
                        {column.name}
                        <span className="ml-1 text-xs text-muted-foreground">({column.type})</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {originalData.rows.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>
                      {originalData.columns.map((column, j) => (
                        <TableCell key={j} className="truncate max-w-[200px]">
                          {row[column.name] || <span className="text-muted-foreground italic">empty</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {originalData.rows.length > 10 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Showing 10 of {originalData.rows.length} rows
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload} className="gap-2">
                <Download className="size-4" />
                Download Cleaned Data
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Next Step
                <span className="ml-2">→</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CleanPage;
