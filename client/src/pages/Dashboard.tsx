import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/dashboard/StatCard";
import ProgramCard from "@/components/dashboard/ProgramCard";
import ClientsTable from "@/components/dashboard/ClientsTable";
import ClientForm from "@/components/clients/ClientForm";
import ProgramForm from "@/components/programs/ProgramForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Client, ProgramWithEnrollments } from "@shared/schema";
import { Link, useLocation } from "wouter";

interface DashboardStats {
  totalClients: number;
  activePrograms: number;
  newEnrollments: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProgramForm, setShowProgramForm] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/stats');
      return response.json();
    }
  });

  // Fetch active programs with enrollment counts
  const { data: programs, isLoading: isLoadingPrograms } = useQuery<ProgramWithEnrollments[]>({
    queryKey: ['/api/programs/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/programs/stats');
      return response.json();
    }
  });

  // Fetch recent clients (limit to 4)
  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/clients');
      const allClients = await response.json();
      
      // For the dashboard, we just need a few recent clients
      return allClients.slice(0, 4);
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

  const handleViewAllClients = () => {
    navigate("/clients");
  };

  const handleViewAllPrograms = () => {
    navigate("/programs");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Dashboard</h2>
        <div className="flex space-x-2">
          <button 
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors duration-150 flex items-center"
            onClick={() => setShowClientForm(true)}
          >
            <span className="material-icons mr-1 text-sm">person_add</span>
            Register Client
          </button>
          <button 
            className="bg-secondary hover:bg-secondary-dark text-white px-4 py-2 rounded-md transition-colors duration-150 flex items-center"
            onClick={() => setShowProgramForm(true)}
          >
            <span className="material-icons mr-1 text-sm">add_circle</span>
            Create Program
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Clients" 
          value={isLoadingStats ? 0 : stats?.totalClients || 0} 
          icon="person" 
          iconColor="text-primary" 
          iconBgColor="bg-primary-light"
          percentChange={12}
        />
        <StatCard 
          title="Active Programs" 
          value={isLoadingStats ? 0 : stats?.activePrograms || 0} 
          icon="healing" 
          iconColor="text-secondary" 
          iconBgColor="bg-secondary-light"
          percentChange={3}
        />
        <StatCard 
          title="New Enrollments" 
          value={isLoadingStats ? 0 : stats?.newEnrollments || 0} 
          icon="assignment_ind" 
          iconColor="text-warning" 
          iconBgColor="bg-warning"
          percentChange={18}
        />
      </div>

      {/* Recent Clients */}
      <ClientsTable 
        clients={clientsWithPrograms}
        title="Recent Clients"
        emptyMessage={isLoadingClients ? "Loading clients..." : "No clients found"}
        showViewAll={true}
        onViewAllClick={handleViewAllClients}
      />

      {/* Health Programs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Active Health Programs</h3>
          <button 
            className="text-primary text-sm hover:underline"
            onClick={handleViewAllPrograms}
          >
            View All
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingPrograms ? (
            <div className="col-span-full text-center py-4 text-neutral-500">
              Loading programs...
            </div>
          ) : programs && programs.length > 0 ? (
            programs.map(program => (
              <ProgramCard key={program.id} program={program} />
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-neutral-500">
              No active health programs found
            </div>
          )}
        </div>
      </div>

      {/* Client Registration Form */}
      {showClientForm && (
        <ClientForm 
          isOpen={showClientForm}
          onClose={() => setShowClientForm(false)}
        />
      )}

      {/* Program Creation Form */}
      {showProgramForm && (
        <ProgramForm 
          isOpen={showProgramForm}
          onClose={() => setShowProgramForm(false)}
        />
      )}
    </div>
  );
}
