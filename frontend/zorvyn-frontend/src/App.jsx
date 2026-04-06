import { useState } from 'react'
import ReactDom from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Register from './pages/Register';
import './App.css'
import Users from './pages/Users';

function App() {

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
             <Route path="/users" element={<ProtectedRoute>< Users/></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  )
}

export default App;
