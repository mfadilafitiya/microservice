// src/pages/ProductDetailPage.jsx
// Halaman detail: informasi produk, tombol masuk keranjang, dan ulasan Neo-Brutalism (CSS biasa).
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProductDetail } from '../api/aggregate'
import { addToCart } from '../api/cartApi'
import AsyncView from '../components/AsyncView'
import ReviewForm from '../components/ReviewForm'
import StarRating from '../components/StarRating'
import { useAsync } from '../hooks/useAsync'
import { describeError, formatRupiah } from '../utils/format'

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

export default function ProductDetailPage({ userId }) {
  const { id } = useParams() // nilai :id dari alamat /products/:id
  const { loading, data, error, reload } = useAsync(
    () => getProductDetail(id),
    [id],
  )

  // Jumlah disimpan sebagai teks, supaya kolomnya bisa dikosongkan saat mengetik.
  const [quantity, setQuantity] = useState('1')
  const [cartMessage, setCartMessage] = useState(null)

  async function handleAddToCart() {
    const amount = Math.max(1, Number(quantity) || 1)
    try {
      await addToCart(userId, Number(id), amount)
      setCartMessage({
        type: 'success',
        text: 'Produk berhasil masuk ke keranjang! 🎉',
      })
    } catch (err) {
      setCartMessage({ type: 'error', text: describeError(err) })
    }
  }

  function handleIncrement() {
    setQuantity((prev) => String((Number(prev) || 1) + 1))
  }

  function handleDecrement() {
    setQuantity((prev) => String(Math.max(1, (Number(prev) || 1) - 1)))
  }

  const hasRealImage =
    data?.product?.image &&
    typeof data.product.image === 'string' &&
    data.product.image.length > 200

  return (
    <section>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="btn btn-white">
          &larr; Kembali ke daftar produk
        </Link>
      </div>

      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && (
          <>
            <div className="detail-container">
              {/* Box Gambar / Visual */}
              <div className="detail-image-box">
                {hasRealImage ? (
                  <img
                    src={getImageSrc(data.product.image)}
                    alt={data.product.name}
                  />
                ) : (
                  <span style={{ fontSize: '5.5rem', userSelect: 'none' }}>
                    {getProductIcon(data.product.name)}
                  </span>
                )}
              </div>

              {/* Box Info Produk */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="badge-tag">ID: #{data.product.id}</span>
                  <span
                    className="badge-tag"
                    style={{
                      background:
                        data.product.stock > 0
                          ? 'var(--neo-green)'
                          : 'var(--neo-red)',
                      color: data.product.stock > 0 ? 'var(--ink)' : '#fff',
                    }}
                  >
                    Stok: {data.product.stock}
                  </span>
                </div>

                <h1 style={{ fontSize: '1.85rem', margin: '0 0 0.75rem' }}>
                  {data.product.name}
                </h1>

                <p style={{ fontSize: '1.05rem', lineHeight: 1.6, margin: '0 0 1rem', color: 'var(--muted)' }}>
                  {data.product.description}
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <span className="price" style={{ fontSize: '1.65rem' }}>
                    {formatRupiah(data.product.price)}
                  </span>
                </div>

                {data.reviews && data.reviews.summary && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <StarRating
                      average={data.reviews.summary.average_rating}
                      total={data.reviews.summary.total_reviews}
                    />
                  </div>
                )}

                {/* Stepper Jumlah & Tombol Masuk Keranjang */}
                <div className="actions">
                  <div className="stepper-box">
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={handleDecrement}
                      disabled={Number(quantity) <= 1}
                      aria-label="Kurangi Jumlah"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      aria-label="Jumlah"
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <button
                      type="button"
                      className="stepper-btn"
                      onClick={handleIncrement}
                      aria-label="Tambah Jumlah"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ fontSize: '1.05rem', padding: '0.75rem 1.4rem' }}
                    onClick={handleAddToCart}
                  >
                    🛒 Masukkan ke keranjang
                  </button>
                </div>

                {cartMessage && (
                  <div className={`alert alert-${cartMessage.type}`}>
                    <span>{cartMessage.type === 'success' ? '✅' : '⚠️'}</span>
                    <p style={{ margin: 0 }}>{cartMessage.text}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bagian Ulasan: Tata Letak 2 Kolom (Kiri: Form, Kanan: Feed Review) */}
            <div className="reviews-section-wrapper">
              {/* Kolom 1: Form Tulis Ulasan */}
              <ReviewForm
                productId={Number(id)}
                userId={userId}
                onCreated={reload}
              />

              {/* Kolom 2: Ulasan Pembeli */}
              <div className="review-feed-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0 }}>⭐ Ulasan Pembeli</h2>
                  {data.reviews?.reviews && (
                    <span className="badge-tag" style={{ background: 'var(--neo-yellow)' }}>
                      {data.reviews.reviews.length} Ulasan
                    </span>
                  )}
                </div>

                {data.reviews ? (
                  <>
                    {/* Ringkasan Skor */}
                    {data.reviews.summary && (
                      <div className="rating-summary-banner">
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase' }}>
                            Rata-Rata Kepuasan
                          </span>
                          <div className="rating-big-score">
                            ★ {Number(data.reviews.summary.average_rating).toFixed(1)}
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--muted)' }}>
                              / 5.0
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="badge-tag" style={{ background: '#fff' }}>
                            Total: {data.reviews.summary.total_reviews} ulasan
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Daftar Ulasan */}
                    {data.reviews.reviews && data.reviews.reviews.length > 0 ? (
                      <ul className="reviews-list">
                        {data.reviews.reviews.map((review) => (
                          <li key={review.id} className="review-item">
                            <div className="review-item-header">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="user-badge">
                                  👤 User {review.user_id}
                                </span>
                                <StarRating
                                  average={review.rating}
                                  total={1}
                                  compact
                                />
                              </div>
                              <span className="review-date-badge">
                                🗓️{' '}
                                {new Date(review.created_at).toLocaleDateString(
                                  'id-ID',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  },
                                )}
                              </span>
                            </div>
                            <p className="review-comment-text">
                              {review.comment ? (
                                `“${review.comment}”`
                              ) : (
                                <em className="muted">Tanpa komentar tertulis</em>
                              )}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="empty-box" style={{ padding: '2rem 1rem' }}>
                        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>
                          💬
                        </span>
                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--muted)' }}>
                          Belum ada review. Jadilah orang pertama yang mengulas produk ini!
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="alert alert-error">
                    <span>⚠️</span>
                    <p style={{ margin: 0 }}>Review tidak dapat dimuat saat ini.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </AsyncView>
    </section>
  )
}
