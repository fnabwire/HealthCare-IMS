import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

export default function ApiDocs() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const handleCopyCode = (code: string, endpoint: string) => {
    navigator.clipboard.writeText(code);
    setCopiedEndpoint(endpoint);
    
    setTimeout(() => {
      setCopiedEndpoint(null);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">API Documentation</h2>
      </div>

      <Alert className="bg-primary-light bg-opacity-10 border-primary">
        <span className="material-icons mr-2 text-primary">api</span>
        <AlertTitle className="text-primary">API Access</AlertTitle>
        <AlertDescription>
          The Health Information System provides a comprehensive API for integrating with external systems.
          All API endpoints are accessible at <code className="px-1 py-0.5 bg-neutral-100 rounded text-primary">/api</code>.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-3/4 lg:w-1/2">
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients" className="pt-4 space-y-4">
          <ApiEndpoint
            method="GET"
            endpoint="/api/clients"
            description="Returns a list of all registered clients"
            responseExample={`[
  {
    "id": 1,
    "clientId": "HIS-2023-001",
    "name": "James Wilson",
    "dob": "1985-05-12",
    "gender": "male",
    "phone": "+254-712-345-678",
    "address": "123 Main St, Nairobi",
    "email": "james.wilson@example.com",
    "emergencyContact": "Mary Wilson: +254-723-456-789",
    "status": "active",
    "createdAt": "2023-10-15T14:45:00Z"
  },
  // ...more clients
]`}
            onCopy={(code) => handleCopyCode(code, "/api/clients")}
            isCopied={copiedEndpoint === "/api/clients"}
          />

          <ApiEndpoint
            method="GET"
            endpoint="/api/clients/:id"
            description="Returns details of a specific client by ID"
            responseExample={`{
  "id": 1,
  "clientId": "HIS-2023-001",
  "name": "James Wilson",
  "dob": "1985-05-12",
  "gender": "male",
  "phone": "+254-712-345-678",
  "address": "123 Main St, Nairobi",
  "email": "james.wilson@example.com",
  "emergencyContact": "Mary Wilson: +254-723-456-789",
  "status": "active",
  "createdAt": "2023-10-15T14:45:00Z"
}`}
            onCopy={(code) => handleCopyCode(code, "/api/clients/:id")}
            isCopied={copiedEndpoint === "/api/clients/:id"}
          />

          <ApiEndpoint
            method="GET"
            endpoint="/api/clients/:id/details"
            description="Returns comprehensive details of a client including enrollments, visits, and notes"
            responseExample={`{
  "id": 1,
  "clientId": "HIS-2023-001",
  "name": "James Wilson",
  "dob": "1985-05-12",
  "gender": "male",
  "phone": "+254-712-345-678",
  "address": "123 Main St, Nairobi",
  "email": "james.wilson@example.com",
  "emergencyContact": "Mary Wilson: +254-723-456-789",
  "status": "active",
  "createdAt": "2023-10-15T14:45:00Z",
  "enrollments": [
    {
      "id": 1,
      "clientId": 1,
      "programId": 1,
      "enrollDate": "2023-09-01T00:00:00Z",
      "notes": "Initial enrollment for TB treatment",
      "status": "active",
      "symptomSeverity": "moderate",
      "riskLevel": "medium",
      "followUpRequired": true,
      "program": {
        "id": 1,
        "name": "Tuberculosis (TB)",
        "code": "TB",
        "description": "Prevention and treatment of tuberculosis",
        "requiredInfo": ["testResults", "medication", "symptoms", "followup"]
      }
    }
  ],
  "visits": [
    {
      "id": 1,
      "clientId": 1,
      "programId": 1,
      "date": "2023-10-10T10:30:00Z",
      "doctor": "Dr. Sarah Johnson",
      "purpose": "Follow-up consultation and medication review",
      "program": {
        "id": 1,
        "name": "Tuberculosis (TB)",
        "code": "TB",
        "description": "Prevention and treatment of tuberculosis",
        "requiredInfo": ["testResults", "medication", "symptoms", "followup"]
      }
    }
  ],
  "notes": [
    {
      "id": 1,
      "clientId": 1,
      "programId": 1,
      "content": "Patient showing good progress on current medication regimen.",
      "createdBy": "Dr. Sarah Johnson",
      "createdAt": "2023-10-10T14:30:00Z",
      "program": {
        "id": 1,
        "name": "Tuberculosis (TB)",
        "code": "TB",
        "description": "Prevention and treatment of tuberculosis",
        "requiredInfo": ["testResults", "medication", "symptoms", "followup"]
      }
    }
  ]
}`}
            onCopy={(code) => handleCopyCode(code, "/api/clients/:id/details")}
            isCopied={copiedEndpoint === "/api/clients/:id/details"}
          />

          <ApiEndpoint
            method="GET"
            endpoint="/api/clients?search=query"
            description="Search for clients by name, ID, or phone number"
            responseExample={`[
  {
    "id": 1,
    "clientId": "HIS-2023-001",
    "name": "James Wilson",
    "dob": "1985-05-12",
    "gender": "male",
    "phone": "+254-712-345-678",
    "address": "123 Main St, Nairobi",
    "email": "james.wilson@example.com",
    "emergencyContact": "Mary Wilson: +254-723-456-789",
    "status": "active",
    "createdAt": "2023-10-15T14:45:00Z"
  }
]`}
            onCopy={(code) => handleCopyCode(code, "/api/clients?search=query")}
            isCopied={copiedEndpoint === "/api/clients?search=query"}
          />

          <ApiEndpoint
            method="POST"
            endpoint="/api/clients"
            description="Register a new client"
            requestExample={`{
  "name": "John Doe",
  "dob": "1990-01-15",
  "gender": "male",
  "phone": "+254-735-678-901",
  "address": "456 Park Avenue, Nairobi",
  "email": "john.doe@example.com",
  "emergencyContact": "Jane Doe: +254-735-678-902",
  "status": "active"
}`}
            responseExample={`{
  "id": 5,
  "clientId": "HIS-2023-005",
  "name": "John Doe",
  "dob": "1990-01-15",
  "gender": "male",
  "phone": "+254-735-678-901",
  "address": "456 Park Avenue, Nairobi",
  "email": "john.doe@example.com",
  "emergencyContact": "Jane Doe: +254-735-678-902",
  "status": "active",
  "createdAt": "2023-10-15T14:45:00Z"
}`}
            onCopy={(code) => handleCopyCode(code, "/api/clients (POST)")}
            isCopied={copiedEndpoint === "/api/clients (POST)"}
          />
        </TabsContent>
        
        <TabsContent value="programs" className="pt-4 space-y-4">
          <ApiEndpoint
            method="GET"
            endpoint="/api/programs"
            description="Returns a list of all health programs"
            responseExample={`[
  {
    "id": 1,
    "name": "Tuberculosis (TB)",
    "code": "TB",
    "description": "Prevention and treatment of tuberculosis",
    "requiredInfo": ["testResults", "medication", "symptoms", "followup"]
  },
  // ...more programs
]`}
            onCopy={(code) => handleCopyCode(code, "/api/programs")}
            isCopied={copiedEndpoint === "/api/programs"}
          />

          <ApiEndpoint
            method="GET"
            endpoint="/api/programs/:id"
            description="Returns details of a specific health program by ID"
            responseExample={`{
  "id": 1,
  "name": "Tuberculosis (TB)",
  "code": "TB",
  "description": "Prevention and treatment of tuberculosis",
  "requiredInfo": ["testResults", "medication", "symptoms", "followup"]
}`}
            onCopy={(code) => handleCopyCode(code, "/api/programs/:id")}
            isCopied={copiedEndpoint === "/api/programs/:id"}
          />

          <ApiEndpoint
            method="GET"
            endpoint="/api/programs/stats"
            description="Returns all programs with their enrollment counts"
            responseExample={`[
  {
    "id": 1,
    "name": "Tuberculosis (TB)",
    "code": "TB",
    "description": "Prevention and treatment of tuberculosis",
    "requiredInfo": ["testResults", "medication", "symptoms", "followup"],
    "enrollmentCount": 63
  },
  // ...more programs with statistics
]`}
            onCopy={(code) => handleCopyCode(code, "/api/programs/stats")}
            isCopied={copiedEndpoint === "/api/programs/stats"}
          />

          <ApiEndpoint
            method="POST"
            endpoint="/api/programs"
            description="Create a new health program"
            requestExample={`{
  "name": "Hypertension Management",
  "code": "HTN",
  "description": "Monitoring and management of hypertension",
  "requiredInfo": ["testResults", "medication", "followup"]
}`}
            responseExample={`{
  "id": 5,
  "name": "Hypertension Management",
  "code": "HTN",
  "description": "Monitoring and management of hypertension",
  "requiredInfo": ["testResults", "medication", "followup"]
}`}
            onCopy={(code) => handleCopyCode(code, "/api/programs (POST)")}
            isCopied={copiedEndpoint === "/api/programs (POST)"}
          />
        </TabsContent>
        
        <TabsContent value="enrollments" className="pt-4 space-y-4">
          <ApiEndpoint
            method="GET"
            endpoint="/api/enrollments"
            description="Returns a list of all program enrollments"
            responseExample={`[
  {
    "id": 1,
    "clientId": 1,
    "programId": 1,
    "enrollDate": "2023-09-01T00:00:00Z",
    "notes": "Initial enrollment for TB treatment",
    "status": "active",
    "symptomSeverity": "moderate",
    "riskLevel": "medium",
    "followUpRequired": true
  },
  // ...more enrollments
]`}
            onCopy={(code) => handleCopyCode(code, "/api/enrollments")}
            isCopied={copiedEndpoint === "/api/enrollments"}
          />

          <ApiEndpoint
            method="GET"
            endpoint="/api/clients/:clientId/enrollments"
            description="Returns all enrollments for a specific client"
            responseExample={`[
  {
    "id": 1,
    "clientId": 1,
    "programId": 1,
    "enrollDate": "2023-09-01T00:00:00Z",
    "notes": "Initial enrollment for TB treatment",
    "status": "active",
    "symptomSeverity": "moderate",
    "riskLevel": "medium",
    "followUpRequired": true,
    "program": {
      "id": 1,
      "name": "Tuberculosis (TB)",
      "code": "TB",
      "description": "Prevention and treatment of tuberculosis",
      "requiredInfo": ["testResults", "medication", "symptoms", "followup"]
    }
  },
  // ...more enrollments for this client
]`}
            onCopy={(code) => handleCopyCode(code, "/api/clients/:clientId/enrollments")}
            isCopied={copiedEndpoint === "/api/clients/:clientId/enrollments"}
          />

          <ApiEndpoint
            method="POST"
            endpoint="/api/enrollments"
            description="Enroll a client in a health program"
            requestExample={`{
  "clientId": 1,
  "programId": 2,
  "enrollDate": "2023-10-15T00:00:00Z",
  "notes": "Client showing early symptoms, needs regular monitoring",
  "symptomSeverity": "mild",
  "riskLevel": "low",
  "followUpRequired": true
}`}
            responseExample={`{
  "id": 3,
  "clientId": 1,
  "programId": 2,
  "enrollDate": "2023-10-15T00:00:00Z",
  "notes": "Client showing early symptoms, needs regular monitoring",
  "status": "active",
  "symptomSeverity": "mild",
  "riskLevel": "low",
  "followUpRequired": true
}`}
            onCopy={(code) => handleCopyCode(code, "/api/enrollments (POST)")}
            isCopied={copiedEndpoint === "/api/enrollments (POST)"}
          />

          <ApiEndpoint
            method="DELETE"
            endpoint="/api/clients/:clientId/programs/:programId"
            description="Unenroll a client from a health program"
            responseExample="204 No Content (Success - No Response Body)"
            onCopy={(code) => handleCopyCode(code, "/api/clients/:clientId/programs/:programId (DELETE)")}
            isCopied={copiedEndpoint === "/api/clients/:clientId/programs/:programId (DELETE)"}
          />
        </TabsContent>
        
        <TabsContent value="stats" className="pt-4 space-y-4">
          <ApiEndpoint
            method="GET"
            endpoint="/api/stats"
            description="Returns system-wide statistics"
            responseExample={`{
  "totalClients": 247,
  "activePrograms": 8,
  "newEnrollments": 52
}`}
            onCopy={(code) => handleCopyCode(code, "/api/stats")}
            isCopied={copiedEndpoint === "/api/stats"}
          />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Using the API</CardTitle>
          <CardDescription>
            All API endpoints return JSON responses and accept JSON in request bodies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Authentication</h4>
            <p className="text-neutral-600 text-sm">
              Currently, the API is available for internal use without authentication.
              Future releases will include API key authentication for secure access.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Error Handling</h4>
            <p className="text-neutral-600 text-sm mb-3">
              The API uses standard HTTP status codes to indicate success or failure:
            </p>
            <ul className="list-disc pl-5 text-sm text-neutral-600 space-y-1">
              <li><span className="font-medium">200 OK</span> - Request succeeded</li>
              <li><span className="font-medium">201 Created</span> - Resource created successfully</li>
              <li><span className="font-medium">204 No Content</span> - Request succeeded (no response body)</li>
              <li><span className="font-medium">400 Bad Request</span> - Invalid input parameters</li>
              <li><span className="font-medium">404 Not Found</span> - Resource not found</li>
              <li><span className="font-medium">409 Conflict</span> - Resource already exists</li>
              <li><span className="font-medium">500 Internal Server Error</span> - Server-side error</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Error Response Format</h4>
            <pre className="bg-neutral-100 p-3 rounded-md text-sm">
              {`{
  "message": "Detailed error description"
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ApiEndpointProps {
  method: string;
  endpoint: string;
  description: string;
  requestExample?: string;
  responseExample: string;
  onCopy: (code: string) => void;
  isCopied: boolean;
}

function ApiEndpoint({
  method, 
  endpoint, 
  description, 
  requestExample, 
  responseExample,
  onCopy,
  isCopied
}: ApiEndpointProps) {
  const getMethodColor = (method: string) => {
    switch(method) {
      case 'GET': return 'bg-primary-light text-primary-dark';
      case 'POST': return 'bg-success bg-opacity-20 text-success';
      case 'PUT': return 'bg-warning bg-opacity-20 text-warning';
      case 'DELETE': return 'bg-error bg-opacity-20 text-error';
      default: return 'bg-neutral-200 text-neutral-700';
    }
  };

  const copyContent = () => {
    const content = [
      `${method} ${endpoint}`,
      description,
      requestExample ? `Request Body:\n${requestExample}` : null,
      `Response:\n${responseExample}`
    ].filter(Boolean).join('\n\n');
    
    onCopy(content);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-md text-sm font-medium ${getMethodColor(method)}`}>
              {method}
            </span>
            <CardTitle className="text-base font-medium">{endpoint}</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-neutral-500"
            onClick={copyContent}
          >
            {isCopied ? (
              'Copied!'
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requestExample && (
          <div>
            <h4 className="text-sm font-medium mb-1 text-neutral-600">Request</h4>
            <pre className="bg-neutral-100 p-3 rounded-md text-xs overflow-x-auto">
              {requestExample}
            </pre>
          </div>
        )}
        <div>
          <h4 className="text-sm font-medium mb-1 text-neutral-600">Response</h4>
          <pre className="bg-neutral-100 p-3 rounded-md text-xs overflow-x-auto">
            {responseExample}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
