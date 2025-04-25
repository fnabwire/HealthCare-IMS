import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Client } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/clients', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [] as Client[];
      const response = await apiRequest('GET', `/api/clients?search=${encodeURIComponent(searchQuery)}`);
      return response.json();
    },
    enabled: searchQuery.length >= 2
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(value.length >= 2);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setSearchQuery("");
  };
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
        setLocation("/auth");
      }
    });
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <button 
          className="md:hidden text-neutral-600"
          onClick={toggleSidebar}
        >
          <span className="material-icons">menu</span>
        </button>
        <div className="flex-1 md:ml-4 flex">
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
              <span className="material-icons text-sm">search</span>
            </span>
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary border border-neutral-300"
            />
            
            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg border border-neutral-200 z-50 max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="p-3 text-center text-neutral-500">Searching...</div>
                ) : searchResults && searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((client: Client) => (
                      <li key={client.id} className="border-b border-neutral-100 last:border-b-0">
                        <Link href={`/clients?id=${client.id}`}>
                          <a 
                            className="block px-4 py-2 hover:bg-neutral-50"
                            onClick={handleResultClick}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-neutral-500 flex justify-between">
                              <span>{client.clientId}</span>
                              <span>{client.phone}</span>
                            </div>
                          </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : searchQuery.length >= 2 ? (
                  <div className="p-3 text-center text-neutral-500">No clients found</div>
                ) : null}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center mr-2">
            {user && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-primary/10 rounded-md p-1 px-2">
                  <UserIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{user.name}</span>
                </div>
              </div>
            )}
          </div>
          
          <button className="p-2 text-neutral-600 hover:text-primary transition-colors duration-150">
            <span className="material-icons">notifications</span>
          </button>
          
          <button className="p-2 text-neutral-600 hover:text-primary transition-colors duration-150">
            <span className="material-icons">help_outline</span>
          </button>
          
          {user && (
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              size="sm" 
              className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-1">
                    <span className="material-icons text-sm">refresh</span>
                  </span>
                  <span>Logging out</span>
                </span>
              ) : (
                <span className="flex items-center">
                  <LogOut className="h-4 w-4 mr-1" />
                  <span>Logout</span>
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
