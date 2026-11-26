// src/components/ProductCard.jsx
// Satu kartu produk di halaman daftar dengan CSS biasa & gaya Neo-Brutalism.
import { Link } from 'react-router-dom'
import { formatRupiah } from '../utils/format'
import StarRating from './StarRating'

function getProductIcon(name = '') {
  const lower = name.toLowerCase()
  if (lower.includes('headset')) return '🎧'
  if (lower.includes('keyboard')) return '⌨️'
  if (lower.includes('mouse')) return '🖱️'
  if (lower.includes('speaker')) return '🔊'
  if (lower.includes('stand')) return '💻'
  if (lower.includes('monitor')) return '🖥️'
  if (lower.includes('webcam')) return '📷'
  if (lower.includes('usb') || lower.includes('hub')) return '🔌'
  return '📦'
}

function getImageSrc(image) {
  if (!image) return ''
  if (image.startsWith('data:')) return image
  if (image.startsWith('iVBORw')) return `data:image/png;base64,${image}`
  if (image.startsWith('/9j/')) return `data:image/jpeg;base64,${image}`
  if (image.startsWith('UklGR')) return `data:image/webp;base64,${image}`
  return `data:image/jpeg;base64,${image}`
}

export default function ProductCard({ product }) {
  const { id, name, price, stock, rating, image } = product
  const hasRealImage = image && typeof image === 'string' && image.length > 200

  return (
    <article className="card">
      <div className="card-image-box">
        {hasRealImage ? (
          <img
            src={getImageSrc(image)}
            alt={name}
          />
        ) : (
          <span className="card-image-fallback">{getProductIcon(name)}</span>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge-tag">Produk #{id}</span>
          <span
            className="badge-tag"
            style={{
              background: stock > 0 ? 'var(--neo-green)' : 'var(--neo-red)',
              color: stock > 0 ? 'var(--ink)' : '#fff',
            }}
          >
            {stock > 0 ? `Stok: ${stock}` : 'Habis'}
          </span>
        </div>

        <h3>
          <Link to={`/products/${id}`}>{name}</Link>
        </h3>

        <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
          <p className="price">{formatRupiah(price)}</p>

          <div style={{ margin: '0.5rem 0 1rem' }}>
            {rating ? (
              <StarRating
                average={rating.average_rating}
                total={rating.total_reviews}
              />
            ) : (
              <span className="stars" style={{ background: '#f4f4f5', color: 'var(--muted)' }}>
                Belum ada rating
              </span>
            )}
          </div>

          <Link
            to={`/products/${id}`}
            className="btn btn-primary"
            style={{ width: '100%', boxSizing: 'border-box' }}
          >
            Lihat Detail →
          </Link>
        </div>
      </div>
    </article>
  )
}
