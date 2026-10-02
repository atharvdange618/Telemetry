import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createQueryClient } from "./lib/query-client";
import { routes } from "./routes";
// Applies the saved theme to <html> as soon as the app loads.
import "./hooks/useDarkMode";

import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/sonner";

const queryClient = createQueryClient();

const router = createBrowserRouter(routes);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
