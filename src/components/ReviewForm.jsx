// src/components/ReviewForm.jsx
// Formulir untuk menulis review dengan CSS biasa & gaya Neo-Brutalism.
import { useState } from 'react'
import { createReview } from '../api/reviewApi'
import { describeError } from '../utils/format'

export default function ReviewForm({ productId, userId, onCreated }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault() // cegah browser memuat ulang halaman
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    try {
      await createReview({ productId, userId, rating, comment })
      setComment('')
      setSuccessMsg('Ulasan berhasil dikirim!')
      if (onCreated) {
        onCreated() // beri tahu halaman induk supaya ulasan dimuat ulang seketika
      }
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="review-form-card">
      <div className="review-form-header">
        <span className="badge-tag" style={{ background: 'var(--neo-purple)', color: '#fff' }}>
          ✍️ TULIS ULASAN
        </span>
      </div>

      <p style={{ margin: '0 0 1rem', fontWeight: 800, fontSize: '0.95rem' }}>
        Review sebagai{' '}
        <span className="badge-tag" style={{ background: 'var(--neo-yellow)' }}>
          User {userId}
        </span>
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 800 }}>
          <span>Beri Rating:</span>
          <div className="star-interactive-picker">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className={`star-picker-btn ${star <= rating ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                title={`${star} Bintang`}
              >
                ★
              </button>
            ))}
            <span style={{ marginLeft: '0.5rem', fontWeight: 900, alignSelf: 'center', fontSize: '1.1rem' }}>
              {rating} / 5
            </span>
          </div>

          {/* Sinkronisasi dropdown select tetap ada untuk kompatibilitas */}
          <select
            style={{ display: 'none' }}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} bintang
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: '0.35rem', fontWeight: 800 }}>
          <span>Komentar:</span>
          <textarea
            rows="3"
            maxLength="1000"
            placeholder="Bagikan pengalamanmu menggunakan produk ini..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>

        {successMsg && (
          <div className="alert alert-success" style={{ margin: 0 }}>
            <span>🎉</span> {successMsg}
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ margin: 0 }}>
            <span>⚠️</span> {describeError(error)}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.25rem' }}
          disabled={submitting}
        >
          {submitting ? 'Mengirim...' : 'Kirim review 🚀'}
        </button>
      </form>
    </div>
  )
}
