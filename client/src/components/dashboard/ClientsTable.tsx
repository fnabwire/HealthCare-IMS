import { useState } from "react";
import { Client } from "@shared/schema";
import { formatProgramBadge, formatProgramStatusBadge } from "@/lib/utils";
import ClientProfile from "../clients/ClientProfile";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2 } from "lucide-react";

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
  onEditClient?: (client: ClientWithPrograms) => void;
}

export default function ClientsTable({ 
  clients, 
  title, 
  emptyMessage = "No clients found",
  showViewAll = false,
  onViewAllClick,
  onEditClient
}: ClientsTableProps) {
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showClientProfile, setShowClientProfile] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientWithPrograms | null>(null);

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      const response = await apiRequest("DELETE", `/api/clients/${clientId}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      setShowDeleteDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client. The client may have active enrollments.",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
    },
  });

  const handleViewClient = (clientId: number) => {
    setSelectedClientId(clientId);
    setShowClientProfile(true);
  };

  const handleCloseClientProfile = () => {
    setShowClientProfile(false);
  };
  
  const handleEditClient = (client: ClientWithPrograms) => {
    if (onEditClient) {
      onEditClient(client);
    }
  };
  
  const handleDeleteClick = (client: ClientWithPrograms) => {
    setClientToDelete(client);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteConfirm = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id);
    }
  };

  return (
    <>
      <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border/40">
        <div className="px-6 py-4 border-b border-border/60 flex justify-between items-center">
          <h3 className="font-semibold text-primary">{title}</h3>
          {showViewAll && (
            <button 
              className="text-primary hover:text-primary/80 flex items-center text-sm transition-colors"
              onClick={onViewAllClick}
            >
              View All
              <span className="material-icons ml-1 text-sm">arrow_forward</span>
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Client ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Programs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border/30">
              {clients.length > 0 ? (
                clients.map((client) => {
                  const statusBadge = formatProgramStatusBadge(client.status);
                  
                  return (
                    <tr key={client.id} className="hover:bg-muted/30 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {client.clientId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
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
                          <span className="text-muted-foreground text-xs">No programs</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            className="p-1.5 rounded-full text-primary hover:bg-primary/10 transition-colors" 
                            onClick={() => handleViewClient(client.id)}
                            title="View client details"
                          >
                            <span className="material-icons text-sm">visibility</span>
                          </button>
                          <button 
                            className="p-1.5 rounded-full text-secondary hover:bg-secondary/10 transition-colors"
                            onClick={() => handleEditClient(client)}
                            title="Edit client information"
                          >
                            <Pencil size={15} />
                          </button>
                          <button 
                            className="p-1.5 rounded-full text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => handleDeleteClick(client)}
                            title="Delete client"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    <span className="material-icons mb-2 text-3xl">person_off</span>
                    <p>{emptyMessage}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {clients.length > 0 && (
          <div className="px-6 py-3 border-t border-border/40 bg-muted/20 text-xs text-muted-foreground flex items-center">
            <span className="material-icons mr-1 text-sm">people</span>
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              {clientToDelete ? ` "${clientToDelete.name}" (${clientToDelete.clientId})` : ''} 
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteClientMutation.isPending ? 'Deleting...' : 'Delete Client'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
