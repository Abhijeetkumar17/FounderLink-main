import { lazy } from 'react';

// Domain: Landing
export const LandingPage = lazy(() => import('../features/landing/pages/LandingPage'));

// Domain: Auth
export const Login = lazy(() => import('../features/auth/pages/Login'));
export const Register = lazy(() => import('../features/auth/pages/Register'));

// Domain: Dashboard
export const AdminDashboard = lazy(() => import('../features/dashboard/admin/AdminDashboard'));
export const FounderDashboard = lazy(() => import('../features/startups/pages/FounderDashboard'));
export const InvestorDashboard = lazy(() => import('../features/investments/pages/InvestorDashboard'));
export const CoFounderDashboard = lazy(() => import('../features/teams/pages/CoFounderDashboard'));

// Domain: Startups & Investments
export const BrowseStartups = lazy(() => import('../features/investments/pages/BrowseStartups'));
export const StartupDetail = lazy(() => import('../features/investments/pages/StartupDetail'));
export const MyStartups = lazy(() => import('../features/startups/pages/MyStartups'));
export const CreateStartup = lazy(() => import('../features/startups/pages/CreateStartup'));
export const EditStartup = lazy(() => import('../features/startups/pages/EditStartup'));
export const TeamManagement = lazy(() => import('../features/startups/pages/TeamManagement'));
export const MyInvestments = lazy(() => import('../features/investments/pages/MyInvestments'));
export const FounderInvestments = lazy(() => import('../features/investments/pages/FounderInvestments'));

// Domain: Payments
export const ReceivedPayments = lazy(() => import('../features/payments/pages/ReceivedPayments'));
export const PaymentHistory = lazy(() => import('../features/payments/pages/PaymentHistory'));

// Domain: Common / Messaging
export const Messages = lazy(() => import('../features/dashboard/common/Messages'));
export const Chat = lazy(() => import('../features/dashboard/common/Chat'));
export const Notifications = lazy(() => import('../features/dashboard/common/Notifications'));
export const Profile = lazy(() => import('../features/dashboard/common/Profile'));
export const MyInvitations = lazy(() => import('../features/teams/pages/MyInvitations'));

// Fallbacks
export const Unauthorized = lazy(() => import('../features/dashboard/common/Unauthorized'));
export const NotFound = lazy(() => import('../features/dashboard/common/NotFound'));
