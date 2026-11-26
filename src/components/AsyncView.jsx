// src/components/AsyncView.jsx
// Menampilkan status memuat atau error dengan CSS biasa.
export default function AsyncView({ loading, error, onRetry, children }) {
  if (loading) {
    return (
      <div className="empty-box" style={{ padding: '3.5rem 1.5rem' }}>
        <span style={{ fontSize: '3.5rem', display: 'inline-block', marginBottom: '0.75rem' }}>
          ⏳
        </span>
        <h3 style={{ margin: '0.5rem 0 0' }}>Sedang Memuat Data...</h3>
        <p className="muted" style={{ margin: '0.25rem 0 0' }}>
          Menghubungkan layanan microservices
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="alert alert-error"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <p style={{ margin: 0, fontWeight: 800 }}>{error.message}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            className="btn btn-white"
            onClick={onRetry}
            style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
          >
            🔄 Coba lagi
          </button>
        )}
      </div>
    )
  }

  return children
}
