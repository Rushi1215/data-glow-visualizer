
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
    
    // Validate file type
    const validTypes = ['text/csv', 'application/csv', 'text/plain'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Check both MIME type and extension
    if (!validTypes.includes(file.type) && fileExtension !== 'csv') {
      toast.error('Please upload a CSV file only. Excel files are not supported yet.');
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setFileName(file.name);
    setIsProcessing(true);
    
    // Read file contents
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        console.log('File content loaded, length:', fileContent.length);
        console.log('First 200 characters:', fileContent.substring(0, 200));
        
        // Check if file content looks like binary
        if (fileContent.includes('\0') || fileContent.includes('�')) {
          toast.error('This appears to be a binary file. Please upload a text-based CSV file.');
          setIsProcessing(false);
          return;
        }
        
        // Parse CSV data
        const parsedData = parseFileData(fileContent);
        console.log('Parsed data:', parsedData);
        
        if (parsedData.rows.length === 0) {
          toast.error('No data found in file. Please check the CSV format.');
          setIsProcessing(false);
          return;
        }
        
        // Save to localStorage (simulating backend)
        localStorage.setItem('dataGlowFile', fileContent);
        localStorage.setItem('dataGlowFileName', file.name);
        
        // Update preview
        setPreviewData({
          columns: parsedData.columns,
          rows: parsedData.rows.slice(0, 5) // Preview first 5 rows
        });
        
        toast.success(`File uploaded successfully! Found ${parsedData.rows.length} rows and ${parsedData.columns.length} columns.`);
        setIsProcessing(false);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Error parsing file. Please check if it\'s a valid CSV format.');
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      toast.error('Error reading file. Please try again.');
      setIsProcessing(false);
    };
    
    reader.readAsText(file, 'UTF-8');
  }, []);
  
  const handleNext = () => {
    if (!localStorage.getItem('dataGlowFile')) {
      toast.error('Please upload a file first');
      return;
    }
    
    navigate('/clean');
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload Your Data</h1>
        <p className="text-muted-foreground">
          Start by uploading a CSV file to clean and visualize your data
        </p>
      </div>
      
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-border p-10">
        <div 
          className={`flex flex-col items-center justify-center gap-4 text-center ${isDragging ? 'bg-secondary/50 rounded-lg' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
            <FileSpreadsheet className="size-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Drag & Drop your CSV file here</h3>
            <p className="text-sm text-muted-foreground">
              or click to browse for a CSV file (text format only)
            </p>
          </div>
          
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,text/csv,application/csv"
              onChange={handleFileInput}
            />
            <Button asChild disabled={isProcessing}>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mr-2 size-4" />
                {isProcessing ? 'Processing...' : 'Select CSV File'}
              </label>
            </Button>
          </div>
        </div>
      </Card>
      
      {/* File Status */}
      {fileName && (
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="size-6 text-primary" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium">{fileName}</h3>
              {isProcessing ? (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <AlertCircle className="size-4 animate-spin" />
                  <span>Processing file...</span>
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
            <h2 className="text-xl font-semibold">Data Preview</h2>
            <p className="text-sm text-muted-foreground">Showing the first {previewData.rows.length} rows of your data</p>
          </div>
          
          <div className="border rounded-lg overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {previewData.columns.map((column, i) => (
                    <TableHead key={i} className="whitespace-nowrap">
                      {column.name}
                      <span className="ml-1 text-xs text-muted-foreground">({column.type})</span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.rows.map((row, i) => (
                  <TableRow key={i}>
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
            <Button onClick={handleNext}>
              Next Step
              <span className="ml-2">→</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
