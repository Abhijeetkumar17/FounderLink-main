import * as LazyPages from './lazyImports';

export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<any>;
  roles?: string[];
  isProtected?: boolean;
}

export const routes: RouteConfig[] = [
  // Public Routes
  { path: '/', component: LazyPages.LandingPage, isProtected: false },
  { path: '/login', component: LazyPages.Login, isProtected: false },
  { path: '/register', component: LazyPages.Register, isProtected: false },
  
  // Cross-Role Protected Routes
  { path: '/messages', component: LazyPages.Messages, isProtected: true, roles: ['ROLE_FOUNDER', 'ROLE_INVESTOR', 'ROLE_COFOUNDER'] },
  { path: '/messages/:conversationId', component: LazyPages.Chat, isProtected: true, roles: ['ROLE_FOUNDER', 'ROLE_INVESTOR', 'ROLE_COFOUNDER'] },
  { path: '/notifications', component: LazyPages.Notifications, isProtected: true, roles: ['ROLE_FOUNDER', 'ROLE_INVESTOR', 'ROLE_COFOUNDER'] },
  { path: '/profile', component: LazyPages.Profile, isProtected: true, roles: ['ROLE_FOUNDER', 'ROLE_INVESTOR', 'ROLE_COFOUNDER', 'ROLE_ADMIN'] },

  // Admin Routes
  { path: '/admin/dashboard', component: LazyPages.AdminDashboard, isProtected: true, roles: ['ROLE_ADMIN'] },

  // Fallback Routes
  { path: '/unauthorized', component: LazyPages.Unauthorized, isProtected: false },
  { path: '/404', component: LazyPages.NotFound, isProtected: false }
];
