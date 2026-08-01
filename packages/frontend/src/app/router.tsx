import { createBrowserRouter } from "react-router";
import LoginPage from "../features/auth/LoginPage";
import LoginPageV2 from "../features/auth/LoginPageV2";
const example = [
  {
    path: "/ex2",
    element: <div>kappa1</div>,
  },
  {
    path: "/ex3",
    element: <div>kappa2</div>,
  },
  {
    path: "/ex4",
    element: <div>kappa3</div>,
  },
];

export const router = createBrowserRouter([
  ...example,
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/login2",
    element: <LoginPageV2 />,
  },
]);
