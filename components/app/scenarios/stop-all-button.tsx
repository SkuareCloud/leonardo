"use client";

import { Button } from "@/components/ui/button";
import { CircleStop } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getAllCharactersCharactersGet } from "@/lib/api/operator/sdk.gen";
import { client as operatorClient } from "@lib/api/operator/client.gen";
export function StopAllButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleStopAll = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/operator/stop-all", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        // Wait for characters to be empty with 1 minute timeout
        let charactersEmpty = false;
        const startTime = Date.now();
        const TIMEOUT = 60000; // 1 minute in milliseconds
        
        while (!charactersEmpty) {
          const response = await getAllCharactersCharactersGet({
            client: operatorClient,
          });
          console.log("response", response);
          if (response.data && response.data.length === 0) {
            charactersEmpty = true;
          } else {
            // Check if timeout reached
            if (Date.now() - startTime > TIMEOUT) {
              throw new Error("Timeout waiting for characters to stop");
            }
            // Wait for 1 second before checking again
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        toast.success("All profiles stopped", {
          description: "All running profiles have been successfully stopped.",
        });
      } else {
        throw new Error(data.error || "Failed to stop characters");
      }
    } catch (error) {
      toast.error("Failed to stop profiles", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while stopping profiles",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
          <CircleStop className="mr-2 h-4 w-4" />
          Stop All
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stop All Characters</DialogTitle>
          <DialogDescription>
            Are you sure you want to stop all running characters? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
            onClick={handleStopAll}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <CircleStop className="mr-2 h-4 w-4" />
                STOP ALL
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
