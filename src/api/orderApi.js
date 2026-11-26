// src/api/orderApi.js
// Client untuk order & payment service melalui API Gateway (:8080)
import { request } from './http'

const BASE_URL = import.meta.env.VITE_ORDER_URL || import.meta.env.VITE_PRODUCT_URL

export const createOrder = (userId) =>
  request(BASE_URL, '/orders', {
    method: 'POST',
    body: { user_id: userId },
  }).then((res) => res.data)

export const getOrder = (orderId) =>
  request(BASE_URL, `/orders/${orderId}`).then((res) => res.data)

export const payOrder = (orderId) =>
  request(BASE_URL, `/orders/${orderId}/pay`, {
    method: 'PATCH',
  }).then((res) => res.data)

export const getUserOrders = (userId) =>
  request(BASE_URL, `/orders/user/${userId}`).then((res) => res.data)
