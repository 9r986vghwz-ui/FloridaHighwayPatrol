import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertReportSchema, type InsertReport } from "@shared/schema";
import { z } from "zod";

const reportFormSchema = insertReportSchema.extend({
  incidentDate: z.string().min(1, "Incident date is required"),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

interface ReportFormProps {
  onClose: () => void;
}

export function ReportForm({ onClose }: ReportFormProps) {
  const { toast } = useToast();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: "",
      description: "",
      incidentDate: new Date().toISOString().split("T")[0],
      location: "",
    },
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      return await apiRequest("POST", "/api/reports", data);
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Your incident report has been submitted for review",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/my-reports"] });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReportFormData) => {
    createReportMutation.mutate(data);
  };

  return (
    <div className="border rounded-lg p-6 bg-card">
      <h3 className="text-lg font-semibold mb-4">Submit New Report</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Report Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Traffic violation on I-95"
                    data-testid="input-report-title"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="incidentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      data-testid="input-incident-date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mile marker 183, I-95 North"
                      data-testid="input-location"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide detailed information about the incident..."
                    className="min-h-32 resize-none"
                    data-testid="input-description"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Minimum 20 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createReportMutation.isPending}
              data-testid="button-submit-report"
            >
              {createReportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
