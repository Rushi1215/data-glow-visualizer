
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
import { ArrowLeft, Table as TableIcon, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, RefreshCw } from 'lucide-react';

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
      console.log('Cleaned data loaded:', cleanedData);
      
      // Generate statistics and charts
      setTimeout(() => {
        const dataStats = generateDataStats(cleanedData.columns, cleanedData.rows);
        const chartData = generateChartData(cleanedData.columns, cleanedData.rows);
        
        console.log('Generated stats:', dataStats);
        console.log('Generated charts:', chartData);
        
        setStats(dataStats);
        setCharts(chartData);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating dashboard:', error);
      toast.error('Error generating dashboard. Please try again.');
      setIsLoading(false);
    }
  }, [navigate]);
  
  const handleRestart = () => {
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

  if (!stats || !charts) {
    return (
      <div className="flex flex-col gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Error</h1>
          <p className="text-muted-foreground">
            Unable to generate dashboard from your data.
          </p>
        </div>
        
        <Card className="p-10 flex flex-col items-center justify-center gap-4 text-center">
          <h3 className="text-xl font-semibold">No Data Available</h3>
          <p className="text-muted-foreground">
            Please go back and upload valid data.
          </p>
          <Button onClick={() => navigate('/')}>Start Over</Button>
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
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="summary" className="flex gap-2 items-center">
            <TableIcon className="h-4 w-4" />
            <span>Summary</span>
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex gap-2 items-center">
            <BarChart2 className="h-4 w-4" />
            <span>Detailed</span>
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
            <Card className="p-6 border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Rows</p>
                  <h3 className="text-2xl font-bold">{stats.totalRows.toLocaleString()}</h3>
                </div>
                <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <TableIcon className="size-5" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-l-4 border-l-purple-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Columns</p>
                  <h3 className="text-2xl font-bold">{stats.totalColumns}</h3>
                </div>
                <div className="size-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <BarChart2 className="size-5" />
                </div>
              </div>
            </Card>
            
            <Card className="p-6 border-l-4 border-l-amber-500">
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
            
            <Card className="p-6 border-l-4 border-l-green-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Duplicate Rows</p>
                  <h3 className="text-2xl font-bold">{stats.duplicateRows}</h3>
                </div>
                <div className="size-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <RefreshCw className="size-5" />
                </div>
              </div>
            </Card>
          </div>

          {/* Primary visualization */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Key Data Distribution</h3>
            <div className="h-[300px]">
              {charts?.barChart ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.barChart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={charts.barChart.xKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={charts.barChart.yKey} fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No chart data available</p>
                </div>
              )}
            </div>
          </Card>
          
          {/* Column Information */}
          {stats?.columnsInfo && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Column Information</h3>
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
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Statistical Summary</h3>
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
            <Card className="p-6">
              <h3 className="font-semibold mb-4">{charts.scatterChart.title}</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={charts.scatterChart.data}>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name={charts.scatterChart.xLabel} />
                    <YAxis type="number" dataKey="y" name={charts.scatterChart.yLabel} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Data Points" data={charts.scatterChart.data} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </TabsContent>
        
        {/* Trends Dashboard */}
        <TabsContent value="trends" className="space-y-6">
          <h2 className="text-2xl font-semibold">Trend Analysis</h2>
          
          {/* Line Chart */}
          {charts?.lineChart ? (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">{charts.lineChart.title}</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={charts.lineChart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={charts.lineChart.xKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey={charts.lineChart.yKey} 
                      stroke="#8884d8" 
                      strokeWidth={2} 
                      dot={{ r: 3 }} 
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          ) : (
            <Card className="p-6 flex flex-col items-center justify-center gap-4 text-center">
              <LineChartIcon className="size-16 text-muted-foreground" />
              <h3 className="text-lg font-medium">No Time Series Data Available</h3>
              <p className="text-muted-foreground">
                Your dataset doesn't contain suitable date/time columns for trend analysis.
              </p>
            </Card>
          )}
          
          {/* Additional bar chart */}
          {charts?.barChart && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Category Trends</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.barChart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={charts.barChart.xKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={charts.barChart.yKey} fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </TabsContent>
        
        {/* Distribution Dashboard */}
        <TabsContent value="distribution" className="space-y-6">
          <h2 className="text-2xl font-semibold">Data Distribution Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            {charts?.pieChart ? (
              <Card className="p-6">
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
            
            {/* Distribution highlights */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Distribution Highlights</h3>
              <div className="space-y-4">
                {stats?.columnsInfo && stats.columnsInfo.slice(0, 6).map((col: any, i: number) => (
                  <div key={i} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{col.name}</span>
                      <span className="text-sm text-muted-foreground">{col.type}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
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
          
          {/* Bar Chart for distribution */}
          {charts?.barChart && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Frequency Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.barChart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={charts.barChart.xKey} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={charts.barChart.yKey}>
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
          Back to Clean
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
