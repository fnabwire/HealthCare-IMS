import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Enrollment, Client, Program } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatProgramBadge, formatProgramStatusBadge } from "@/lib/utils";
import ClientProfile from "@/components/clients/ClientProfile";
import EnrollmentForm from "@/components/enrollments/EnrollmentForm";

interface EnrollmentWithDetails extends Enrollment {
  client: Client;
  program: Program;
}

export default function Enrollments() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all enrollments with client and program details
  const { data: enrollments, isLoading, refetch } = useQuery<EnrollmentWithDetails[]>({
    queryKey: ['/api/enrollments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/enrollments');
      const enrollmentsData = await response.json();
      
      // For each enrollment, fetch client and program details
      const enrichedEnrollments = await Promise.all(
        enrollmentsData.map(async (enrollment: Enrollment) => {
          const clientResponse = await apiRequest('GET', `/api/clients/${enrollment.clientId}`);
          const client = await clientResponse.json();
          
          const programResponse = await apiRequest('GET', `/api/programs/${enrollment.programId}`);
          const program = await programResponse.json();
          
          return {
            ...enrollment,
            client,
            program
          };
        })
      );
      
      return enrichedEnrollments;
    }
  });

  // Handle enrollment search
  const filteredEnrollments = searchQuery && enrollments
    ? enrollments.filter(enrollment => 
        enrollment.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.client.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.program.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : enrollments;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleViewClient = (clientId: number) => {
    setSelectedClientId(clientId);
    setShowClientProfile(true);
  };

  const handleEnrollClient = () => {
    // First, get all clients to choose from
    apiRequest('GET', '/api/clients')
      .then(response => response.json())
      .then(clients => {
        if (clients && clients.length > 0) {
          setSelectedClient(clients[0]); // Select the first client by default
          setShowEnrollmentForm(true);
        } else {
          alert("No clients available for enrollment. Please register a client first.");
        }
      })
      .catch(error => {
        console.error("Error fetching clients:", error);
        alert("Error loading clients. Please try again.");
      });
  };

  const handleCloseClientProfile = () => {
    setShowClientProfile(false);
    refetch();
  };

  const handleCloseEnrollmentForm = () => {
    setShowEnrollmentForm(false);
  };

  const handleEnrollmentSuccess = () => {
    setShowEnrollmentForm(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Program Enrollments</h2>
        <button 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors duration-150 flex items-center"
          onClick={handleEnrollClient}
        >
          <span className="material-icons mr-1 text-sm">person_add</span>
          Enroll Client
        </button>
      </div>
      
      {/* Search Box */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
            <span className="material-icons text-sm">search</span>
          </span>
          <input 
            type="text" 
            placeholder="Search enrollments by client or program..." 
            className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary border border-neutral-300"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {/* Enrollments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold">All Enrollments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Enrolled Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                    Loading enrollments...
                  </td>
                </tr>
              ) : filteredEnrollments && filteredEnrollments.length > 0 ? (
                filteredEnrollments.map((enrollment) => {
                  const statusBadge = formatProgramStatusBadge(enrollment.status);
                  let riskBadge = { className: "bg-success bg-opacity-10 text-success", label: "Low" };
                  
                  if (enrollment.riskLevel === "medium") {
                    riskBadge = { className: "bg-warning bg-opacity-10 text-warning", label: "Medium" };
                  } else if (enrollment.riskLevel === "high") {
                    riskBadge = { className: "bg-error bg-opacity-10 text-error", label: "High" };
                  }
                  
                  return (
                    <tr key={enrollment.id} className="hover:bg-neutral-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="font-medium text-neutral-800">{enrollment.client.name}</p>
                            <p className="text-xs text-neutral-500">{enrollment.client.clientId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${formatProgramBadge(enrollment.program.code)}`}>
                          {enrollment.program.code}
                        </span>
                        <p className="text-xs text-neutral-500 mt-1">{enrollment.program.name}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                        {formatDate(enrollment.enrollDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${riskBadge.className}`}>
                          {riskBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-primary hover:text-primary-dark"
                          onClick={() => handleViewClient(enrollment.clientId)}
                        >
                          View Client
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                    No enrollments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredEnrollments && filteredEnrollments.length > 0 && (
          <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
            Showing {filteredEnrollments.length} {filteredEnrollments.length === 1 ? 'enrollment' : 'enrollments'}
          </div>
        )}
      </div>
      
      {/* Client Profile Modal */}
      {showClientProfile && selectedClientId && (
        <ClientProfile 
          clientId={selectedClientId}
          isOpen={showClientProfile}
          onClose={handleCloseClientProfile}
        />
      )}
      
      {/* Enrollment Form */}
      {showEnrollmentForm && selectedClient && (
        <EnrollmentForm 
          isOpen={showEnrollmentForm}
          onClose={handleCloseEnrollmentForm}
          client={selectedClient}
          onSuccess={handleEnrollmentSuccess}
        />
      )}
    </div>
  );
}
