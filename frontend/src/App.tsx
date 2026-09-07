import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import TopNotificationBanner from "./components/common/TopNotificationBanner";

/**
 * KisanQueue — Root Application Component
 */
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TopNotificationBanner />
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
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
