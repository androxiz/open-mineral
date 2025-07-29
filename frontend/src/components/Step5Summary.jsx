import React, { useState, useEffect } from 'react';
import './Step5Summary.css';

export default function Step5Summary({ formData, taskStatus }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Generate mock chart data based on form data
    generateChartData();
  }, [formData]);

  const generateChartData = () => {
    // Mock data for demonstration
    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Treatment Charge Trend',
          data: [320, 325, 330, 315, 340, formData.treatment_charge || 320],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Refining Charge Trend',
          data: [4.2, 4.3, 4.1, 4.4, 4.2, formData.refining_charge || 4.2],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }
      ]
    };
    setChartData(data);
  };

  const calculateDealValue = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const tc = parseFloat(formData.treatment_charge) || 0;
    const rc = parseFloat(formData.refining_charge) || 0;
    return (quantity * tc) + (quantity * rc * 0.035); // Rough calculation
  };

  const getDealStatus = () => {
    if (!formData.buyer || !formData.material) return 'Incomplete';
    if (!formData.payment_method) return 'Pending Payment Terms';
    return 'Ready for Execution';
  };

  return (
    <div className="summary-container">
      <div className="summary-header">
        <h2>Business Confirmation Summary</h2>
        <div className="status-badge">
          <span className={`status ${getDealStatus().toLowerCase().replace(' ', '-')}`}>
            {getDealStatus()}
          </span>
        </div>
      </div>

      <div className="summary-grid">
        {/* Deal Overview */}
        <div className="summary-card deal-overview">
          <h3>Deal Overview</h3>
          <div className="overview-stats">
            <div className="stat-item">
              <label>Deal Value</label>
              <span className="value">${calculateDealValue().toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <label>Quantity</label>
              <span className="value">{formData.quantity || 0} dmt</span>
            </div>
            <div className="stat-item">
              <label>Material</label>
              <span className="value">{formData.material || 'Not selected'}</span>
            </div>
            <div className="stat-item">
              <label>Buyer</label>
              <span className="value">{formData.buyer || 'Not selected'}</span>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="summary-card pricing-summary">
          <h3>Pricing Summary</h3>
          <div className="pricing-stats">
            <div className="stat-item">
              <label>Treatment Charge</label>
              <span className="value">${formData.treatment_charge || 0}/dmt</span>
            </div>
            <div className="stat-item">
              <label>Refining Charge</label>
              <span className="value">${formData.refining_charge || 0}/toz</span>
            </div>
            <div className="stat-item">
              <label>Payment Method</label>
              <span className="value">{formData.payment_method || 'Not selected'}</span>
            </div>
            <div className="stat-item">
              <label>Prepayment</label>
              <span className="value">{formData.prepayment_percentage || 0}%</span>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="summary-card chart-section">
          <h3>Market Trends</h3>
          <div className="chart-container">
            {chartData ? (
              <div className="mock-chart">
                <div className="chart-header">
                  <span>Treatment Charge Trend (USD/dmt)</span>
                  <span>Refining Charge Trend (USD/toz)</span>
                </div>
                <div className="chart-bars">
                  {chartData.datasets[0].data.map((value, index) => (
                    <div key={index} className="chart-bar-group">
                      <div 
                        className="chart-bar tc-bar" 
                        style={{ height: `${(value / 400) * 200}px` }}
                        title={`${chartData.labels[index]}: $${value}`}
                      ></div>
                      <div 
                        className="chart-bar rc-bar" 
                        style={{ height: `${(chartData.datasets[1].data[index] / 5) * 200}px` }}
                        title={`${chartData.labels[index]}: $${chartData.datasets[1].data[index]}`}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="chart-labels">
                  {chartData.labels.map((label, index) => (
                    <span key={index} className="chart-label">{label}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="loading-chart">Loading chart...</div>
            )}
          </div>
        </div>

        {/* Processing Status */}
        {taskStatus && (
          <div className="summary-card processing-status">
            <h3>Processing Status</h3>
            <div className={`status-indicator ${taskStatus.status}`}>
              {taskStatus.status === 'pending' && (
                <>
                  <div className="spinner"></div>
                  <span>Processing confirmation...</span>
                </>
              )}
              {taskStatus.status === 'completed' && (
                <>
                  <span className="success-icon">✅</span>
                  <span>Confirmation processed successfully!</span>
                </>
              )}
            </div>
            <div className="processing-details">
              <p>Task ID: {taskStatus.celery_task_id}</p>
              <p>Created: {new Date(taskStatus.created_at).toLocaleString()}</p>
              {taskStatus.completed_at && (
                <p>Completed: {new Date(taskStatus.completed_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="summary-card actions">
          <h3>Actions</h3>
          <div className="action-buttons">
            <button className="action-btn primary">Download PDF</button>
            <button className="action-btn secondary">Share Deal</button>
            <button className="action-btn secondary">Create Similar Deal</button>
            <button className="action-btn danger">Cancel Deal</button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {taskStatus?.status === 'completed' && (
        <div className="success-message">
          <div className="success-content">
            <span className="success-icon">🎉</span>
            <h3>Deal Confirmed Successfully!</h3>
            <p>Your business confirmation has been processed and is ready for execution.</p>
            <div className="success-actions">
              <button className="success-btn primary">View Deal Details</button>
              <button className="success-btn secondary">Create New Deal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 