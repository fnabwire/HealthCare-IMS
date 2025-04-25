import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClientWithDetails, Program } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDate, formatDateTime, calculateAge, formatProgramBadge, formatProgramStatusBadge } from "@/lib/utils";
import EnrollmentForm from "../enrollments/EnrollmentForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface ClientProfileProps {
  clientId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientProfile({ clientId, isOpen, onClose }: ClientProfileProps) {
  const { toast } = useToast();
  const [showEnrollForm, setShowEnrollForm] = useState(false);

  const { data: client, isLoading, error } = useQuery<ClientWithDetails>({
    queryKey: [`/api/clients/${clientId}/details`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/clients/${clientId}/details`);
      return response.json();
    }
  });

  const handleUnenroll = async (programId: number) => {
    if (!confirm("Are you sure you want to unenroll the client from this program?")) {
      return;
    }

    try {
      await apiRequest('DELETE', `/api/clients/${clientId}/programs/${programId}`);
      
      toast({
        title: "Success",
        description: "Client unenrolled from program successfully",
      });
      
      // Invalidate client details
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/details`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unenroll client from program",
        variant: "destructive",
      });
    }
  };

  const handleEnrollSuccess = () => {
    setShowEnrollForm(false);
    // Refresh the client details
    queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/details`] });
  };

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl">
          <div className="p-6 text-center">
            <div className="text-error mb-4">
              <span className="material-icons text-4xl">error</span>
            </div>
            <h3 className="text-lg font-medium">Error Loading Client</h3>
            <p className="text-neutral-500 mt-2">Failed to load client details. Please try again.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin mb-4">
                <span className="material-icons text-4xl">refresh</span>
              </div>
              <p>Loading client details...</p>
            </div>
          ) : client ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-800">Client Profile</h3>
                <button className="text-neutral-500 hover:text-neutral-700" onClick={onClose}>
                  <span className="material-icons">close</span>
                </button>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
                    <div className="bg-neutral-100 rounded-lg p-6">
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-neutral-300 rounded-full flex items-center justify-center overflow-hidden">
                          <span className="material-icons text-5xl text-neutral-500">person</span>
                        </div>
                        <h4 className="mt-4 text-xl font-semibold text-neutral-800">{client.name}</h4>
                        <p className="text-neutral-500">{client.clientId}</p>
                        <div className="mt-2 px-3 py-1 rounded-full bg-success bg-opacity-10 text-success text-sm">
                          {client.status}
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-neutral-500 mr-2 text-lg">cake</span>
                          <div>
                            <p className="text-neutral-500">Date of Birth</p>
                            <p className="font-medium">
                              {formatDate(client.dob)} ({calculateAge(client.dob)} years)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-neutral-500 mr-2 text-lg">phone</span>
                          <div>
                            <p className="text-neutral-500">Phone</p>
                            <p className="font-medium">{client.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-neutral-500 mr-2 text-lg">location_on</span>
                          <div>
                            <p className="text-neutral-500">Address</p>
                            <p className="font-medium">{client.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-neutral-500 mr-2 text-lg">mail</span>
                          <div>
                            <p className="text-neutral-500">Email</p>
                            <p className="font-medium">{client.email || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-neutral-500 mr-2 text-lg">contact_phone</span>
                          <div>
                            <p className="text-neutral-500">Emergency Contact</p>
                            <p className="font-medium">{client.emergencyContact}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-neutral-200">
                        <h5 className="text-sm font-medium text-neutral-700 mb-2">Registered On</h5>
                        <p className="text-sm text-neutral-500">{formatDateTime(client.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-lg">Enrolled Programs</h4>
                        <button 
                          className="text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary-dark transition-colors duration-150 flex items-center"
                          onClick={() => setShowEnrollForm(true)}
                        >
                          <span className="material-icons text-sm mr-1">add</span>
                          Enroll in Program
                        </button>
                      </div>
                      <div className="bg-white rounded-md border border-neutral-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Program
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Enrolled Date
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            {client.enrollments && client.enrollments.length > 0 ? (
                              client.enrollments.map((enrollment) => {
                                const statusBadge = formatProgramStatusBadge(enrollment.status);
                                
                                return (
                                  <tr key={enrollment.id}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="bg-primary bg-opacity-10 p-2 rounded-md">
                                          <span className="material-icons text-primary text-lg">local_hospital</span>
                                        </div>
                                        <div className="ml-3">
                                          <p className="font-medium text-neutral-800">{enrollment.program.name}</p>
                                          <p className="text-xs text-neutral-500">{enrollment.program.code}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                                      {formatDate(enrollment.enrollDate)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.className}`}>
                                        {statusBadge.label}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                                      <button 
                                        className="text-error hover:text-error-dark" 
                                        onClick={() => handleUnenroll(enrollment.programId)}
                                      >
                                        Unenroll
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={4} className="px-4 py-3 text-center text-neutral-500">
                                  Client is not enrolled in any programs
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {client.visits && client.visits.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-lg mb-4">Recent Visits</h4>
                        <div className="bg-white rounded-md border border-neutral-200 overflow-hidden">
                          <table className="min-w-full divide-y divide-neutral-200">
                            <thead className="bg-neutral-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Program
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Doctor
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                  Purpose
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200">
                              {client.visits.map((visit) => (
                                <tr key={visit.id}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {formatDate(visit.date)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 text-xs rounded-full ${formatProgramBadge(visit.program.code)}`}>
                                      {visit.program.code}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {visit.doctor}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    {visit.purpose}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {client.notes && client.notes.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-lg">Client Notes</h4>
                        </div>
                        <div className="space-y-3">
                          {client.notes.map((note) => (
                            <div key={note.id} className="bg-white rounded-md border border-neutral-200 p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium">{note.createdBy}</p>
                                  <p className="text-xs text-neutral-500">{formatDateTime(note.createdAt)}</p>
                                </div>
                                {note.program && (
                                  <span className={`px-2 py-1 text-xs rounded-full ${formatProgramBadge(note.program.code)}`}>
                                    {note.program.code}
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-sm">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
                >
                  Close
                </Button>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p>Client not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enrollment Form */}
      {showEnrollForm && client && (
        <EnrollmentForm 
          isOpen={showEnrollForm}
          onClose={() => setShowEnrollForm(false)}
          client={client}
          onSuccess={handleEnrollSuccess}
        />
      )}
    </>
  );
}
