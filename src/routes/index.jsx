import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/login";
import Template from "../layouts/Template";
import Profile from "../pages/profile";
import Dashboard from "../pages/Dashboard";
import PrivatePage from "../pages/middleware/PrivatePage";
import NotLogin from "../pages/middleware/NotLogin";
import StuffIndex from "../pages/stuffs";
import Inbound from "../pages/inbounds/Inbound";
import AdminRoute from "../pages/middleware/AdminRoute";
import StaffRoute from "../pages/middleware/StaffRoute";
import Lendings from "../pages/lendings";
import LendingData from "../pages/lendings/Data";

export const router = createBrowserRouter([
    // path : url, element : views (bagian yg ditampilkan)
    {
        path: "/",
        element: <Template />,
        children: [
          { path: "/", element: <App />,},
          { path: "/login",
            element: <NotLogin />,
            children: [
              {path: "", element: <Login />},
            ]
          },
          { path: "/dashboard", //midleware udh login
            element: <PrivatePage />,
            //  route pada children, route yang dibatasi aksesnya
            children: [
              { path: "", element: <Dashboard /> },
              { path: "profile", element: <Profile /> },
              {
                path: "admin",
                element: <AdminRoute />, //midleware admin
                children: [
                  { path: "stuffs", element: <StuffIndex /> },
                  { path: "inbounds", element: <Inbound /> },
                ]
              },
              {
                path: "staff",
                element: <StaffRoute />,
                children: [
                  { path: "lending", element: <Lendings />},
                  { path: "lending/data", element: <LendingData />}
                ]
              }
            ]
          },
        ]
    },
]);