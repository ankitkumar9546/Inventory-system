import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  createProduct,
  deleteProduct,
  getApiError,
  getProducts,
  updateProduct,
} from '../api/client';

const EMPTY_FORM = { name: '', sku: '', price: '', currency: 'USD', quantity: '', description: '' };

const formatCurrency = (value, currency = 'USD') => {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(Number(value || 0));
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      toast.error(getApiError(err, 'Unable to load products'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      currency: product.currency || 'USD',
      quantity: String(product.quantity),
      description: product.description || '',
    });
    setShowModal(true);
  };

  const validateForm = () => {
    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (!form.name.trim() || !form.sku.trim() || form.price === '' || form.quantity === '') {
      return 'Product name, SKU, price, and quantity are required';
    }
    if (Number.isNaN(price) || price < 0) {
      return 'Price must be zero or greater';
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      return 'Quantity must be a whole number zero or greater';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      currency: form.currency || 'USD',
      quantity: Number(form.quantity),
      description: form.description.trim() || null,
    };

    setSubmitting(true);
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Unable to save product'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Unable to delete product'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products in inventory.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} aria-hidden="true" />
          Add Product
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty">No products yet. Add your first product.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      {product.description && <div className="description">{product.description}</div>}
                    </td>
                    <td>
                      <span className="mono">{product.sku}</span>
                    </td>
                    <td>
                      <span className="mono">{formatCurrency(product.price, product.currency)}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          product.quantity === 0
                            ? 'badge-red'
                            : product.quantity <= 10
                              ? 'badge-yellow'
                              : 'badge-green'
                        }`}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(product)}>
                          <Pencil size={14} aria-hidden="true" />
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(product.id)}>
                          <Trash2 size={14} aria-hidden="true" />
                          Delete
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
          <form className="modal" onClick={(event) => event.stopPropagation()} onSubmit={handleSubmit}>
            <h2 className="modal-title">{editing ? 'Update Product' : 'Add Product'}</h2>
            <div className="form-group">
              <label htmlFor="product-name">Product Name *</label>
              <input
                id="product-name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Wireless Keyboard"
              />
            </div>
            <div className="form-group">
              <label htmlFor="product-sku">SKU / Code *</label>
              <input
                id="product-sku"
                value={form.sku}
                onChange={(event) => setForm({ ...form, sku: event.target.value })}
                placeholder="WK-001"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="product-price">Price *</label>
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label htmlFor="product-currency">Currency *</label>
                <select
                  id="product-currency"
                  value={form.currency || 'USD'}
                  onChange={(event) => setForm({ ...form, currency: event.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="product-quantity">Quantity *</label>
                <input
                  id="product-quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="product-description">Description</label>
              <textarea
                id="product-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Optional product notes"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
