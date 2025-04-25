import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Client } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import ClientsTable from "@/components/dashboard/ClientsTable";
import ClientForm from "@/components/clients/ClientForm";
import ClientProfile from "@/components/clients/ClientProfile";
import ClientUpdateForm from "@/components/clients/ClientUpdateForm";

export default function Clients() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const clientIdParam = params.get("id");
  
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(
    clientIdParam ? parseInt(clientIdParam) : null
  );
  const [showClientProfile, setShowClientProfile] = useState(!!clientIdParam);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [clientToUpdate, setClientToUpdate] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all clients
  const { data: clients, isLoading, refetch } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/clients');
      return response.json();
    }
  });

  // Transform clients data to include program information
  const clientsWithPrograms = clients?.map(client => ({
    ...client,
    programs: [
      { code: "TB", name: "Tuberculosis" },
      { code: "MALARIA", name: "Malaria" }
    ],
    status: "active"
  })) || [];

  // Handle client search
  const filteredClients = searchQuery
    ? clientsWithPrograms.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : clientsWithPrograms;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddClient = () => {
    setShowClientForm(true);
  };

  const handleViewClient = (clientId: number) => {
    setSelectedClientId(clientId);
    setShowClientProfile(true);
  };

  const handleCloseClientForm = () => {
    setShowClientForm(false);
    refetch();
  };

  const handleCloseClientProfile = () => {
    setShowClientProfile(false);
    refetch();
  };
  
  const handleEditClient = (client: Client) => {
    setClientToUpdate(client);
    setShowUpdateForm(true);
  };
  
  const handleCloseUpdateForm = () => {
    setShowUpdateForm(false);
    setClientToUpdate(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Clients</h2>
        <button 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors duration-150 flex items-center"
          onClick={handleAddClient}
        >
          <span className="material-icons mr-1 text-sm">person_add</span>
          Register Client
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
            placeholder="Search clients by name, ID, or phone..." 
            className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary border border-neutral-300"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {/* Clients Table */}
      <ClientsTable 
        clients={filteredClients}
        title="All Clients"
        emptyMessage={isLoading ? "Loading clients..." : "No clients found"}
        onEditClient={handleEditClient}
      />
      
      {/* Client Registration Form */}
      {showClientForm && (
        <ClientForm 
          isOpen={showClientForm}
          onClose={handleCloseClientForm}
        />
      )}
      
      {/* Client Profile Modal */}
      {showClientProfile && selectedClientId && (
        <ClientProfile 
          clientId={selectedClientId} 
          isOpen={showClientProfile}
          onClose={handleCloseClientProfile}
        />
      )}
      
      {/* Client Update Form */}
      {showUpdateForm && clientToUpdate && (
        <ClientUpdateForm
          client={clientToUpdate}
          isOpen={showUpdateForm}
          onClose={handleCloseUpdateForm}
        />
      )}
    </div>
  );
}
