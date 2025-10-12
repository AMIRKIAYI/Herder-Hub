// src/components/layout/Layout.tsx
import type { ReactNode } from 'react';  // Add this import
import TopBar from './Topbar';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer/>
    </div>
  );
};

export default Layout;