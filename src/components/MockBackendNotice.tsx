
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const MockBackendNotice: React.FC = () => {
  return (
    <Alert className="mb-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Mock Backend Mode</AlertTitle>
      <AlertDescription>
        DataGlow is running with a simulated backend. In a production environment,
        the app would connect to a FastAPI backend for real data processing.
      </AlertDescription>
    </Alert>
  );
};

export default MockBackendNotice;
