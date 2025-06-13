import { toast } from "sonner";

export interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

export interface DataStats {
  totalRows: number;
  totalColumns: number;
  missingValues: number;
  duplicateRows: number;
  columnsInfo: {
    name: string;
    distinct: number;
    missing: number;
    type: string;
  }[];
  summary: {
    column: string;
    min?: string | number;
    max?: string | number;
    mean?: number;
    median?: number;
    std?: number;
  }[];
}

// Helper to parse CSV or Excel data
export const parseFileData = (fileContent: string): { columns: DataColumn[], rows: Record<string, any>[] } => {
  try {
    // Simple CSV parsing (would use proper library in real app)
    const lines = fileContent.split('\n');
    if (lines.length < 2) {
      throw new Error("File appears to be empty or invalid");
    }

    // Parse header row
    const headerLine = lines[0].trim();
    const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Determine column types (basic inference)
    const columns: DataColumn[] = [];
    const rows: Record<string, any>[] = [];

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Split by comma, respecting quotes (simplified)
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, any> = {};
      
      values.forEach((value, index) => {
        const header = headers[index] || `column_${index}`;
        row[header] = value;
        
        // Infer types on first data row
        if (i === 1) {
          let type: 'string' | 'number' | 'date' | 'boolean' = 'string';
          
          // Check if number
          if (!isNaN(Number(value)) && value !== '') {
            type = 'number';
          }
          // Check if date (basic check)
          else if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(value) ||
                  /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(value)) {
            type = 'date';
          }
          // Check if boolean
          else if (['true', 'false', '0', '1', 'yes', 'no'].includes(value.toLowerCase())) {
            type = 'boolean';
          }
          
          columns.push({
            name: header,
            type
          });
        }
      });
      
      rows.push(row);
    }
    
    return { columns, rows };
  } catch (error) {
    console.error("Error parsing file:", error);
    toast.error("Failed to parse file. Please check the file format.");
    return { columns: [], rows: [] };
  }
};

// Clean data functionality
export const cleanData = (columns: DataColumn[], rows: Record<string, any>[]): { 
  columns: DataColumn[], 
  rows: Record<string, any>[],
  stats: {
    originalRows: number;
    cleanedRows: number;
    removedRows: number;
    missingValuesFixed: number;
    duplicatesRemoved: number;
    datesStandardized: number;
  }
} => {
  // Stats tracking
  const stats = {
    originalRows: rows.length,
    cleanedRows: 0,
    removedRows: 0,
    missingValuesFixed: 0,
    duplicatesRemoved: 0,
    datesStandardized: 0
  };

  // Filter out rows with too many missing values (>50%)
  const rowsWithoutTooManyMissing = rows.filter(row => {
    const totalFields = columns.length;
    const missingFields = columns.filter(col => !row[col.name] || row[col.name] === '').length;
    
    const hasEnoughData = missingFields / totalFields < 0.5;
    if (!hasEnoughData) {
      stats.removedRows++;
    }
    return hasEnoughData;
  });

  // Convert date columns to standard format
  const rowsWithFixedDates = rowsWithoutTooManyMissing.map(row => {
    const newRow = { ...row };
    
    columns.forEach(col => {
      if (col.type === 'date' && newRow[col.name]) {
        try {
          const date = new Date(newRow[col.name]);
          if (!isNaN(date.getTime())) {
            newRow[col.name] = date.toISOString().split('T')[0];
            stats.datesStandardized++;
          }
        } catch (e) {
          // Keep original value if date parsing fails
        }
      }
    });
    
    return newRow;
  });

  // Remove duplicate rows
  const seen = new Set();
  const cleanedRows = rowsWithFixedDates.filter(row => {
    const rowStr = JSON.stringify(row);
    const isDuplicate = seen.has(rowStr);
    if (!isDuplicate) {
      seen.add(rowStr);
      return true;
    }
    stats.duplicatesRemoved++;
    return false;
  });

  stats.cleanedRows = cleanedRows.length;
  stats.missingValuesFixed = stats.originalRows - stats.removedRows - cleanedRows.length;

  return { columns, rows: cleanedRows, stats };
};

// Generate data statistics for the dashboard
export const generateDataStats = (columns: DataColumn[], rows: Record<string, any>[]): DataStats => {
  console.log('Generating stats for columns:', columns);
  console.log('Number of rows:', rows.length);
  
  // Calculate basic statistics
  const totalRows = rows.length;
  const totalColumns = columns.length;
  
  let missingValues = 0;
  const columnsInfo = columns.map(col => {
    const distinctValues = new Set();
    let missingCount = 0;
    
    rows.forEach(row => {
      const value = row[col.name];
      if (value === undefined || value === null || value === '') {
        missingCount++;
        missingValues++;
      } else {
        distinctValues.add(value);
      }
    });
    
    return {
      name: col.name,
      distinct: distinctValues.size,
      missing: missingCount,
      type: col.type
    };
  });
  
  // Check for duplicate rows
  const uniqueRows = new Set(rows.map(row => JSON.stringify(row)));
  const duplicateRows = totalRows - uniqueRows.size;
  
  // Generate summary statistics for numeric columns
  const summary = columns
    .filter(col => col.type === 'number')
    .map(col => {
      const values = rows
        .map(row => row[col.name])
        .filter(v => v !== undefined && v !== null && v !== '')
        .map(v => Number(v))
        .filter(v => !isNaN(v));
      
      if (values.length === 0) return { column: col.name };
      
      values.sort((a, b) => a - b);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const median = values.length % 2 === 0
        ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
        : values[Math.floor(values.length / 2)];
      
      // Standard deviation
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      return {
        column: col.name,
        min,
        max,
        mean,
        median,
        std
      };
    });
  
  console.log('Generated stats:', { totalRows, totalColumns, missingValues, duplicateRows });
  
  return {
    totalRows,
    totalColumns,
    missingValues,
    duplicateRows,
    columnsInfo,
    summary
  };
};

// Generate visualization data for charts
export const generateChartData = (columns: DataColumn[], rows: Record<string, any>[]) => {
  console.log('Generating chart data for columns:', columns.map(c => `${c.name} (${c.type})`));
  
  // Find a numeric column and a categorical column for charts
  const numericColumns = columns.filter(col => col.type === 'number');
  const categoricalColumns = columns.filter(col => col.type === 'string' || col.type === 'boolean');
  const dateColumns = columns.filter(col => col.type === 'date');
  
  console.log('Found numeric columns:', numericColumns.length);
  console.log('Found categorical columns:', categoricalColumns.length);
  console.log('Found date columns:', dateColumns.length);
  
  const charts: Record<string, any> = {};
  
  // Bar Chart (categorical vs count or sum)
  if (categoricalColumns.length > 0) {
    const categoryCol = categoricalColumns[0].name;
    console.log('Creating bar chart for:', categoryCol);
    
    // Count frequency of each category
    const categoryMap = new Map();
    
    rows.forEach(row => {
      const category = row[categoryCol]?.toString() || 'Unknown';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    
    const barData = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ 
        [categoryCol]: category, 
        count: count,
        category: category // fallback key
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
    
    console.log('Bar chart data:', barData);
    
    charts.barChart = {
      title: `Count by ${categoryCol}`,
      data: barData,
      xKey: 'category',
      yKey: 'count'
    };
  } else if (numericColumns.length > 0) {
    // If no categorical columns, create a simple numeric distribution
    const numericCol = numericColumns[0].name;
    console.log('Creating numeric distribution for:', numericCol);
    
    const values = rows
      .map(row => parseFloat(row[numericCol]))
      .filter(v => !isNaN(v))
      .sort((a, b) => a - b);
    
    // Create bins for histogram
    const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
      count: 0,
      category: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`
    }));
    
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
      if (bins[binIndex]) bins[binIndex].count++;
    });
    
    charts.barChart = {
      title: `Distribution of ${numericCol}`,
      data: bins,
      xKey: 'category',
      yKey: 'count'
    };
  }
  
  // Line Chart (date vs numeric)
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = dateColumns[0].name;
    const numericCol = numericColumns[0].name;
    console.log('Creating line chart for:', dateCol, 'vs', numericCol);
    
    // Group by date and average the numeric values
    const dateMap = new Map();
    
    rows.forEach(row => {
      const date = row[dateCol];
      const value = parseFloat(row[numericCol]);
      
      if (date && !isNaN(value)) {
        if (!dateMap.has(date)) {
          dateMap.set(date, { sum: value, count: 1 });
        } else {
          const existing = dateMap.get(date);
          dateMap.set(date, { sum: existing.sum + value, count: existing.count + 1 });
        }
      }
    });
    
    const lineData = Array.from(dateMap.entries())
      .map(([date, { sum, count }]) => ({
        [dateCol]: date,
        [numericCol]: sum / count,
        date: date,
        value: sum / count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    console.log('Line chart data:', lineData.slice(0, 3));
    
    charts.lineChart = {
      title: `${numericCol} Over Time`,
      data: lineData,
      xKey: 'date',
      yKey: 'value'
    };
  }
  
  // Scatter Plot (numeric vs numeric)
  if (numericColumns.length >= 2) {
    const xCol = numericColumns[0].name;
    const yCol = numericColumns[1].name;
    console.log('Creating scatter chart for:', xCol, 'vs', yCol);
    
    const scatterData = rows
      .filter(row => !isNaN(parseFloat(row[xCol])) && !isNaN(parseFloat(row[yCol])))
      .map(row => ({
        x: parseFloat(row[xCol]),
        y: parseFloat(row[yCol])
      }))
      .slice(0, 100); // Limit points for performance
    
    console.log('Scatter chart data points:', scatterData.length);
    
    charts.scatterChart = {
      title: `${xCol} vs ${yCol}`,
      data: scatterData,
      xKey: 'x',
      yKey: 'y',
      xLabel: xCol,
      yLabel: yCol
    };
  }
  
  // Pie Chart (categorical distribution)
  if (categoricalColumns.length > 0) {
    const categoryCol = categoricalColumns[categoricalColumns.length > 1 ? 1 : 0].name;
    console.log('Creating pie chart for:', categoryCol);
    
    const categoryMap = new Map();
    
    rows.forEach(row => {
      const category = row[categoryCol]?.toString() || 'Unknown';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    
    const pieData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
    
    console.log('Pie chart data:', pieData);
    
    charts.pieChart = {
      title: `Distribution of ${categoryCol}`,
      data: pieData
    };
  }
  
  console.log('Generated charts:', Object.keys(charts));
  return charts;
};
