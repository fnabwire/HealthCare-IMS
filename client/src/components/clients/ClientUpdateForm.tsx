import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertClientSchema, Client } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const clientUpdateSchema = insertClientSchema.extend({
  clientId: z.string().min(1, { message: "Client ID is required" }),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date of birth must be in the format YYYY-MM-DD",
  }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }).optional().or(z.literal('')),
  status: z.enum(["active", "inactive"], {
    required_error: "Please select a status",
  }).default("active"),
}).partial(); // Make all fields optional for update

type ClientUpdateFormValues = z.infer<typeof clientUpdateSchema>;

interface ClientUpdateFormProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientUpdateForm({ client, isOpen, onClose }: ClientUpdateFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClientUpdateFormValues>({
    resolver: zodResolver(clientUpdateSchema),
    defaultValues: {
      name: client.name,
      clientId: client.clientId,
      dob: client.dob ? new Date(client.dob).toISOString().substring(0, 10) : "",
      gender: client.gender as "male" | "female" | "other",
      phone: client.phone,
      address: client.address,
      email: client.email || "",
      emergencyContact: client.emergencyContact,
      status: client.status as "active" | "inactive" || "active",
    }
  });

  // Update form values when the client props change
  useEffect(() => {
    form.reset({
      name: client.name,
      clientId: client.clientId,
      dob: client.dob ? new Date(client.dob).toISOString().substring(0, 10) : "",
      gender: client.gender as "male" | "female" | "other",
      phone: client.phone,
      address: client.address,
      email: client.email || "",
      emergencyContact: client.emergencyContact,
      status: client.status as "active" | "inactive" || "active",
    });
  }, [client, form]);

  const updateClientMutation = useMutation({
    mutationFn: async (updateData: ClientUpdateFormValues) => {
      const response = await apiRequest("PUT", `/api/clients/${client.id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${client.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${client.id}/details`] });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: ClientUpdateFormValues) => {
    setIsSubmitting(true);
    updateClientMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-800">Update Client</DialogTitle>
          <DialogDescription>
            Edit client information
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Client ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="HIS-YYYY-XXX"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      readOnly // Client ID should not be editable
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full px-3 py-2 border border-neutral-300 rounded-md">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="+254-712-345-678"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="123 Main St, Nairobi"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="john.doe@example.com"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Emergency Contact</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Jane Doe: +254-723-456-789"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full px-3 py-2 border border-neutral-300 rounded-md">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                {isSubmitting ? 'Updating...' : 'Update Client'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}