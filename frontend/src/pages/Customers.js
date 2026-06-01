import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { createCustomer, deleteCustomer, getApiError, getCustomers } from '../api/client';

const EMPTY_FORM = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (err) {
      toast.error(getApiError(err, 'Unable to load customers'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const validateForm = () => {
    if (!form.full_name.trim() || !form.email.trim() || !form.phone.trim()) {
      return 'Name, email, and phone are required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Enter a valid email address';
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

    setSubmitting(true);
    try {
      await createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      toast.success('Customer added');
      setShowModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Unable to add customer'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted');
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Unable to delete customer'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} aria-hidden="true" />
          Add Customer
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="empty">No customers yet. Add a customer to start creating orders.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>{customer.full_name}</strong>
                    </td>
                    <td>
                      <span className="mono">{customer.email}</span>
                    </td>
                    <td>{customer.phone}</td>
                    <td className="mono">{new Date(customer.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(customer.id)}>
                        <Trash2 size={14} aria-hidden="true" />
                        Delete
                      </button>
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
            <h2 className="modal-title">Add Customer</h2>
            <div className="form-group">
              <label htmlFor="customer-name">Full Name *</label>
              <input
                id="customer-name"
                value={form.full_name}
                onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                placeholder="Ankit Kumar"
              />
            </div>
            <div className="form-group">
              <label htmlFor="customer-email">Email *</label>
              <input
                id="customer-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="ankit@example.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="customer-phone">Phone *</label>
              <input
                id="customer-phone"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="+1 555 0100"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
