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
  programId: z.string().min(1, "Please select a program").refine(val => !isNaN(parseInt(val)), {
    message: "Program ID must be a valid number",
  }),
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
    try {
      setIsSubmitting(true);
      console.log("Submitting form with data:", data);
      // Ensure programId is a valid number
      if (!data.programId || isNaN(parseInt(data.programId))) {
        toast({
          title: "Validation Error",
          description: "Please select a valid program",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      enrollClientMutation.mutate(data);
    } catch (error) {
      console.error("Error in form submission:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to submit enrollment form",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold gradient-text">Enroll Client in Program</DialogTitle>
          <DialogDescription>
            Enroll this client in a health program
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <FormLabel className="text-sm font-medium text-foreground/80">Client</FormLabel>
              <div className="bg-muted/40 p-3 rounded-md mt-1 border border-border/40">
                <p className="font-medium text-foreground">{client.name}</p>
                <p className="text-sm text-muted-foreground">{client.clientId}</p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="programId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground/80">Program</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-border">
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
                  <FormMessage className="text-destructive font-medium text-xs mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enrollDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground/80">Enrollment Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      className="w-full border-border"
                    />
                  </FormControl>
                  <FormMessage className="text-destructive font-medium text-xs mt-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground/80">Enrollment Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any notes about this enrollment..."
                      className="w-full border-border resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive font-medium text-xs mt-1" />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="block text-sm font-medium text-foreground/80 mb-1">
                Initial Assessment
              </FormLabel>
              <div className="p-4 border border-border/40 bg-muted/10 rounded-md space-y-3 shadow-sm">
                <FormField
                  control={form.control}
                  name="symptomSeverity"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-sm text-foreground/80">Symptom Severity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-40 border-border py-1 px-2 text-sm">
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
                      <FormLabel className="text-sm text-foreground/80">Risk Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-40 border-border py-1 px-2 text-sm">
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
                      <FormLabel className="text-sm text-foreground/80">Follow-up Required</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-40 border-border py-1 px-2 text-sm">
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
                className="border-border"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoadingPrograms}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
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
