
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { generateDataStats, generateChartData } from '@/services/dataService';
import { ArrowLeft, Table as TableIcon, BarChart as BarChartIcon, RefreshCw } from 'lucide-react';

// Chart colors
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
      
      {/* Data Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 data-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Rows</p>
                <h3 className="text-2xl font-bold">{stats.totalRows}</h3>
              </div>
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <TableIcon className="size-5" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 data-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Columns</p>
                <h3 className="text-2xl font-bold">{stats.totalColumns}</h3>
              </div>
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary rotate-90">
                <TableIcon className="size-5" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 data-card">
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
          
          <Card className="p-6 data-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Duplicate Rows</p>
                <h3 className="text-2xl font-bold">{stats.duplicateRows}</h3>
              </div>
              <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <BarChartIcon className="size-5" />
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        {charts?.barChart && (
          <Card className="p-4 data-card">
            <h3 className="font-semibold mb-4">{charts.barChart.title}</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.barChart.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={charts.barChart.xKey} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey={charts.barChart.yKey} fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        
        {/* Line Chart */}
        {charts?.lineChart && (
          <Card className="p-4 data-card">
            <h3 className="font-semibold mb-4">{charts.lineChart.title}</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.lineChart.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={charts.lineChart.xKey} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey={charts.lineChart.yKey} stroke="#8884d8" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        
        {/* Scatter Plot */}
        {charts?.scatterChart && (
          <Card className="p-4 data-card">
            <h3 className="font-semibold mb-4">{charts.scatterChart.title}</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="x" name={charts.scatterChart.xLabel} />
                  <YAxis type="number" dataKey="y" name={charts.scatterChart.yLabel} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Data" data={charts.scatterChart.data} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        
        {/* Pie Chart */}
        {charts?.pieChart && (
          <Card className="p-4 data-card">
            <h3 className="font-semibold mb-4">{charts.pieChart.title}</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.pieChart.data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {charts.pieChart.data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>
      
      {/* Statistical Summary */}
      {stats?.summary && stats.summary.length > 0 && (
        <Card className="data-card">
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
      
      {/* Column Information */}
      {stats?.columnsInfo && (
        <Card className="data-card">
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
