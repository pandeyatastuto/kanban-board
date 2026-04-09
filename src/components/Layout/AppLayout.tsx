import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header  from './Header';
import { useUrlFilters } from '../../hooks/useUrlFilters';

interface Props { children: ReactNode }

export default function AppLayout({ children }: Props) {
  useUrlFilters();
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
