import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = () => (
  <div className="min-h-screen bg-app-bg text-slate-100">
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <main className="px-6 pb-10 pt-6 md:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  </div>
);

export default AppLayout;
