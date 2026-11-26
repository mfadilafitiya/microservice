// src/components/StarRating.jsx
// Menampilkan rata-rata rating dalam bentuk bintang (CSS biasa).
export default function StarRating({ average, total, compact = false }) {
  if (!total) {
    return (
      <span className="stars" style={{ background: '#f4f4f5', color: 'var(--muted)' }}>
        Belum ada ulasan
      </span>
    )
  }

  const filled = Math.round(average)

  return (
    <span className="stars" title={`${average} dari 5`}>
      <span style={{ letterSpacing: '1px' }}>
        {'★'.repeat(filled)}
        <span style={{ color: '#d4d4d8' }}>{'☆'.repeat(5 - filled)}</span>
      </span>
      {!compact && (
        <span style={{ marginLeft: '0.35rem', fontWeight: 900, color: 'var(--ink)' }}>
          {Number(average).toFixed(1)}{' '}
          <small style={{ fontWeight: 600, color: 'var(--muted)' }}>({total})</small>
        </span>
      )}
    </span>
  )
}
