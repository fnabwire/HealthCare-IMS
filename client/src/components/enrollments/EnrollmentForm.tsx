import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Client, insertEnrollmentSchema } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const enrollmentFormSchema = z.object({
  programId: z.string(),
  enrollDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in the format YYYY-MM-DD",
  }),
  notes: z.string().optional(),
  symptomSeverity: z.enum(["mild", "moderate", "severe"]),
  riskLevel: z.enum(["low", "medium", "high"]),
  followUpRequired: z.enum(["yes", "no"]),
});

type EnrollmentFormValues = z.infer<typeof enrollmentFormSchema>;

interface EnrollmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onSuccess: () => void;
}

export default function EnrollmentForm({ 
  isOpen, 
  onClose, 
  client, 
  onSuccess 
}: EnrollmentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available programs
  const { data: programs, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['/api/programs'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/programs');
      return response.json();
    }
  });

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentFormSchema),
    defaultValues: {
      programId: "",
      enrollDate: new Date().toISOString().split('T')[0],
      notes: "",
      symptomSeverity: "mild",
      riskLevel: "low",
      followUpRequired: "no",
    }
  });

  const enrollClientMutation = useMutation({
    mutationFn: async (data: EnrollmentFormValues) => {
      const enrollmentData = {
        clientId: client.id,
        programId: parseInt(data.programId),
        enrollDate: new Date(data.enrollDate),
        notes: data.notes || undefined,
        symptomSeverity: data.symptomSeverity,
        riskLevel: data.riskLevel,
        followUpRequired: data.followUpRequired === "yes",
      };
      
      const response = await apiRequest("POST", "/api/enrollments", enrollmentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client enrolled in program successfully",
      });
      form.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll client in program",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: EnrollmentFormValues) => {
    setIsSubmitting(true);
    enrollClientMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-800">Enroll Client in Program</DialogTitle>
          <DialogDescription>
            Enroll this client in a health program
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormLabel className="text-sm font-medium text-neutral-700">Client</FormLabel>
              <div className="bg-neutral-100 p-3 rounded-md mt-1">
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-neutral-500">{client.clientId}</p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Program</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full px-3 py-2 border border-neutral-300 rounded-md">
                        <SelectValue placeholder="Select Program" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingPrograms ? (
                        <SelectItem value="loading" disabled>Loading programs...</SelectItem>
                      ) : programs && programs.length > 0 ? (
                        programs.map((program: any) => (
                          <SelectItem key={program.id} value={program.id.toString()}>
                            {program.name} ({program.code})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No programs available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enrollDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Enrollment Date</FormLabel>
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Enrollment Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any notes about this enrollment..."
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="block text-sm font-medium text-neutral-700 mb-1">
                Initial Assessment
              </FormLabel>
              <div className="p-3 border border-neutral-200 rounded-md space-y-3">
                <FormField
                  control={form.control}
                  name="symptomSeverity"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-sm">Symptom Severity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-40 border border-neutral-300 rounded-md py-1 px-2 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riskLevel"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-sm">Risk Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-40 border border-neutral-300 rounded-md py-1 px-2 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="followUpRequired"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-sm">Follow-up Required</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-40 border border-neutral-300 rounded-md py-1 px-2 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                disabled={isSubmitting || isLoadingPrograms}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                {isSubmitting ? 'Enrolling...' : 'Enroll Client'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
