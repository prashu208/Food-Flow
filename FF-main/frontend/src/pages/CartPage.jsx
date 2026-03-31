import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/CartContext'
import { orderAPI } from '../lib/api'
import './pages.css'

function CartPage() {
  const { user, profile, isLoading } = useAuth()
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart()
  const navigate = useNavigate()
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [error, setError] = useState('')

  if (isLoading) {
    return (
      <main className="page-wrap">
        <section className="dashboard-card"><p className="page-message">Loading...</p></section>
      </main>
    )
  }

  if (!user) return <Navigate to="/user/signin" replace />

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    setIsPlacing(true)
    setError('')

    try {
      const orderData = {
        userId: user.id,
        userName: profile?.full_name || user.email,
        items: items.map((i) => ({
          foodId: i.foodId,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        totalPrice,
        deliveryAddress,
        notes
      }

      const order = await orderAPI.create(orderData)
      clearCart()
      navigate(`/user/orders/${order._id}`)
    } catch (err) {
      setError(err.message || 'Failed to place order')
    } finally {
      setIsPlacing(false)
    }
  }

  return (
    <main className="page-wrap">
      <section className="dashboard-card cart-page">
        <div className="cart-header">
          <h1>🛒 Your Cart</h1>
          <Link to="/user/dashboard" className="ghost-btn">← Back to Menu</Link>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🍽️</div>
            <h2>Your cart is empty</h2>
            <p className="muted-text">Browse the menu and add some delicious items!</p>
            <Link to="/user/dashboard" className="primary-btn">Browse Menu</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.foodId}>
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p className="price-label">₹{item.price}</p>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                    >
                      +
                    </button>
                    <span className="cart-item-subtotal">₹{item.price * item.quantity}</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeItem(item.foodId)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-extras">
              <label>
                Delivery Address (optional)
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Room / Hostel / Building"
                />
              </label>
              <label>
                Special Notes (optional)
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions..."
                  rows={2}
                />
              </label>
            </div>

            <div className="cart-summary">
              <div className="cart-total">
                <span>Total</span>
                <span className="cart-total-price">₹{totalPrice.toFixed(2)}</span>
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="cart-actions">
                <button type="button" className="ghost-btn" onClick={clearCart}>
                  Clear Cart
                </button>
                <button
                  type="button"
                  className="primary-btn place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                >
                  {isPlacing ? 'Placing Order...' : '🚀 Place Order'}
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default CartPage
