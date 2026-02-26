import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Header            from './components/Header'
import LandingPage       from './pages/LandingPage'
import PackageBrowsePage from './pages/PackageBrowsePage'
import DietPreferencePage from './pages/DietPreferencePage'
import MenuBuilderPage   from './pages/MenuBuilderPage'
import EventDetailsPage  from './pages/EventDetailsPage'
import PriceSummaryPage  from './pages/PriceSummaryPage'
import PaymentPlanPage   from './pages/PaymentPlanPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import LoginPage         from './pages/LoginPage'
import MyOrdersPage      from './pages/MyOrdersPage'

export default function App() {
  return (
    <BrowserRouter basename="/booking">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#111827',
            fontSize: '0.9rem',
            fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        }}
      />
      <Header />
      <Routes>
        <Route path="/"            element={<LandingPage />} />
        <Route path="/packages"    element={<PackageBrowsePage />} />
        <Route path="/diet"        element={<DietPreferencePage />} />
        <Route path="/menu/:pkgId" element={<MenuBuilderPage />} />
        <Route path="/details"     element={<EventDetailsPage />} />
        <Route path="/summary"     element={<PriceSummaryPage />} />
        <Route path="/payment"     element={<PaymentPlanPage />} />
        <Route path="/success"     element={<BookingSuccessPage />} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/my-orders"   element={<MyOrdersPage />} />
      </Routes>
    </BrowserRouter>
  )
}
