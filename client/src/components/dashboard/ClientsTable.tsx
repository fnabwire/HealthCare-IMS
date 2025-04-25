import { useState } from "react";
import { Client } from "@shared/schema";
import { formatProgramBadge, formatProgramStatusBadge } from "@/lib/utils";
import ClientProfile from "../clients/ClientProfile";

interface ProgramBadge {
  code: string;
  name: string;
}

interface ClientWithPrograms extends Client {
  programs: ProgramBadge[];
  status: string;
}

interface ClientsTableProps {
  clients: ClientWithPrograms[];
  title: string;
  emptyMessage?: string;
  showViewAll?: boolean;
  onViewAllClick?: () => void;
}

export default function ClientsTable({ 
  clients, 
  title, 
  emptyMessage = "No clients found",
  showViewAll = false,
  onViewAllClick
}: ClientsTableProps) {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showClientProfile, setShowClientProfile] = useState(false);

  const handleViewClient = (clientId: number) => {
    setSelectedClientId(clientId);
    setShowClientProfile(true);
  };

  const handleCloseClientProfile = () => {
    setShowClientProfile(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          {showViewAll && (
            <button 
              className="text-primary text-sm hover:underline"
              onClick={onViewAllClick}
            >
              View All
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Client ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Programs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {clients.length > 0 ? (
                clients.map((client) => {
                  const statusBadge = formatProgramStatusBadge(client.status);
                  
                  return (
                    <tr key={client.id} className="hover:bg-neutral-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                        {client.clientId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                        {client.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {client.programs && client.programs.length > 0 ? (
                          client.programs.map((program) => (
                            <span 
                              key={program.code} 
                              className={`px-2 py-1 text-xs rounded-full ${formatProgramBadge(program.code)} inline-block mr-1 mb-1`}
                            >
                              {program.code}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-400 text-xs">No programs</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-primary hover:text-primary-dark"
                          onClick={() => handleViewClient(client.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-neutral-500">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {clients.length > 0 && (
          <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
            Showing {clients.length} {clients.length === 1 ? 'client' : 'clients'}
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
    </>
  );
}
