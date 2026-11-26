// src/components/Navbar.jsx
// Menu navigasi dan pemilih user (CSS biasa & Neo-Brutalism)
import { NavLink } from 'react-router-dom'

const USERS = [1, 2, 3, 4, 5]

export default function Navbar({ userId, onUserChange }) {
  return (
    <header className="navbar">
      <nav>
        <NavLink to="/" className="brand-badge">
          ⚡ TOKO ONLINE
        </NavLink>
        <NavLink to="/" end>
          🛍️ Produk
        </NavLink>
        <NavLink to="/cart">
          🛒 Keranjang
        </NavLink>
      </nav>

      <div className="user-selector-badge">
        <span>👤 User:</span>
        <select
          value={userId}
          aria-label="User ID"
          onChange={(e) => onUserChange(Number(e.target.value))}
        >
          {USERS.map((id) => (
            <option key={id} value={id}>
              User {id}
            </option>
          ))}
        </select>
      </div>
    </header>
  )
}
