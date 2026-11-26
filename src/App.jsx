// src/App.jsx
// Kerangka aplikasi murni React + CSS biasa: navigasi, pemilih user, dan router.
import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import CartPage from './pages/CartPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ProductListPage from './pages/ProductListPage'

export default function App() {
  const [userId, setUserId] = useState(() =>
    Number(localStorage.getItem('userId')) || 1,
  )

  function changeUser(value) {
    setUserId(value)
    localStorage.setItem('userId', String(value))
  }

  return (
    <>
      <Navbar userId={userId} onUserChange={changeUser} />
      <main className="container">
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route
            path="/products/:id"
            element={<ProductDetailPage userId={userId} />}
          />
          <Route path="/cart" element={<CartPage userId={userId} />} />
          <Route
            path="*"
            element={
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2>404 - Halaman Tidak Ditemukan</h2>
                <p className="muted">Halaman yang kamu tuju tidak tersedia.</p>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  )
}
