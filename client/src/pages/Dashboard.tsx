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
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="gradient-text">Dashboard Overview</h2>
        <div className="flex space-x-3">
          <button 
            className="btn-primary flex items-center shadow-sm"
            onClick={() => setShowClientForm(true)}
          >
            <span className="material-icons mr-1 text-sm">person_add</span>
            Register Client
          </button>
          <button 
            className="btn-secondary flex items-center shadow-sm"
            onClick={() => setShowProgramForm(true)}
          >
            <span className="material-icons mr-1 text-sm">add_circle</span>
            Create Program
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl shadow-sm border border-border/40 p-6 card-hover">
          <StatCard 
            title="Total Clients" 
            value={isLoadingStats ? 0 : stats?.totalClients || 0} 
            icon="group" 
            iconColor="text-primary-foreground" 
            iconBgColor="bg-primary"
            percentChange={12}
            changeText="since last month"
          />
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border/40 p-6 card-hover">
          <StatCard 
            title="Active Programs" 
            value={isLoadingStats ? 0 : stats?.activePrograms || 0} 
            icon="healing" 
            iconColor="text-secondary-foreground" 
            iconBgColor="bg-secondary"
            percentChange={3}
            changeText="since last month"
          />
        </div>
        <div className="bg-card rounded-xl shadow-sm border border-border/40 p-6 card-hover">
          <StatCard 
            title="New Enrollments" 
            value={isLoadingStats ? 0 : stats?.newEnrollments || 0} 
            icon="assignment_ind" 
            iconColor="text-accent-foreground" 
            iconBgColor="bg-accent"
            percentChange={18}
            changeText="this week"
          />
        </div>
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
      <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border/40">
        <div className="px-6 py-4 border-b border-border/60 flex justify-between items-center">
          <h3 className="font-semibold text-primary">Active Health Programs</h3>
          <button 
            className="text-primary hover:text-primary/80 flex items-center text-sm transition-colors"
            onClick={handleViewAllPrograms}
          >
            View All
            <span className="material-icons ml-1 text-sm">arrow_forward</span>
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoadingPrograms ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <span className="material-icons animate-spin mb-2">refresh</span>
              <p>Loading programs...</p>
            </div>
          ) : programs && programs.length > 0 ? (
            programs.map(program => (
              <div key={program.id} className="card-hover">
                <ProgramCard program={program} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <span className="material-icons mb-2 text-4xl">healing</span>
              <p>No active health programs found</p>
              <button 
                onClick={() => setShowProgramForm(true)}
                className="mt-2 text-secondary hover:text-secondary/80"
              >
                Create your first program
              </button>
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
