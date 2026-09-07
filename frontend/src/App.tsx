import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";

/**
 * KisanQueue — Root Application Component
 *
 * Wraps the app with:
 * - AuthProvider (Firebase auth & session tracking)
 * - TanStack Router (client-side routing)
 * - Sonner Toaster (animated toast notifications)
 */
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: "var(--font-sans)",
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
