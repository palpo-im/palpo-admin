import { Toaster } from "@/components/ui/toaster";
import { useToast as useBaseToast } from "@/hooks/use-toast";

// Re-export the Toaster component
export { Toaster };

// Re-export useToast with additional helper methods
export function useToast() {
  const { toast, dismiss, toasts } = useBaseToast();

  return {
    toast,
    dismiss,
    toasts,

    // Helper methods for common toast types
    success: (message: string, title?: string) => {
      toast({
        title: title || "Success",
        description: message,
        variant: "default",
      });
    },

    error: (message: string, title?: string) => {
      toast({
        title: title || "Error",
        description: message,
        variant: "destructive",
      });
    },

    info: (message: string, title?: string) => {
      toast({
        title: title || "Info",
        description: message,
        variant: "default",
      });
    },

    warning: (message: string, title?: string) => {
      toast({
        title: title || "Warning",
        description: message,
        variant: "default",
      });
    },

    // Promise-based toast for async operations
    promise: async <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ): Promise<T> => {
      const { update } = toast({
        title: "Loading",
        description: messages.loading,
      });

      try {
        const result = await promise;
        update({
          id: "",
          title: "Success",
          description: typeof messages.success === "function" ? messages.success(result) : messages.success,
        });
        return result;
      } catch (error) {
        update({
          id: "",
          title: "Error",
          description: typeof messages.error === "function" ? messages.error(error) : messages.error,
          variant: "destructive",
        });
        throw error;
      }
    },
  };
}
