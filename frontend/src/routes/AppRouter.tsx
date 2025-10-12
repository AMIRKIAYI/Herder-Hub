// src/routes/AppRouter.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../pages/Home/HomePage';
import Marketplace from '../pages/Listings/MarketPlace';
import ProductView from '../pages/Listings/ProductView';
import SellLivestockPage from '../pages/Sell/SellLivestockPage';
import CartPage from '../pages/Listings/CartPage';
import HelpCenter from '../pages/Help/HelpCenter';
import AccountPage from '../pages/Account/AccountPage';
import ConnectsPage from '../pages/Account/ConnectsPage';


function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
       
        <Route path="/marketplace" element={
          <Layout>
            <Marketplace />
          </Layout>
        } />
        
        <Route path="/product/:id" element={
          <Layout>
            <ProductView />
          </Layout>
        } />

     
<Route path="/sell" element={
  <Layout>
    <SellLivestockPage />
  </Layout>
} />
        <Route path="/cart" element={
          <Layout>
            <CartPage />
          </Layout>
        } />
        <Route path="/help-center" element={
          <Layout>
            <HelpCenter />
          </Layout>
        } />
        <Route path="/account" element={
          <Layout>
            <AccountPage />
          </Layout>
        } />
        <Route path="/connects" element={
          <Layout>
            <ConnectsPage />
          </Layout>
        } />


        
        {/* Add more routes as needed */}
        {/* Example: */}
        {/* <Route path="/about" element={<AboutPage />} /> */}
        
        {/* Add more routes following the same pattern */}
      </Routes>
    </Router>
  );
}

export default AppRouter;