import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

import { getApiError, getDashboard } from '../api/client';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getDashboard();
      setData(response.data);
    } catch (err) {
      setError(getApiError(err, 'Unable to load dashboard'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  if (error) {
    return (
      <div className="card error-state">
        <span>{error}</span>
        <button className="btn btn-secondary" onClick={load}>
          <RefreshCw size={16} aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  const lowStock = data?.low_stock_products || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Inventory health, customer count, and order activity.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{data?.total_products ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{data?.total_customers ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{data?.total_orders ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock</div>
          <div className="stat-value">{lowStock.length}</div>
        </div>
      </div>

      <div className="card">
        {lowStock.length > 0 ? (
          <>
            <h2 className="section-title">
              <AlertTriangle size={18} aria-hidden="true" /> Low Stock Products
            </h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>
                        <span className="mono">{product.sku}</span>
                      </td>
                      <td>
                        <span className={`badge ${product.quantity === 0 ? 'badge-red' : 'badge-yellow'}`}>
                          {product.quantity} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="healthy-state">
            <CheckCircle2 size={22} aria-hidden="true" />
            <p>All products have healthy stock levels.</p>
          </div>
        )}
      </div>
    </div>
  );
}
