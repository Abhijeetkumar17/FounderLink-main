import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../core/guards/ProtectedRoute';
import { routes } from './routeConfig';
import { LoadingSkeleton } from '../shared/components/LoadingSkeleton';

// Explicitly importing domain routes that might be too complex for simple array loops currently
import * as LazyPages from './lazyImports';

const AppRoutes = () => {
  const loadingFallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <LoadingSkeleton rows={5} />
      </div>
    </div>
  );

  return (
    <Suspense fallback={loadingFallback}>
      <Routes>
        {/* Render dynamic top-level config routes */}
        {routes.map(({ path, component: Component, isProtected, roles }) => {
          return isProtected ? (
            <Route key={path} element={<ProtectedRoute allowedRoles={roles} />}>
              <Route path={path} element={<Component />} />
            </Route>
          ) : (
            <Route key={path} path={path} element={<Component />} />
          );
        })}

        {/* Founder Protected Subroutes */}
        <Route path="/founder/*" element={<ProtectedRoute allowedRoles={['ROLE_FOUNDER']} />}>
          <Route path="dashboard" element={<LazyPages.FounderDashboard />} />
          <Route path="startups" element={<LazyPages.MyStartups />} />
          <Route path="startups/create" element={<LazyPages.CreateStartup />} />
          <Route path="startups/:id" element={<LazyPages.StartupDetail />} />
          <Route path="startups/:id/edit" element={<LazyPages.EditStartup />} />
          <Route path="startups/browse" element={<LazyPages.BrowseStartups />} />
          <Route path="team/:startupId" element={<LazyPages.TeamManagement />} />
          <Route path="investments" element={<LazyPages.FounderInvestments />} />
          <Route path="payments" element={<LazyPages.ReceivedPayments />} />
        </Route>

        {/* Investor Protected Subroutes */}
        <Route path="/investor/*" element={<ProtectedRoute allowedRoles={['ROLE_INVESTOR']} />}>
          <Route path="dashboard" element={<LazyPages.InvestorDashboard />} />
          <Route path="startups" element={<LazyPages.BrowseStartups />} />
          <Route path="startups/:id" element={<LazyPages.StartupDetail />} />
          <Route path="investments" element={<LazyPages.MyInvestments />} />
          <Route path="payments" element={<LazyPages.PaymentHistory />} />
        </Route>

        {/* Co-Founder Protected Subroutes */}
        <Route path="/cofounder/*" element={<ProtectedRoute allowedRoles={['ROLE_COFOUNDER']} />}>
          <Route path="dashboard" element={<LazyPages.CoFounderDashboard />} />
          <Route path="startups" element={<LazyPages.BrowseStartups />} />
          <Route path="startups/:id" element={<LazyPages.StartupDetail />} />
          <Route path="invitations" element={<LazyPages.MyInvitations />} />
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
