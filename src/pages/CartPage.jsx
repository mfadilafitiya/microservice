// src/pages/CartPage.jsx
// Halaman keranjang belanja dengan CSS biasa (Split View & Neo-Brutalism).
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getCartDetail } from '../api/aggregate'
import { clearCart, removeCartItem, updateCartItem } from '../api/cartApi'
import { createOrder, payOrder } from '../api/orderApi'
import AsyncView from '../components/AsyncView'
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

export default function CartPage({ userId }) {
  const { loading, data, error, reload } = useAsync(
    () => getCartDetail(userId),
    [userId],
  )
  const [actionError, setActionError] = useState(null)
  const [checkoutNotice, setCheckoutNotice] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Menjalankan aksi ke cart-service, lalu memuat ulang keranjang kalau berhasil.
  async function run(action) {
    setActionError(null)
    setCheckoutNotice(null)
    try {
      await action()
      reload()
    } catch (err) {
      setActionError(err)
    }
  }

  async function handleCheckout() {
    setIsProcessingOrder(true)
    setActionError(null)
    setCheckoutNotice(null)
    try {
      const res = await createOrder(userId)
      const order = res?.data || res
      setOrderData(order)
      setCheckoutNotice(
        `Pesanan #${order.id} berhasil dibuat! Total: ${formatRupiah(order.total_amount || data?.totalPrice || 0)}. Silakan lakukan pembayaran.`,
      )
      reload()
    } catch (err) {
      setActionError(err)
    } finally {
      setIsProcessingOrder(false)
    }
  }

  async function handlePayOrder() {
    if (!orderData) return
    setIsProcessingPayment(true)
    setActionError(null)
    try {
      const res = await payOrder(orderData.id)
      const updatedOrder = res?.data || res
      setOrderData(updatedOrder)
      setCheckoutNotice(
        `Pembayaran untuk Pesanan #${updatedOrder.id} BERHASIL diverifikasi! Status: LUNAS.`,
      )
    } catch (err) {
      setActionError(err)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const totalQuantity =
    data?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>🛒 KERANJANG BELANJA</h1>
          <p
            style={{
              margin: '0.5rem 0 0',
              fontWeight: 700,
              color: 'var(--muted)',
            }}
          >
            Keranjang aktif milik{' '}
            <span
              className="badge-tag"
              style={{ background: 'var(--neo-yellow)' }}
            >
              User {userId}
            </span>
          </p>
        </div>

        <Link to="/" className="btn btn-white">
          ← Lanjut Belanja
        </Link>
      </div>

      {actionError && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <p style={{ margin: 0 }}>{describeError(actionError)}</p>
        </div>
      )}

      {checkoutNotice && (
        <div className="alert alert-success">
          <span>⚡</span>
          <p style={{ margin: 0 }}>{checkoutNotice}</p>
        </div>
      )}

      {orderData && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            background: 'var(--card-bg)',
            border: 'var(--border-w) solid var(--ink)',
            boxShadow: 'var(--shadow-md)',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <h3 style={{ margin: 0 }}>📦 Detail Pesanan #{orderData.id}</h3>
            <span
              className="badge-tag"
              style={{
                background:
                  orderData.status === 'paid'
                    ? 'var(--neo-green)'
                    : 'var(--neo-yellow)',
                fontWeight: 800,
              }}
            >
              STATUS: {String(orderData.status || 'pending').toUpperCase()}
            </span>
          </div>

          <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>
            Total Pembayaran:{' '}
            <strong>{formatRupiah(orderData.total_amount || 0)}</strong>
          </p>

          {orderData.status !== 'paid' ? (
            <button
              type="button"
              className="btn btn-green"
              style={{ marginTop: '0.5rem' }}
              onClick={handlePayOrder}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment
                ? 'Memproses Pembayaran...'
                : '💳 Bayar Sekarang (Simulasi Payment)'}
            </button>
          ) : (
            <p
              style={{
                margin: '0.5rem 0 0',
                color: '#166534',
                fontWeight: 800,
              }}
            >
              ✅ Pesanan ini telah LUNAS dibayar melalui Gateway.
            </p>
          )}
        </div>
      )}

      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && data.items.length === 0 && (
          <div className="empty-box">
            <span className="empty-icon">🛒</span>
            <h2 style={{ margin: '0 0 0.5rem' }}>Wah, Keranjangmu Masih Kosong!</h2>
            <p
              style={{
                margin: '0 0 1.5rem',
                color: 'var(--muted)',
                fontWeight: 600,
              }}
            >
              Belum ada produk yang kamu pilih. Ayo temukan barang impianmu di katalog!
            </p>
            <Link to="/" className="btn btn-primary" style={{ fontSize: '1.1rem' }}>
              🛍️ Mulai Belanja Sekarang
            </Link>
          </div>
        )}

        {data && data.items.length > 0 && (
          <div className="cart-layout">
            {/* Kolom Kiri: Daftar Item Keranjang */}
            <div className="cart-items-wrapper">
              {data.items.map((item) => (
                <div key={item.id} className="cart-item-card">
                  {/* Info Produk */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        background: '#ffffff',
                        border: '2px solid var(--ink)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        flexShrink: 0,
                        padding: '0.25rem',
                        overflow: 'hidden',
                      }}
                    >
                      {item.product?.image && item.product.image.length > 200 ? (
                        <img
                          src={getImageSrc(item.product.image)}
                          alt={item.product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        item.product ? getProductIcon(item.product.name) : '❓'
                      )}
                    </div>

                    <div>
                      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>
                        {item.product ? (
                          <Link to={`/products/${item.product_id}`}>
                            {item.product.name}
                          </Link>
                        ) : (
                          <em style={{ color: 'var(--neo-red)' }}>
                            Produk tidak tersedia
                          </em>
                        )}
                      </h3>

                      <span
                        className="badge-tag"
                        style={{
                          background: 'var(--card-alt)',
                          fontSize: '0.85rem',
                          marginRight: '0.5rem',
                        }}
                      >
                        {item.product
                          ? formatRupiah(item.product.price)
                          : '-'}
                      </span>

                      <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                        Subtotal:{' '}
                        <strong style={{ color: 'var(--ink)' }}>
                          {item.product
                            ? formatRupiah(
                                Number(item.product.price) * item.quantity,
                              )
                            : '-'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Kontrol Kuantitas & Hapus */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <div className="stepper-box">
                      <button
                        type="button"
                        className="stepper-btn"
                        aria-label="Kurangi"
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          run(() =>
                            updateCartItem(item.id, item.quantity - 1),
                          )
                        }
                      >
                        -
                      </button>
                      <span className="qty">{item.quantity}</span>
                      <button
                        type="button"
                        className="stepper-btn"
                        aria-label="Tambah"
                        onClick={() =>
                          run(() =>
                            updateCartItem(item.id, item.quantity + 1),
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-danger"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                      onClick={() => run(() => removeCartItem(item.id))}
                      title="Hapus barang ini"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Kolom Kanan: Ringkasan Belanja (Sticky Order Summary) */}
            <div className="cart-summary-card">
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.35rem' }}>
                📋 Ringkasan Pesanan
              </h2>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '2px dashed var(--ink)',
                  fontWeight: 700,
                }}
              >
                <span>Total Jenis Produk:</span>
                <span>{data.items.length} item</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '2px dashed var(--ink)',
                  fontWeight: 700,
                }}
              >
                <span>Total Jumlah Barang:</span>
                <span>{totalQuantity} pcs</span>
              </div>

              {/* Total Bayar Kotak Kuning Neo-Brutalist */}
              <div className="cart-total-box">
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Total Tagihan:
                </span>
                <span className="total-number">
                  {formatRupiah(data.totalPrice)}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-green"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1.1rem', marginBottom: '0.75rem' }}
                onClick={handleCheckout}
                disabled={isProcessingOrder}
              >
                {isProcessingOrder ? 'Sedang Memproses...' : '⚡ Checkout Sekarang'}
              </button>

              <button
                type="button"
                className="btn btn-white"
                style={{ width: '100%', borderColor: 'var(--neo-red)', color: 'var(--neo-red)' }}
                onClick={() => run(() => clearCart(userId))}
              >
                🗑️ Kosongkan Keranjang
              </button>
            </div>
          </div>
        )}
      </AsyncView>
    </section>
  )
}
