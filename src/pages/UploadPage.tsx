
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { parseFileData, DataColumn } from '@/services/dataService';
import { AlertCircle, CheckCircle, FileSpreadsheet, Upload } from 'lucide-react';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState<{ columns: DataColumn[], rows: Record<string, any>[] } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFile(files[0]);
    }
  }, []);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      handleFile(files[0]);
    }
  }, []);
  
  const handleFile = useCallback((file: File) => {
    console.log('Processing file:', file.name, file.type, file.size);
    
    // Validate file type - now including Excel files
    const validTypes = [
      'text/csv', 
      'application/csv', 
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/excel'
    ];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['csv', 'xlsx', 'xls'];
    
    // Check both MIME type and extension
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
      toast.error('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setFileName(file.name);
    setIsProcessing(true);
    
    // Handle Excel files differently than CSV
    if (fileExtension === 'xlsx' || fileExtension === 'xls' || file.type.includes('spreadsheet') || file.type.includes('excel')) {
      handleExcelFile(file);
    } else {
      handleCSVFile(file);
    }
  }, []);
  
  const handleCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        console.log('CSV file content loaded, length:', fileContent.length);
        
        // Check if file content looks like binary
        if (fileContent.includes('\0') || fileContent.includes('�')) {
          toast.error('This appears to be a binary file. Please upload a text-based CSV file.');
          setIsProcessing(false);
          return;
        }
        
        processFileContent(fileContent, file.name);
      } catch (error) {
        console.error('Error reading CSV file:', error);
        toast.error('Error parsing CSV file. Please check if it\'s a valid format.');
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading file. Please try again.');
      setIsProcessing(false);
    };
    
    reader.readAsText(file, 'UTF-8');
  };
  
  const handleExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        console.log('Excel file loaded, size:', arrayBuffer.byteLength);
        
        // Parse Excel file using xlsx library
        import('xlsx').then((XLSX) => {
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to CSV format
          const csvContent = XLSX.utils.sheet_to_csv(worksheet);
          console.log('Converted Excel to CSV, length:', csvContent.length);
          
          if (!csvContent.trim()) {
            toast.error('No data found in Excel file. Please check the file format.');
            setIsProcessing(false);
            return;
          }
          
          processFileContent(csvContent, file.name);
        }).catch((error) => {
          console.error('Error parsing Excel file:', error);
          toast.error('Error parsing Excel file. Please check if it\'s a valid format.');
          setIsProcessing(false);
        });
      } catch (error) {
        console.error('Error reading Excel file:', error);
        toast.error('Error reading Excel file. Please try again.');
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading Excel file. Please try again.');
      setIsProcessing(false);
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  const processFileContent = (fileContent: string, fileName: string) => {
    try {
      console.log('Processing file content, length:', fileContent.length);
      
      // Parse the data
      const parsedData = parseFileData(fileContent);
      console.log('Parsed data:', parsedData);
      
      if (parsedData.rows.length === 0) {
        toast.error('No data found in file. Please check the file format.');
        setIsProcessing(false);
        return;
      }
      
      // Save to localStorage (simulating backend)
      localStorage.setItem('dataGlowFile', fileContent);
      localStorage.setItem('dataGlowFileName', fileName);
      
      // Update preview
      setPreviewData({
        columns: parsedData.columns,
        rows: parsedData.rows.slice(0, 5) // Preview first 5 rows
      });
      
      toast.success(`File uploaded successfully! Found ${parsedData.rows.length} rows and ${parsedData.columns.length} columns.`);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error parsing file. Please check if it\'s a valid format.');
      setIsProcessing(false);
    }
  };
  
  const handleNext = () => {
    if (!localStorage.getItem('dataGlowFile')) {
      toast.error('Please upload a file first');
      return;
    }
    
    navigate('/clean');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4 mb-6">
          <img 
            src="/lovable-uploads/7059121f-19a5-499a-8aa8-4aa20188f8be.png" 
            alt="The Baap Company" 
            className="size-16 animate-baap-glow"
          />
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-baap-gradient bg-clip-text text-transparent">
              Welcome to BaapGlow
            </h1>
            <p className="text-baap-600 font-semibold text-lg">
              Professional Data Intelligence Platform
            </p>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform your raw data into actionable insights with our advanced AI-powered cleaning and visualization tools. 
          Start by uploading your CSV or Excel files to experience the power of professional data analytics.
        </p>
      </div>
      
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-baap-200 p-10 bg-gradient-to-br from-baap-50/50 to-transparent">
        <div 
          className={`flex flex-col items-center justify-center gap-4 text-center ${isDragging ? 'bg-baap-100/50 rounded-lg' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="size-20 rounded-full bg-baap-gradient flex items-center justify-center shadow-lg">
            <FileSpreadsheet className="size-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-baap-800">Drag & Drop your data files here</h3>
            <p className="text-sm text-muted-foreground">
              or click to browse for CSV (.csv) or Excel (.xlsx, .xls) files
            </p>
            <p className="text-xs text-baap-600 font-medium">
              Powered by The Baap Company's AI Technology
            </p>
          </div>
          
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.xlsx,.xls,text/csv,application/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileInput}
            />
            <Button asChild disabled={isProcessing} className="bg-baap-gradient hover:opacity-90 text-white shadow-lg">
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mr-2 size-4" />
                {isProcessing ? 'Processing...' : 'Select Data File'}
              </label>
            </Button>
          </div>
        </div>
      </Card>
      
      {/* File Status */}
      {fileName && (
        <Card className="p-4 border-baap-200">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-baap-gradient rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="size-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-baap-800">{fileName}</h3>
              {isProcessing ? (
                <div className="flex items-center gap-2 text-sm text-baap-600">
                  <AlertCircle className="size-4 animate-spin" />
                  <span>Processing with BaapGlow AI...</span>
                </div>
              ) : previewData ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="size-4" />
                  <span>Loaded {previewData.rows.length} preview rows from {previewData.columns.length} columns</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="size-4" />
                  <span>Failed to process</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
      
      {/* Data Preview */}
      {previewData && previewData.rows.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-baap-800">Data Preview</h2>
            <p className="text-sm text-muted-foreground">Showing the first {previewData.rows.length} rows of your data</p>
          </div>
          
          <div className="border rounded-lg overflow-auto border-baap-200">
            <Table>
              <TableHeader className="bg-baap-50">
                <TableRow>
                  {previewData.columns.map((column, i) => (
                    <TableHead key={i} className="whitespace-nowrap text-baap-700 font-semibold">
                      {column.name}
                      <span className="ml-1 text-xs text-baap-500">({column.type})</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.rows.map((row, i) => (
                  <TableRow key={i} className="hover:bg-baap-50/50">
                    {previewData.columns.map((column, j) => (
                      <TableCell key={j} className="truncate max-w-[200px]">
                        {row[column.name] || <span className="text-muted-foreground italic">empty</span>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Separator />
          
          <div className="flex justify-end">
            <Button onClick={handleNext} className="bg-baap-gradient hover:opacity-90 text-white shadow-lg">
              Continue to Data Cleaning
              <span className="ml-2">→</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
