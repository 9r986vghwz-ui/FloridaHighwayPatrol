import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertStrikeSchema } from "@shared/schema";
import { z } from "zod";
import type { User } from "@shared/schema";
import { AlertTriangle } from "lucide-react";

const strikeFormSchema = insertStrikeSchema.extend({
  userId: z.string().min(1, "Please select a trooper"),
});

type StrikeFormData = z.infer<typeof strikeFormSchema>;

export function IssueStrikeForm() {
  const { toast } = useToast();

  const { data: troopers, isLoading: troopersLoading } = useQuery<User[]>({
    queryKey: ["/api/supervisor/troopers"],
  });

  const form = useForm<StrikeFormData>({
    resolver: zodResolver(strikeFormSchema),
    defaultValues: {
      userId: "",
      reason: "",
      description: "",
    },
  });

  const issueStrikeMutation = useMutation({
    mutationFn: async (data: StrikeFormData) => {
      return await apiRequest("POST", "/api/supervisor/issue-strike", data);
    },
    onSuccess: () => {
      toast({
        title: "Strike issued",
        description: "The disciplinary strike has been issued to the trooper",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/supervisor/stats"] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to issue strike",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StrikeFormData) => {
    issueStrikeMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Strikes are serious disciplinary actions. Please ensure the reason and description are accurate and documented properly.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Trooper</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-trooper">
                      <SelectValue placeholder="Choose a trooper" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {troopersLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading troopers...
                      </SelectItem>
                    ) : !troopers || troopers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No approved troopers available
                      </SelectItem>
                    ) : (
                      troopers.map((trooper) => (
                        <SelectItem key={trooper.id} value={trooper.id}>
                          {trooper.name} - Badge: {trooper.badgeNumber}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Only approved troopers are shown
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason for Strike</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Policy violation, Misconduct, Insubordination"
                    data-testid="input-strike-reason"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Brief summary of the violation (minimum 5 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detailed Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide a detailed description of the incident that led to this strike..."
                    className="min-h-32 resize-none"
                    data-testid="input-strike-description"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Include all relevant details and context (minimum 10 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              data-testid="button-reset-strike-form"
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={issueStrikeMutation.isPending}
              data-testid="button-issue-strike"
            >
              {issueStrikeMutation.isPending ? "Issuing Strike..." : "Issue Strike"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
