import React, { useEffect, useState } from 'react';
import { Eye, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  createOrder,
  deleteOrder,
  getApiError,
  getCustomers,
  getOrders,
  getProducts,
} from '../api/client';

const EMPTY_ITEM = { product_id: '', quantity: '1' };

const formatCurrency = (value, currency = 'USD') => {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(value || 0));
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([EMPTY_ITEM]);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [orderResponse, customerResponse, productResponse] = await Promise.all([
        getOrders(),
        getCustomers(),
        getProducts(),
      ]);
      setOrders(orderResponse.data);
      setCustomers(customerResponse.data);
      setProducts(productResponse.data);
    } catch (err) {
      toast.error(getApiError(err, 'Unable to load orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNewOrder = () => {
    setCustomerId('');
    setItems([EMPTY_ITEM]);
    setShowModal(true);
  };

  const addItem = () => setItems([...items, EMPTY_ITEM]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const productById = (productId) => products.find((product) => product.id === Number(productId));

  const getOrderCurrency = (order) => {
    if (order && order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      const prod = firstItem.product || productById(firstItem.product_id);
      return prod?.currency || 'USD';
    }
    return 'USD';
  };

  const getEstimatedCurrency = () => {
    if (items && items.length > 0) {
      const firstItem = items[0];
      if (firstItem && firstItem.product_id) {
        const prod = productById(firstItem.product_id);
        return prod?.currency || 'USD';
      }
    }
    return 'USD';
  };

  const requestedTotals = () =>
    items.reduce((totals, item) => {
      if (!item.product_id) return totals;
      const productId = Number(item.product_id);
      totals[productId] = (totals[productId] || 0) + Number(item.quantity || 0);
      return totals;
    }, {});

  const calcTotal = () =>
    items.reduce((sum, item) => {
      const product = productById(item.product_id);
      const quantity = Number(item.quantity || 0);
      return sum + (product ? product.price * quantity : 0);
    }, 0);

  const validateOrder = () => {
    if (!customerId) return 'Select a customer';
    if (items.some((item) => !item.product_id)) return 'Select a product for every item';

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return 'Item quantities must be positive whole numbers';
      }
    }

    const totals = requestedTotals();
    for (const [productId, quantity] of Object.entries(totals)) {
      const product = productById(productId);
      if (!product) return `Product #${productId} is no longer available`;
      if (quantity > product.quantity) {
        return `${product.name} has ${product.quantity} in stock, but ${quantity} is requested`;
      }
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateOrder();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({
        customer_id: Number(customerId),
        items: items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
        })),
      });
      toast.success('Order created');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Unable to create order'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this order? Inventory will be restored.')) return;
    try {
      await deleteOrder(id);
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Unable to cancel order'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders.</p>
        </div>
        <button className="btn btn-primary" onClick={openNewOrder}>
          <Plus size={16} aria-hidden="true" />
          New Order
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty">No orders yet. Create an order once products and customers exist.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="mono">#{order.id}</span>
                    </td>
                    <td>{order.customer?.full_name || `Customer #${order.customer_id}`}</td>
                    <td>{order.items?.length || 0} item(s)</td>
                    <td>
                      <span className="mono">{formatCurrency(order.total_amount, getOrderCurrency(order))}</span>
                    </td>
                    <td>
                      <span className="badge badge-blue">{order.status}</span>
                    </td>
                    <td className="mono">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => setViewOrder(order)}>
                          <Eye size={14} aria-hidden="true" />
                          View
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(order.id)}>
                          <Trash2 size={14} aria-hidden="true" />
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <form className="modal modal-wide" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
            <h2 className="modal-title">Create Order</h2>
            <div className="form-group">
              <label htmlFor="order-customer">Customer *</label>
              <select id="order-customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <span className="field-label">Order Items *</span>
            {items.map((item, index) => (
              <div className="order-item-row" key={`${index}-${item.product_id}`}>
                <select
                  value={item.product_id}
                  onChange={(event) => updateItem(index, 'product_id', event.target.value)}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id} disabled={product.quantity === 0}>
                      {product.name} ({formatCurrency(product.price, product.currency)} | {product.quantity} left)
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                  aria-label="Quantity"
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  aria-label="Remove item"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            ))}

            <button type="button" className="btn btn-secondary" onClick={addItem}>
              <Plus size={16} aria-hidden="true" />
              Add Item
            </button>

            <div className="summary-strip">
              <span>Estimated total</span>
              <strong>{formatCurrency(calcTotal(), getEstimatedCurrency())}</strong>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Placing...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      )}

      {viewOrder && (
        <div className="modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="modal modal-wide" onClick={(event) => event.stopPropagation()}>
            <h2 className="modal-title">Order #{viewOrder.id}</h2>
            <div className="summary-strip">
              <span>
                Customer: <strong>{viewOrder.customer?.full_name || `#${viewOrder.customer_id}`}</strong>
              </span>
              <span className="mono">{viewOrder.customer?.email}</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {viewOrder.items?.map((item) => {
                    const product = item.product || productById(item.product_id);
                    return (
                      <tr key={item.id}>
                        <td>{product?.name || `Product #${item.product_id}`}</td>
                        <td>{item.quantity}</td>
                        <td className="mono">{formatCurrency(item.unit_price, product?.currency || 'USD')}</td>
                        <td className="mono">{formatCurrency(item.quantity * item.unit_price, product?.currency || 'USD')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="summary-strip">
              <span>Total amount</span>
              <strong>{formatCurrency(viewOrder.total_amount, getOrderCurrency(viewOrder))}</strong>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={() => setViewOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
