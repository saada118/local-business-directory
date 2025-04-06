import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import PromotionBanner from './components/PromotionBanner';
import HomePage from './pages/HomePage';
import AddShopPage from './pages/AddShopPage';
import BusinessDetailsPage from './pages/BusinessDetailsPage';
import LoginPage from './pages/LoginPage';
import PromotionsPage from './pages/PromotionsPage';
import SignUpPage from './pages/SignUpPage';
import AdvertisePage from './pages/AdvertisePage';
import ProfilePage from './pages/ProfilePage';
import './components/PromotionBanner.css';
import OTPLoginPage from './pages/OTPLoginPage';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <Router>
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        
      />
      <PromotionBanner />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              searchTerm={searchTerm}
              
            />
          }
        />
        <Route path="/add-shop" element={<AddShopPage />} />
        <Route path="/shop/:id" element={<BusinessDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/advertise" element={<AdvertisePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/otp-login" element={<OTPLoginPage />} />
        <Route path="/business/:id" element={<BusinessDetailsPage />} />
        <Route
  path="/"
  element={
    <HomePage
      searchTerm={searchTerm}
    />
  }
/>
      </Routes>
    </Router>
  );
}

export default App;
