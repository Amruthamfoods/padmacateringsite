import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './page-styles.css'

import LandingPage from './pages/LandingPage'
import BookingDetailsPage from './pages/BookingDetailsPage'
import BookingSuccessPage from './pages/BookingSuccessPage'
import PackageBrowsePage from './pages/preset/PackageBrowsePage'
import PackageBuilderPage from './pages/preset/PackageBuilderPage'
import PresetSummaryPage from './pages/preset/PresetSummaryPage'
import CustomBuilderPage from './pages/custom/CustomBuilderPage'
import QuoteFormPage from './pages/custom/QuoteFormPage'

export default function App() {
  return (
    <BrowserRouter basename="/">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/details" element={<BookingDetailsPage />} />
        <Route path="/preset/packages" element={<PackageBrowsePage />} />
        <Route path="/preset/builder/:pkgId" element={<PackageBuilderPage />} />
        <Route path="/preset/summary" element={<PresetSummaryPage />} />
        <Route path="/custom/builder" element={<CustomBuilderPage />} />
        <Route path="/custom/quote" element={<QuoteFormPage />} />
        <Route path="/success" element={<BookingSuccessPage />} />
      </Routes>
    </BrowserRouter>
  )
}
