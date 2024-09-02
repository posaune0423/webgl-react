import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import SwipeControl from "./components/SwipeControl.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./app/index.tsx";
import Test from "./app/test/index.tsx";
import Pixel from "./app/pixel/index.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/test",
    element: <Test />,
  },
  {
    path: "/pixel",
    element: <Pixel />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SwipeControl>
      <RouterProvider router={router} />
    </SwipeControl>
  </StrictMode>
);
