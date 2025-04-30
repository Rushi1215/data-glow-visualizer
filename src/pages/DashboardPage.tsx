
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { generateDataStats, generateChartData } from '@/services/dataService';
import { ArrowLeft, Table as TableIcon, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, ScatterChart as ScatterChartIcon, RefreshCw } from 'lucide-react';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Chart colors
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  
  useEffect(() => {
    const cleanedDataStr = localStorage.getItem('dataGlowCleanedFile');
    if (!cleanedDataStr) {
      toast.error('No cleaned data found. Please clean your data first.');
      navigate('/clean');
      return;
    }
    
    try {
      const cleanedData = JSON.parse(cleanedDataStr);
      
      // Generate statistics and charts
      setTimeout(() => {
        const dataStats = generateDataStats(cleanedData.columns, cleanedData.rows);
        const chartData = generateChartData(cleanedData.columns, cleanedData.rows);
        
        setStats(dataStats);
        setCharts(chartData);
        setIsLoading(false);
      }, 1000); // Slight delay for loading state
    } catch (error) {
      console.error('Error generating dashboard:', error);
      toast.error('Error generating dashboard. Please try again.');
      setIsLoading(false);
    }
  }, [navigate]);
  
  const handleRestart = () => {
    // Clear stored data
    localStorage.removeItem('dataGlowFile');
    localStorage.removeItem('dataGlowFileName');
    localStorage.removeItem('dataGlowCleanedFile');
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Generating Your Dashboard</h1>
          <p className="text-muted-foreground">
            Creating visualizations and statistics from your data...
          </p>
        </div>
        
        <Card className="p-10 flex flex-col items-center justify-center gap-4 text-center">
          <div className="size-16 border-4 border-t-primary border-muted rounded-full animate-spin" />
          <h3 className="text-xl font-semibold">Building Dashboard</h3>
          <p className="text-muted-foreground">
            We're analyzing your data and generating visualizations...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Dashboard</h1>
        <p className="text-muted-foreground">
          Explore insights and visualizations from your cleaned data
        </p>
      </div>
      
      <Tabs defaultValue="summary" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="summary" className="flex gap-2 items-center">
            <TableIcon className="h-4 w-4" />
            <span>Summary</span>
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex gap-2 items-center">
            <BarChart2 className="h-4 w-4" />
            <span>Detailed Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex gap-2 items-center">
            <LineChartIcon className="h-4 w-4" />
            <span>Trends</span>
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex gap-2 items-center">
            <PieChartIcon className="h-4 w-4" />
            <span>Distribution</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Summary Dashboard */}
        <TabsContent value="summary" className="space-y-6">
          <h2 className="text-2xl font-semibold">Data Summary Overview</h2>
          
          {/* Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 data-card border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                  <h3 className="text-2xl font-bold">{stats.totalRows}</h3>
                </div>
                <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <TableIcon className="size-5" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6 data-card border-l-4 border-l-purple-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Columns</p>
                  <h3 className="text-2xl font-bold">{stats.totalColumns}</h3>
                </div>
                <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 rotate-90">
                  <TableIcon className="size-5" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6 data-card border-l-4 border-l-amber-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Missing Values</p>
                  <h3 className="text-2xl font-bold">{stats.missingValues}</h3>
                </div>
                <div className="size-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <span className="text-lg font-bold">?</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 data-card border-l-4 border-l-green-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Duplicate Rows</p>
                  <h3 className="text-2xl font-bold">{stats.duplicateRows}</h3>
                </div>
                <div className="size-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <BarChart2 className="size-5" />
                </div>
              </div>
            </Card>
          </div>

          {/* Primary visualization */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Key Data Distribution</h3>
            <div className="h-[300px]">
              {charts?.barChart && (
                <ChartContainer
                  config={{
                    primary: { theme: { light: '#8884d8', dark: '#8884d8' } }
                  }}
                >
                  <BarChart data={charts.barChart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={charts.barChart.xKey} />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent />
                      }
                    />
                    <Legend />
                    <Bar dataKey={charts.barChart.yKey} fill="var(--color-primary)" />
                  </BarChart>
                </ChartContainer>
              )}
            </div>
          </Card>
          
          {/* Column Information */}
          {stats?.columnsInfo && (
            <Card className="data-card">
              <h3 className="font-semibold p-4">Column Information</h3>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Distinct Values</TableHead>
                      <TableHead>Missing Values</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.columnsInfo.map((col: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{col.name}</TableCell>
                        <TableCell>{col.type}</TableCell>
                        <TableCell>{col.distinct}</TableCell>
                        <TableCell>{col.missing}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
        
        {/* Detailed Analysis */}
        <TabsContent value="detailed" className="space-y-6">
          <h2 className="text-2xl font-semibold">Detailed Data Analysis</h2>
          
          {/* Statistical Summary */}
          {stats?.summary && stats.summary.length > 0 && (
            <Card className="data-card">
              <h3 className="font-semibold p-4 bg-slate-50 dark:bg-slate-900">Statistical Summary</h3>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Min</TableHead>
                      <TableHead>Max</TableHead>
                      <TableHead>Mean</TableHead>
                      <TableHead>Median</TableHead>
                      <TableHead>Std Dev</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.summary.map((item: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{item.column}</TableCell>
                        <TableCell>{item.min?.toFixed(2) ?? '-'}</TableCell>
                        <TableCell>{item.max?.toFixed(2) ?? '-'}</TableCell>
                        <TableCell>{item.mean?.toFixed(2) ?? '-'}</TableCell>
                        <TableCell>{item.median?.toFixed(2) ?? '-'}</TableCell>
                        <TableCell>{item.std?.toFixed(2) ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
          
          {/* Scatter Plot */}
          {charts?.scatterChart && (
            <Card className="p-4 data-card border border-slate-200">
              <h3 className="font-semibold mb-4">{charts.scatterChart.title}</h3>
              <div className="h-[350px]">
                <ChartContainer
                  config={{
                    primary: { theme: { light: '#8884d8', dark: '#8884d8' } }
                  }}
                >
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name={charts.scatterChart.xLabel} />
                    <YAxis type="number" dataKey="y" name={charts.scatterChart.yLabel} />
                    <ChartTooltip 
                      content={
                        <ChartTooltipContent />
                      }
                    />
                    <Legend />
                    <Scatter name="Data Points" data={charts.scatterChart.data} fill="var(--color-primary)" />
                  </ScatterChart>
                </ChartContainer>
              </div>
            </Card>
          )}
          
          {/* Additional bar chart if available */}
          {charts?.barChart && (
            <Card className="p-4 data-card border border-slate-200">
              <h3 className="font-semibold mb-4">Detailed {charts.barChart.title}</h3>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    primary: { theme: { light: '#82ca9d', dark: '#82ca9d' } }
                  }}
                >
                  <BarChart data={charts.barChart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={charts.barChart.xKey} />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent />
                      }
                    />
                    <Legend />
                    <Bar dataKey={charts.barChart.yKey} fill="var(--color-primary)" />
                  </BarChart>
                </ChartContainer>
              </div>
            </Card>
          )}
        </TabsContent>
        
        {/* Trends Dashboard */}
        <TabsContent value="trends" className="space-y-6">
          <h2 className="text-2xl font-semibold">Trend & Time Series Analysis</h2>
          
          {/* Line Chart */}
          {charts?.lineChart ? (
            <Card className="p-6 data-card border border-slate-200">
              <h3 className="font-semibold mb-4">{charts.lineChart.title}</h3>
              <div className="h-[350px]">
                <ChartContainer
                  config={{
                    primary: { theme: { light: '#8884d8', dark: '#8884d8' } }
                  }}
                >
                  <LineChart data={charts.lineChart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={charts.lineChart.xKey} />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent />
                      }
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={charts.lineChart.yKey} 
                      stroke="var(--color-primary)" 
                      strokeWidth={2} 
                      dot={{ r: 3 }} 
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                This chart shows trends over time, helping identify patterns and seasonal variations in your data.
              </p>
            </Card>
          ) : (
            <Card className="p-6 flex flex-col items-center justify-center gap-4 text-center">
              <LineChartIcon className="size-16 text-muted-foreground" />
              <h3 className="text-lg font-medium">No Time Series Data Available</h3>
              <p className="text-muted-foreground">
                Your dataset doesn't contain suitable date/time columns for trend analysis.
                Try uploading data with date columns to see trends over time.
              </p>
            </Card>
          )}

          {/* Comparison area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left chart: Categorical comparison */}
            <Card className="p-4 data-card">
              <h3 className="font-semibold mb-4">Category Distribution</h3>
              <div className="h-[300px]">
                {charts?.barChart ? (
                  <ChartContainer
                    config={{
                      primary: { theme: { light: '#0088fe', dark: '#0088fe' } }
                    }}
                  >
                    <BarChart data={charts.barChart.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey={charts.barChart.xKey} />
                      <YAxis />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent />
                        }
                      />
                      <Bar dataKey={charts.barChart.yKey} fill="var(--color-primary)" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No categorical data available</p>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Right chart: Numeric comparison */}
            <Card className="p-4 data-card">
              <h3 className="font-semibold mb-4">Data Correlation</h3>
              <div className="h-[300px]">
                {charts?.scatterChart ? (
                  <ChartContainer
                    config={{
                      primary: { theme: { light: '#00C49F', dark: '#00C49F' } }
                    }}
                  >
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid />
                      <XAxis type="number" dataKey="x" name={charts.scatterChart.xLabel} />
                      <YAxis type="number" dataKey="y" name={charts.scatterChart.yLabel} />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent />
                        }
                      />
                      <Scatter name="Correlation" data={charts.scatterChart.data} fill="var(--color-primary)" />
                    </ScatterChart>
                  </ChartContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No numeric correlation data available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* Distribution Dashboard */}
        <TabsContent value="distribution" className="space-y-6">
          <h2 className="text-2xl font-semibold">Data Distribution Analysis</h2>
          
          {/* Pie Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {charts?.pieChart ? (
              <Card className="p-4 data-card">
                <h3 className="font-semibold mb-4">{charts.pieChart.title}</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.pieChart.data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {charts.pieChart.data.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            ) : (
              <Card className="p-6 flex flex-col items-center justify-center gap-4 text-center">
                <PieChartIcon className="size-16 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Distribution Data Available</h3>
                <p className="text-muted-foreground">
                  Your dataset doesn't contain suitable categorical data for distribution analysis.
                </p>
              </Card>
            )}
            
            {/* Statistical highlights */}
            <Card className="p-4 data-card">
              <h3 className="font-semibold mb-4">Distribution Highlights</h3>
              <div className="space-y-4">
                {stats?.columnsInfo && stats.columnsInfo.slice(0, 4).map((col: any, i: number) => (
                  <div key={i} className="border-b pb-3">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{col.name}</span>
                      <span className="text-sm text-muted-foreground">{col.type}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (col.distinct / (stats.totalRows || 1)) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>{col.distinct} distinct values</span>
                      <span>{col.missing} missing</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Bar Chart */}
          {charts?.barChart && (
            <Card className="p-4 data-card">
              <h3 className="font-semibold mb-4">Frequency Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.barChart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={charts.barChart.xKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={charts.barChart.yKey} fill="#ff8042">
                      {charts.barChart.data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/clean')}>
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <Button variant="default" onClick={handleRestart}>
          <RefreshCw className="mr-2 size-4" />
          Start New Analysis
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
