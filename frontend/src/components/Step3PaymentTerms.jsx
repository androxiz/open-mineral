import React, { useEffect, useState } from 'react';
import './Step3PaymentTerms.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function Step3PaymentTerms({ onProceed, onBack, formData, setFormData }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [triggeringEvents, setTriggeringEvents] = useState([]);
  const [surveyors, setSurveyors] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load dropdown data
    fetch(`${API_BASE}/payment-methods/`).then(res => res.json()).then(setPaymentMethods);
    fetch(`${API_BASE}/currencies/`).then(res => res.json()).then(setCurrencies);
    fetch(`${API_BASE}/triggering-events/`).then(res => res.json()).then(setTriggeringEvents);
    fetch(`${API_BASE}/surveyors/`).then(res => res.json()).then(setSurveyors);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const handleClauseChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.payment_method) newErrors.payment_method = 'Payment Method is required';
    if (!formData.currency) newErrors.currency = 'Currency is required';
    if (!formData.triggering_event) newErrors.triggering_event = 'Triggering Event is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = (e) => {
    e.preventDefault();
    if (validate()) onProceed();
  };

  return (
    <div className="payment-terms-container">
      <div className="payment-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <h2>Payment Terms</h2>
        <button className="close-btn">✕</button>
      </div>

      <div className="payment-grid">
        {/* Left Column: Payment Method */}
        <div className="payment-column">
          <h3>Payment Method</h3>
          
          <div className="form-group">
            <label>Payment Method</label>
            <select name="payment_method" value={formData.payment_method || ''} onChange={handleChange}>
              <option value="">Select Payment Method</option>
              {paymentMethods.map(pm => (
                <option key={pm.id} value={pm.id}>{pm.name}</option>
              ))}
            </select>
            {errors.payment_method && <div className="error-text">{errors.payment_method}</div>}
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select name="currency" value={formData.currency || ''} onChange={handleChange}>
              <option value="">Select Currency</option>
              {currencies.map(curr => (
                <option key={curr.id} value={curr.id}>{curr.code} - {curr.name}</option>
              ))}
            </select>
            {errors.currency && <div className="error-text">{errors.currency}</div>}
          </div>

          <div className="form-group">
            <label>Triggering Event</label>
            <select name="triggering_event" value={formData.triggering_event || ''} onChange={handleChange}>
              <option value="">Select Triggering Event</option>
              {triggeringEvents.map(te => (
                <option key={te.id} value={te.id}>{te.name}</option>
              ))}
            </select>
            {errors.triggering_event && <div className="error-text">{errors.triggering_event}</div>}
          </div>
        </div>

        {/* Middle Column: Payment Stages */}
        <div className="payment-column">
          <h3>Payment Stages</h3>
          
          <div className="form-group">
            <label>Prepayment Percentage</label>
            <div className="slider-container">
              <input
                type="range"
                name="prepayment_percentage"
                min="0"
                max="100"
                value={formData.prepayment_percentage || 0}
                onChange={handleSliderChange}
                className="slider"
              />
              <span className="slider-value">{formData.prepayment_percentage || 0}%</span>
            </div>
          </div>

          <div className="form-group">
            <label>Provisional Payment</label>
            <textarea
              name="provisional_payment"
              value={formData.provisional_payment || ''}
              onChange={handleClauseChange}
              placeholder="Provisional payment terms..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Final Payment</label>
            <textarea
              name="final_payment"
              value={formData.final_payment || ''}
              onChange={handleClauseChange}
              placeholder="Final payment terms..."
              rows="3"
            />
          </div>
        </div>

        {/* Right Column: WSMD & Surveyor */}
        <div className="payment-column">
          <h3>WSMD & Surveyor</h3>
          
          <div className="form-group">
            <label>Final Location</label>
            <input
              type="text"
              name="final_location"
              value={formData.final_location || ''}
              onChange={handleChange}
              placeholder="e.g., Shanghai Port, China"
            />
          </div>

          <div className="form-group">
            <label>Cost Sharing</label>
            <div className="cost-sharing-container">
              <div className="cost-sharing-item">
                <label>Buyer</label>
                <div className="slider-container">
                  <input
                    type="range"
                    name="cost_sharing_buyer"
                    min="0"
                    max="100"
                    value={formData.cost_sharing_buyer || 50}
                    onChange={handleSliderChange}
                    className="slider"
                  />
                  <span className="slider-value">{formData.cost_sharing_buyer || 50}%</span>
                </div>
              </div>
              <div className="cost-sharing-item">
                <label>Seller</label>
                <div className="slider-container">
                  <input
                    type="range"
                    name="cost_sharing_seller"
                    min="0"
                    max="100"
                    value={formData.cost_sharing_seller || 50}
                    onChange={handleSliderChange}
                    className="slider"
                  />
                  <span className="slider-value">{formData.cost_sharing_seller || 50}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Nominated Surveyor</label>
            <select name="nominated_surveyor" value={formData.nominated_surveyor || ''} onChange={handleChange}>
              <option value="">Select Surveyor</option>
              {surveyors.map(surveyor => (
                <option key={surveyor.id} value={surveyor.id}>
                  {surveyor.name} - {surveyor.company}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Payment Clause</label>
            <textarea
              name="payment_clause"
              value={formData.payment_clause || 'Payment shall be made within 30 days of invoice date'}
              onChange={handleClauseChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Surveyor Clause</label>
            <textarea
              name="surveyor_clause"
              value={formData.surveyor_clause || 'Surveyor shall be mutually agreed upon by both parties'}
              onChange={handleClauseChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>WSMD Clause</label>
            <textarea
              name="wsmd_clause"
              value={formData.wsmd_clause || 'Weighing, sampling, moisture determination and analysis shall be carried out at final destination'}
              onChange={handleClauseChange}
              rows="3"
            />
          </div>
        </div>
      </div>

      <div className="payment-footer">
        <button onClick={handleProceed} className="proceed-btn">Review & Submit →</button>
      </div>
    </div>
  );
} 