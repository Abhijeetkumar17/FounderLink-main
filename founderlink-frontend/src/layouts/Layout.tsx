import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="h-screen flex flex-col bg-dark-900 overflow-hidden">
    <Navbar />
    <div className="flex flex-1 min-h-0">
      <Sidebar />
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 pt-10">{children}</main>
    </div>
  </div>
);

export default Layout;
