import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Alert, AlertDescription } from "./ui/alert";

export interface StatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  status: {
    type: "success" | "error" | null;
    message: string;
  };
  loadingTitle?: string;
  loadingMessage?: string;
  successTitle?: string;
  errorTitle?: string;
  successAction?: {
    label: string;
    onClick: () => void;
  };
  transactionLink?: string;
  preventCloseWhileLoading?: boolean;
}

export function StatusDialog({
  open,
  onOpenChange,
  loading,
  status,
  loadingTitle = "Processing...",
  loadingMessage = "Please wait while processing...",
  successTitle = "Operation Successful",
  errorTitle = "Operation Failed",
  successAction,
  preventCloseWhileLoading = true,
  transactionLink,
}: StatusDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(open: boolean) => {
        if (!loading || !preventCloseWhileLoading) {
          onOpenChange(open);
        }
      }}
    >
      <AlertDialogContent className="bg-gray-800 border border-gray-700">
        {loading ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-gray-200">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{loadingTitle}</span>
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-gray-300">{loadingMessage}</p>
            </div>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-gray-200">
                {status.type === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
                <span>
                  {status.type === "success" ? successTitle : errorTitle}
                </span>
              </AlertDialogTitle>
            </AlertDialogHeader>

            {status.message && (
              <Alert
                variant={status.type === "success" ? "default" : "destructive"}
                className="bg-gray-900 border border-gray-700"
              >
                <AlertDescription>
                  <pre
                    className={`font-mono text-sm whitespace-pre-wrap break-all ${
                      status.type === "success"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {status.message}
                  </pre>
                </AlertDescription>
              </Alert>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel className="hover:bg-gray-700">
                Close
              </AlertDialogCancel>
              {status.type === "success" &&
                (successAction || transactionLink) && (
                  <AlertDialogAction
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (transactionLink) {
                        window.open(transactionLink, "_blank"); // Open transaction link
                      } else if (successAction) {
                        successAction.onClick(); // Execute success action
                      }
                    }}
                  >
                    {successAction ? successAction.label : "View on Explore"}
                  </AlertDialogAction>
                )}
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
