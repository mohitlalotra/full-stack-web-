import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(...allowedRoles)) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Access Restricted</h2>
        <p className="text-slate-400 max-w-md mt-2 text-sm">
          Your account role <span className="font-semibold text-amber-400">[{user.role}]</span> does not have sufficient authorization to access this module.
        </p>
        <p className="text-slate-500 text-xs mt-4">
          Required Role: {allowedRoles.join(' or ')} | Contact system administrator for permission updates.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
