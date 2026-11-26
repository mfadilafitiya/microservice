// src/pages/ProductListPage.jsx
// Halaman daftar produk: data produk dari product-service, rating dari review-service (CSS biasa).
import { getProductsWithRating } from '../api/aggregate'
import AsyncView from '../components/AsyncView'
import ProductCard from '../components/ProductCard'
import { useAsync } from '../hooks/useAsync'

export default function ProductListPage() {
  const { loading, data, error, reload } = useAsync(getProductsWithRating)

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
          <h1 style={{ margin: 0 }}>🛍️ KATALOG PRODUK</h1>
          <p
            style={{
              margin: '0.5rem 0 0',
              fontWeight: 700,
              color: 'var(--muted)',
            }}
          >
            Pilihan perangkat & aksesoris terbaik dari database kami.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-white"
          onClick={reload}
          title="Segarkan data"
        >
          🔄 Refresh
        </button>
      </div>

      <AsyncView loading={loading} error={error} onRetry={reload}>
        {data && (
          <div className="grid">
            {data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </AsyncView>
    </section>
  )
}
