/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Landing from './pages/Landing';
import CustomerDemo from './pages/CustomerDemo';
import PharmacyDemo from './pages/PharmacyDemo';
import DeliveryDemo from './pages/DeliveryDemo';
import MedSearch from './pages/MedSearch';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Fulfillment from './pages/Fulfillment';
import Pickup from './pages/Pickup';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      {/* @ts-expect-error framer-motion requires key for page transitions */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<MedSearch />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/fulfillment" element={<Fulfillment />} />
        <Route path="/pickup" element={<Pickup />} />
        <Route path="/demo/customer" element={<CustomerDemo />} />
        <Route path="/demo/pharmacy" element={<PharmacyDemo />} />
        <Route path="/demo/delivery" element={<DeliveryDemo />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

