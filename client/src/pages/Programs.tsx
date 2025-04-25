import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Program, ProgramWithEnrollments } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import ProgramForm from "@/components/programs/ProgramForm";
import ProgramCard from "@/components/dashboard/ProgramCard";

export default function Programs() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const programIdParam = params.get("id");
  
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    programIdParam ? parseInt(programIdParam) : null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all programs with enrollment counts
  const { data: programs, isLoading, refetch } = useQuery<ProgramWithEnrollments[]>({
    queryKey: ['/api/programs/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/programs/stats');
      return response.json();
    }
  });

  // Handle program search
  const filteredPrograms = searchQuery && programs
    ? programs.filter(program => 
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : programs;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddProgram = () => {
    setShowProgramForm(true);
  };

  const handleCloseProgramForm = () => {
    setShowProgramForm(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Health Programs</h2>
        <button 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors duration-150 flex items-center"
          onClick={handleAddProgram}
        >
          <span className="material-icons mr-1 text-sm">add_circle</span>
          Create Program
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
            placeholder="Search programs by name or code..." 
            className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary border border-neutral-300"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {/* Programs Grid */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold">All Health Programs</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-4 text-neutral-500">
              Loading programs...
            </div>
          ) : filteredPrograms && filteredPrograms.length > 0 ? (
            filteredPrograms.map(program => (
              <div key={program.id} className="relative">
                <ProgramCard program={program} />
                <div className="absolute top-2 right-2">
                  {program.enrollmentCount > 0 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-primary text-white">
                      {program.enrollmentCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-4 text-neutral-500">
              No health programs found
            </div>
          )}
        </div>
      </div>
      
      {/* Program Form */}
      {showProgramForm && (
        <ProgramForm 
          isOpen={showProgramForm}
          onClose={handleCloseProgramForm}
        />
      )}

      {/* Program Details View would go here */}
    </div>
  );
}
