import { isRouteErrorResponse, useRouteError } from "react-router";

export function RouteError() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Nieznany błąd";

  return (
    <div role="alert">
      <h1>Błąd</h1>
      <p>{message}</p>
    </div>
  );
}
