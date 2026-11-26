import { request } from './http'
import { getCart } from './cartApi'
import { getProduct } from './productApi'
import { getProductReviews } from './reviewApi'

export async function getProductsWithRating() {
  const response = await request(import.meta.env.VITE_PRODUCT_URL, '/catalog')
  return response.data
}

// Detail satu produk beserta review-nya. Produk wajib ada, review boleh gagal.
export async function getProductDetail(productId) {
  const [productResult, reviewResult] = await Promise.allSettled([
    getProduct(productId),
    getProductReviews(productId),
  ])

  if (productResult.status === 'rejected') throw productResult.reason

  const rawReviews = reviewResult.status === 'fulfilled' ? reviewResult.value : null
  const reviews = rawReviews ? (rawReviews.reviews ? rawReviews : rawReviews.data ?? null) : null

  return {
    product: productResult.value,
    reviews: reviews,
  }
}

// Isi keranjang beserta nama dan harga tiap produk.
// Cart-service hanya menyimpan product_id, jadi detail produk diambil satu per satu.
export async function getCartDetail(userId) {
  const cart = await getCart(userId)
  const items = await Promise.all(
    cart.items.map(async (item) => {
      try {
        const product = await getProduct(item.product_id)
        return { ...item, product }
      } catch {
        // produk sudah dihapus, atau product-service sedang bermasalah.
        return { ...item, product: null }
      }
    }),
  )

  const totalPrice = items.reduce(
    (sum, item) =>
      sum + (item.product ? Number(item.product.price) * item.quantity : 0),
    0,
  )

  return { items, totalPrice }
}
