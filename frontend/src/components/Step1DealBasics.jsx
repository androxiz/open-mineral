import React, { useEffect, useState } from 'react';
import './Step1DealBasics.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function Step1DealBasics({ onProceed, formData, setFormData }) {
  const [buyers, setBuyers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(`${API_BASE}/buyers/`)
      .then(res => res.json())
      .then(data => setBuyers(data));
    fetch(`${API_BASE}/materials/`)
      .then(res => res.json())
      .then(data => setMaterials(data));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.buyer) newErrors.buyer = 'Buyer is required';
    if (!formData.material) newErrors.material = 'Material is required';
    if (!formData.quantity || isNaN(formData.quantity)) newErrors.quantity = 'Quantity must be a number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = e => {
    e.preventDefault();
    if (validate()) onProceed();
  };

  return (
    <div className="deal-basics-container">
      <h2 className="deal-title">New Business Confirmation</h2>
      <form className="deal-form" onSubmit={handleProceed}>
        <div className="deal-section">
          <label className="deal-label">Seller</label>
          <div className="deal-static">Open Mineral</div>
        </div>
        <div className="deal-section">
          <label className="deal-label">Buyer</label>
          <select name="buyer" value={formData.buyer || ''} onChange={handleChange} className={errors.buyer ? 'error' : ''}>
            <option value="">Select Buyer</option>
            {buyers.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {errors.buyer && <div className="error-text">{errors.buyer}</div>}
        </div>
        <div className="deal-section">
          <label className="deal-label">Material</label>
          <select name="material" value={formData.material || ''} onChange={handleChange} className={errors.material ? 'error' : ''}>
            <option value="">Select Material</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          {errors.material && <div className="error-text">{errors.material}</div>}
        </div>
        <div className="deal-section">
          <label className="deal-label">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity || ''}
            onChange={handleChange}
            placeholder="0"
            className={errors.quantity ? 'error' : ''}
          />
          <span className="deal-unit">dmt ± %</span>
          {errors.quantity && <div className="error-text">{errors.quantity}</div>}
        </div>
        <button type="submit" className="deal-proceed-btn">Proceed to Terms →</button>
      </form>
    </div>
  );
} 