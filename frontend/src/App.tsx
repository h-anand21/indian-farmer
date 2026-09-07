import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { Toaster } from "sonner";

/**
 * KisanQueue — Root Application Component
 *
 * Wraps the app with:
 * - TanStack Router (client-side routing)
 * - Sonner Toaster (animated toast notifications)
 *
 * Additional providers (Auth, Theme) will be added in Phase 2.
 */
function App() {
  return (
    <>
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
    </>
  );
}

export default App;
