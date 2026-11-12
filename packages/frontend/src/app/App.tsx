import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SnackbarProvider } from "notistack";
import { ErrorBoundary } from "react-error-boundary";
import { RouterProvider } from "react-router/dom";
import { router } from "./router";
import { queryClient } from "@/shared/lib/queryClient";
import { setupApiInterceptors } from "@/shared/api/setupApiInterceptors";
const theme = createTheme({
  // palette, typography, components overrides...
});
setupApiInterceptors(queryClient, router);
export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <div role="alert">
            <p>Coś poszło nie tak:</p>
            <pre>{error instanceof Error ? error.message : String(error)}</pre>
          </div>
        )}
      >
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
            <RouterProvider router={router} />
          </SnackbarProvider>
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
