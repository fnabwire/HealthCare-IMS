import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProgramSchema, Program } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const programUpdateSchema = insertProgramSchema.extend({
  requiredInfoItems: z.object({
    testResults: z.boolean().default(false),
    medication: z.boolean().default(false),
    symptoms: z.boolean().default(false),
    followup: z.boolean().default(false),
  })
}).partial(); // Make all fields optional for update

type ProgramUpdateValues = z.infer<typeof programUpdateSchema>;

interface ProgramUpdateFormProps {
  program: Program;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProgramUpdateForm({ program, isOpen, onClose }: ProgramUpdateFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert requiredInfo array to checkbox items
  const getRequiredInfoItems = (requiredInfo: string[] | null) => {
    return {
      testResults: requiredInfo?.includes('testResults') || false,
      medication: requiredInfo?.includes('medication') || false,
      symptoms: requiredInfo?.includes('symptoms') || false,
      followup: requiredInfo?.includes('followup') || false,
    };
  };

  const form = useForm<ProgramUpdateValues>({
    resolver: zodResolver(programUpdateSchema),
    defaultValues: {
      name: program.name,
      code: program.code,
      description: program.description,
      requiredInfo: program.requiredInfo,
      requiredInfoItems: getRequiredInfoItems(program.requiredInfo)
    }
  });

  // Update form values when the program props change
  useEffect(() => {
    form.reset({
      name: program.name,
      code: program.code,
      description: program.description,
      requiredInfo: program.requiredInfo,
      requiredInfoItems: getRequiredInfoItems(program.requiredInfo)
    });
  }, [program, form]);

  const updateProgramMutation = useMutation({
    mutationFn: async (updateData: ProgramUpdateValues) => {
      // Convert checkboxes to array if provided
      let programData: any = { ...updateData };
      
      if (updateData.requiredInfoItems) {
        const requiredInfo = Object.entries(updateData.requiredInfoItems)
          .filter(([_, checked]) => checked)
          .map(([key]) => key);
        
        programData.requiredInfo = requiredInfo;
        delete programData.requiredInfoItems;
      }
      
      // Convert code to uppercase if provided
      if (programData.code) {
        programData.code = programData.code.toUpperCase();
      }
      
      const response = await apiRequest("PUT", `/api/programs/${program.id}`, programData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/programs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/programs/stats'] });
      queryClient.invalidateQueries({ queryKey: [`/api/programs/${program.id}`] });
      toast({
        title: "Success",
        description: "Health program updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update health program",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: ProgramUpdateValues) => {
    setIsSubmitting(true);
    updateProgramMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-800">Update Program</DialogTitle>
          <DialogDescription>
            Modify health program information
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Program Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Tuberculosis (TB)"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Program Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. TB, HIV, MALARIA"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md uppercase"
                    />
                  </FormControl>
                  <p className="text-xs text-neutral-500 mt-1">A short unique code for the program</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the health program..."
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <p className="block text-sm font-medium text-neutral-700 mb-2">Required Information</p>
              <div className="space-y-2 border border-neutral-200 rounded-md p-3">
                <FormField
                  control={form.control}
                  name="requiredInfoItems.testResults"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="test-results-update"
                        />
                      </FormControl>
                      <FormLabel htmlFor="test-results-update" className="text-sm text-neutral-700 cursor-pointer">
                        Test Results
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiredInfoItems.medication"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="medication-update"
                        />
                      </FormControl>
                      <FormLabel htmlFor="medication-update" className="text-sm text-neutral-700 cursor-pointer">
                        Medication History
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiredInfoItems.symptoms"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="symptoms-update"
                        />
                      </FormControl>
                      <FormLabel htmlFor="symptoms-update" className="text-sm text-neutral-700 cursor-pointer">
                        Symptoms Tracking
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requiredInfoItems.followup"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="followup-update"
                        />
                      </FormControl>
                      <FormLabel htmlFor="followup-update" className="text-sm text-neutral-700 cursor-pointer">
                        Follow-up Schedule
                      </FormLabel>
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
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                {isSubmitting ? 'Updating...' : 'Update Program'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}