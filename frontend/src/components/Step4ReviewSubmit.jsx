import React, { useState, useEffect } from 'react';
import './Step4ReviewSubmit.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function Step4ReviewSubmit({ onProceed, onBack, formData, setFormData }) {
  const [validationSuggestions, setValidationSuggestions] = useState([]);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskStatus, setTaskStatus] = useState(null);

  useEffect(() => {
    // Generate AI validation suggestions
    generateValidationSuggestions();
  }, []);

  const generateValidationSuggestions = () => {
    const suggestions = [];
    
    // Check for missing required fields
    if (!formData.nominated_surveyor) {
      suggestions.push({
        type: 'warning',
        message: '⚠️ Surveyor not selected',
        field: 'nominated_surveyor'
      });
    }
    
    if (!formData.final_location) {
      suggestions.push({
        type: 'warning',
        message: '⚠️ Final location not specified',
        field: 'final_location'
      });
    }
    
    if (!formData.payment_method) {
      suggestions.push({
        type: 'error',
        message: '❌ Payment method is required',
        field: 'payment_method'
      });
    }
    
    // Check for pricing anomalies
    if (formData.treatment_charge && parseFloat(formData.treatment_charge) > 350) {
      suggestions.push({
        type: 'warning',
        message: '⚠️ Treatment Charge is 20% higher than last month. Proceed?',
        field: 'treatment_charge'
      });
    }
    
    if (formData.refining_charge && parseFloat(formData.refining_charge) > 5.0) {
      suggestions.push({
        type: 'warning',
        message: '⚠️ Refining Charge is above market average',
        field: 'refining_charge'
      });
    }
    
    setValidationSuggestions(suggestions);
  };

  const handleSubmit = async () => {
    // Show warning popup if there are warnings
    const warnings = validationSuggestions.filter(s => s.type === 'warning');
    if (warnings.length > 0) {
      setShowWarningPopup(true);
      return;
    }
    
    // If no warnings, submit directly
    await submitConfirmation();
  };

  const submitConfirmation = async () => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting confirmation...'); // Debug log
      
      // Create business confirmation
      const response = await fetch(`${API_BASE}/business-confirmations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      console.log('Business confirmation response:', response.status); // Debug log
      
      if (response.ok) {
        const confirmation = await response.json();
        console.log('Confirmation created:', confirmation); // Debug log
        
        // Trigger processing task
        const taskResponse = await fetch(`${API_BASE}/trigger-processing/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            business_confirmation_id: confirmation.id
          })
        });
        
        console.log('Task response:', taskResponse.status); // Debug log
        
        if (taskResponse.ok) {
          const task = await taskResponse.json();
          console.log('Task created:', task); // Debug log
          setTaskStatus(task);
          
          // Poll for task completion
          pollTaskStatus(task.celery_task_id);
        } else {
          console.error('Task creation failed:', await taskResponse.text());
          setIsSubmitting(false);
        }
      } else {
        console.error('Confirmation creation failed:', await response.text());
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setIsSubmitting(false);
    }
  };

  const pollTaskStatus = async (taskId) => {
    console.log('Starting to poll task:', taskId); // Debug log
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE}/task-status/${taskId}/`);
        console.log('Poll response status:', response.status); // Debug log
        
        if (response.ok) {
          const task = await response.json();
          console.log('Task status:', task.status); // Debug log
          setTaskStatus(task);
          
          if (task.status === 'completed') {
            console.log('Task completed, proceeding to Step 5'); // Debug log
            clearInterval(pollInterval);
            onProceed(); // Go to Step 5
          }
        } else {
          console.error('Poll failed:', await response.text());
        }
      } catch (error) {
        console.error('Polling failed:', error);
      }
    }, 2000); // Poll every 2 seconds
    
    // Stop polling after 2 minutes (60 attempts)
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log('Polling timeout reached');
    }, 120000);
  };

  const handleProceedWithWarnings = () => {
    setShowWarningPopup(false);
    submitConfirmation();
  };

  const handleEditField = (field) => {
    // Go back to the appropriate step based on field
    if (['buyer', 'material', 'quantity'].includes(field)) {
      onBack(); // Go back to Step 1
    } else if (['delivery_term', 'treatment_charge', 'refining_charge'].includes(field)) {
      // Go back to Step 2
      for (let i = 0; i < 2; i++) onBack();
    } else {
      // Go back to Step 3
      for (let i = 0; i < 3; i++) onBack();
    }
  };

  return (
    <div className="review-submit-container">
      <div className="review-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <h2>Review & Submit</h2>
        <button className="close-btn">✕</button>
      </div>

      <div className="review-content">
        {/* Review Summary */}
        <div className="review-summary">
          <h3>Review Summary</h3>
          
          <div className="summary-section">
            <h4>Deal Basics</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <label>Seller:</label>
                <span>{formData.seller}</span>
              </div>
              <div className="summary-item">
                <label>Buyer:</label>
                <span>{formData.buyer || 'Not selected'}</span>
                <button onClick={() => handleEditField('buyer')} className="edit-link">Edit</button>
              </div>
              <div className="summary-item">
                <label>Material:</label>
                <span>{formData.material || 'Not selected'}</span>
                <button onClick={() => handleEditField('material')} className="edit-link">Edit</button>
              </div>
              <div className="summary-item">
                <label>Quantity:</label>
                <span>{formData.quantity ? `${formData.quantity} ±${formData.quantity_tolerance}%` : 'Not set'}</span>
                <button onClick={() => handleEditField('quantity')} className="edit-link">Edit</button>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <h4>Commercial Terms</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <label>Delivery Term:</label>
                <span>{formData.delivery_term || 'Not selected'}</span>
                <button onClick={() => handleEditField('delivery_term')} className="edit-link">Edit</button>
              </div>
              <div className="summary-item">
                <label>Treatment Charge:</label>
                <span>{formData.treatment_charge ? `$${formData.treatment_charge}/dmt` : 'Not set'}</span>
                <button onClick={() => handleEditField('treatment_charge')} className="edit-link">Edit</button>
              </div>
              <div className="summary-item">
                <label>Refining Charge:</label>
                <span>{formData.refining_charge ? `$${formData.refining_charge}/toz` : 'Not set'}</span>
                <button onClick={() => handleEditField('refining_charge')} className="edit-link">Edit</button>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <h4>Payment Terms</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <label>Payment Method:</label>
                <span>{formData.payment_method || 'Not selected'}</span>
                <button onClick={() => handleEditField('payment_method')} className="edit-link">Edit</button>
              </div>
              <div className="summary-item">
                <label>Currency:</label>
                <span>{formData.currency || 'Not selected'}</span>
                <button onClick={() => handleEditField('currency')} className="edit-link">Edit</button>
              </div>
              <div className="summary-item">
                <label>Prepayment:</label>
                <span>{formData.prepayment_percentage || 0}%</span>
                <button onClick={() => handleEditField('prepayment_percentage')} className="edit-link">Edit</button>
              </div>
              <div className="summary-item">
                <label>Surveyor:</label>
                <span>{formData.nominated_surveyor || 'Not selected'}</span>
                <button onClick={() => handleEditField('nominated_surveyor')} className="edit-link">Edit</button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Validation */}
        <div className="ai-validation">
          <h3>AI Validation</h3>
          {validationSuggestions.length > 0 ? (
            <div className="validation-list">
              {validationSuggestions.map((suggestion, index) => (
                <div key={index} className={`validation-item ${suggestion.type}`}>
                  <span className="validation-icon">{suggestion.type === 'warning' ? '⚠️' : '❌'}</span>
                  <span className="validation-message">{suggestion.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="validation-success">
              <span className="validation-icon">✅</span>
              <span className="validation-message">All validations passed</span>
            </div>
          )}
        </div>

        {/* Task Status */}
        {taskStatus && (
          <div className="task-status">
            <h3>Processing Status</h3>
            <div className={`status-indicator ${taskStatus.status}`}>
              {taskStatus.status === 'pending' && '⏳ Processing...'}
              {taskStatus.status === 'completed' && '✅ Completed!'}
            </div>
          </div>
        )}
      </div>

      {/* Final Confirmation */}
      <div className="final-confirmation">
        <button 
          onClick={handleSubmit} 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Confirmation'}
        </button>
      </div>

      {/* Warning Popup */}
      {showWarningPopup && (
        <div className="warning-popup-overlay">
          <div className="warning-popup">
            <h3>⚠️ Warning</h3>
            <p>Some validation warnings were found. Do you want to proceed anyway?</p>
            <div className="popup-buttons">
              <button onClick={() => setShowWarningPopup(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleProceedWithWarnings} className="proceed-btn">
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 