import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Dashboard from './components/dashboard/dashboard.jsx';
import App from './App.jsx'
import './index.css'
import Layout from './components/layout/layout.jsx';
import Document from './components/document/document.jsx';
import Tickets from './components/tickets/tickets.jsx';
import Teams from './components/teams/teams.jsx';
import Members from './components/members/members.jsx';
import Projects from './components/projects/projects.jsx';
import Projectdetail from './components/projectdetail/projectdetail.jsx';
import Addvul from './components/projectdetail/addvul.jsx';
import Detaildesc from './components/projectdetail/detaildesc.jsx';
import Clients from './components/clients/clients.jsx';
import { Toaster } from 'react-hot-toast';
import Login from './components/auth/Login.jsx';
import Database from './components/Database/database.jsx';




const router = createBrowserRouter([
  {
    path: "/",
    element:<Layout/>,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/document",
        element: <Document />,
      },
      {
        path: "/tickets",
        element: <Tickets />,
      },
      {
        path: "/clients",
        element: <Clients />,
      },
      {
        path: "/clients/:title/:id",
        element: <Projects />,
      },
      {
        path:"/projects/:id",
        element:<Projectdetail/>
      },
      {
        path:"/projects/:id/add",
        element:<Addvul/>
      },
      {
        path:"/projects/desc/:id",
        element:<Detaildesc/>
      },
      {
        path:"/members",
        element:<Members/>
      },
      {
        path:"/database",
        element:<Database/>
      }
    ]  
  },
  {
    path: "/auth-signin",
    element: <Login/>
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path:"/detail/:id",
    element:<Detaildesc/>
  },
])
/*
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Dashboard />} />
      <Route path="Dashboard" element={<Dashboard />} />
      <Route path="Document" element={<Document />} />
      <Route path="Tickets" element={<Tickets />} />
      <Route path="Clients" element={<Clients />} />
      <Route path="Clients/:title/:id" element={<Projects />} />
      <Route path="Projects" element={<Projects />} />
      <Route path="Projects/:id" element={<Projectdetail />} />
      <Route path="Projects/:id/add" element={<Addvul />} />
      <Route path="Projects/desc/:id" element={<Detaildesc />} />
    </Route>
  )
*/
 
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster/>
  </StrictMode>
);
