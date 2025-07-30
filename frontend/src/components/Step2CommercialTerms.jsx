import React, { useEffect, useState } from 'react';
import './Step2CommercialTerms.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default function Step2CommercialTerms({ onProceed, onBack, formData, setFormData }) {
  const [deliveryTerms, setDeliveryTerms] = useState([]);
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [packaging, setPackaging] = useState([]);
  const [transportModes, setTransportModes] = useState([]);
  const [errors, setErrors] = useState({});
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showClauseModal, setShowClauseModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({
    tc: null,
    rc: null
  });

  useEffect(() => {
    // Load dropdown data
    fetch(`${API_BASE}/delivery-terms/`).then(res => res.json()).then(setDeliveryTerms);
    fetch(`${API_BASE}/delivery-points/`).then(res => res.json()).then(setDeliveryPoints);
    fetch(`${API_BASE}/packaging/`).then(res => res.json()).then(setPackaging);
    fetch(`${API_BASE}/transport-modes/`).then(res => res.json()).then(setTransportModes);
  }, []);

  // Generate AI suggestions using backend API
  const generateAISuggestions = async () => {
    // Only generate suggestions if user has entered values
    if (!formData.treatment_charge && !formData.refining_charge) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/ai-suggestions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          material: formData.material,
          treatment_charge: formData.treatment_charge,
          refining_charge: formData.refining_charge,
          delivery_point: formData.delivery_point
        })
      });

      const data = await response.json();
      if (data.tc_suggestion || data.rc_suggestion) {
        setAiSuggestions({
          tc: data.tc_suggestion,
          rc: data.rc_suggestion
        });
      }
    } catch (error) {
      console.log('AI suggestion generation failed:', error);
      // Keep existing suggestions
    }
  };

  // Filter packaging based on transport mode
  const filteredPackaging = () => {
    if (!formData.transport_mode) return packaging;
    
    const selectedMode = transportModes.find(tm => tm.id === formData.transport_mode);
    if (selectedMode?.name === 'Rail') {
      return packaging.filter(p => ['Bulk', 'Big Bags'].includes(p.name));
    } else if (selectedMode?.name === 'Ship') {
      return packaging.filter(p => p.name === 'Bulk');
    }
    return packaging;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear AI suggestions when pricing fields change (but don't generate automatically)
    if (name === 'treatment_charge' || name === 'refining_charge') {
      setAiSuggestions(prev => ({
        ...prev,
        [name === 'treatment_charge' ? 'tc' : 'rc']: null
      }));
    }
  };

  const handleAISuggest = () => {
    // Generate AI suggestions only when button is clicked
    generateAISuggestions();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // First, save the file to form data
      setFormData(prev => ({ ...prev, assay_file: file }));
      
      // Then try to parse it
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch(`${API_BASE}/parse-assay-file/`, {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Update form data with parsed assay values
            setFormData(prev => ({
              ...prev,
              assay_pb: result.data.assay_pb || 0,
              assay_zn: result.data.assay_zn || 0,
              assay_cu: result.data.assay_cu || 0,
              assay_ag: result.data.assay_ag || 0,
            }));
            
            // Show success message
            alert(`✅ Successfully parsed ${file.name}\n\nExtracted values:\nPb: ${result.data.assay_pb}%\nZn: ${result.data.assay_zn}%\nCu: ${result.data.assay_cu}%\nAg: ${result.data.assay_ag} g/t`);
          }
        } else {
          const errorData = await response.json();
          alert(`❌ Error parsing file: ${errorData.message || errorData.error}`);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('❌ Error uploading file. Please try again.');
      }
    }
  };

  const handleAddQuality = () => {
    setShowQualityModal(true);
  };

  const handleAddClause = () => {
    setShowClauseModal(true);
  };

  const handleUseSuggestedRC = () => {
    // Extract suggested value from the suggestion text
    const suggestion = aiSuggestions.rc;
    if (suggestion && suggestion.includes('$')) {
      const match = suggestion.match(/\$(\d+\.?\d*)/);
      if (match) {
        setFormData(prev => ({ ...prev, refining_charge: parseFloat(match[1]) }));
      }
    }
  };

  const handleKeepCurrentRC = () => {
    // Keep current value, just hide suggestion
    setAiSuggestions(prev => ({ ...prev, rc: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.delivery_term) newErrors.delivery_term = 'Delivery Term is required';
    if (!formData.delivery_point) newErrors.delivery_point = 'Delivery Point is required';
    if (!formData.transport_mode) newErrors.transport_mode = 'Transport Mode is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = (e) => {
    e.preventDefault();
    if (validate()) onProceed();
  };

  return (
    <div className="commercial-terms-container">
      <div className="commercial-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <h2>Commercial Terms</h2>
        <button className="close-btn">✕</button>
      </div>

      <div className="commercial-grid">
        {/* Left Column: Delivery & Shipment */}
        <div className="commercial-column">
          <h3>Delivery & Shipment</h3>
          
          <div className="form-group">
            <label>Delivery Term</label>
            <select name="delivery_term" value={formData.delivery_term || ''} onChange={handleChange}>
              <option value="">Select Delivery Term</option>
              {deliveryTerms.map(dt => (
                <option key={dt.id} value={dt.id}>{dt.name}</option>
              ))}
            </select>
            {errors.delivery_term && <div className="error-text">{errors.delivery_term}</div>}
          </div>

          <div className="form-group">
            <label>Delivery Point</label>
            <select name="delivery_point" value={formData.delivery_point || ''} onChange={handleChange}>
              <option value="">Select Delivery Point</option>
              {deliveryPoints.map(dp => (
                <option key={dp.id} value={dp.id}>{dp.name}</option>
              ))}
            </select>
            {errors.delivery_point && <div className="error-text">{errors.delivery_point}</div>}
          </div>

          <div className="form-group">
            <label>Packaging (optional)</label>
            <select name="packaging" value={formData.packaging || ''} onChange={handleChange}>
              <option value="">Select Packaging</option>
              {filteredPackaging().map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Transport Mode</label>
            <select name="transport_mode" value={formData.transport_mode || ''} onChange={handleChange}>
              <option value="">Select Transport Mode</option>
              {transportModes.map(tm => (
                <option key={tm.id} value={tm.id}>{tm.name}</option>
              ))}
            </select>
            {errors.transport_mode && <div className="error-text">{errors.transport_mode}</div>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="inland_freight_buyer"
                checked={formData.inland_freight_buyer || false}
                onChange={handleChange}
              />
              Inland freight will be borne by buyer
            </label>
          </div>

          <div className="form-group">
            <label>Shipment Period from</label>
            <input
              type="date"
              name="shipment_period_from"
              value={formData.shipment_period_from || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              name="shipment_period_to"
              value={formData.shipment_period_to || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="shipments_evenly_distributed"
                checked={formData.shipments_evenly_distributed || false}
                onChange={handleChange}
              />
              Shipments distributed evenly across period
            </label>
          </div>
        </div>

        {/* Middle Column: Assay / Quality */}
        <div className="commercial-column">
          <h3>Assay / Quality</h3>
          
          <div className="form-group">
            <label>Extract Assay from File</label>
            <input
              type="file"
              name="assay_file"
              onChange={handleFileUpload}
              accept=".xlsx,.xls,.csv"
            />
          </div>

          <div className="assay-results">
            <h4>Typical Assay</h4>
            <div className="assay-field">
              <label>Pb:</label>
              <input
                type="number"
                name="assay_pb"
                value={formData.assay_pb || ''}
                onChange={handleChange}
                placeholder="0"
              />
              <span>%</span>
            </div>
            <div className="assay-field">
              <label>Zn:</label>
              <input
                type="number"
                name="assay_zn"
                value={formData.assay_zn || ''}
                onChange={handleChange}
                placeholder="0"
              />
              <span>%</span>
            </div>
            <div className="assay-field">
              <label>Cu:</label>
              <input
                type="number"
                name="assay_cu"
                value={formData.assay_cu || ''}
                onChange={handleChange}
                placeholder="0"
              />
              <span>%</span>
            </div>
            <div className="assay-field">
              <label>Ag:</label>
              <input
                type="number"
                name="assay_ag"
                value={formData.assay_ag || ''}
                onChange={handleChange}
                placeholder="0"
              />
              <span>g/t</span>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="china_import_compliant"
                checked={formData.china_import_compliant || false}
                onChange={handleChange}
              />
              Material complies with China import standards
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="free_of_harmful_impurities"
                checked={formData.free_of_harmful_impurities || false}
                onChange={handleChange}
              />
              Free of harmful impurities (Pb, Cd, Hg, etc.)
            </label>
          </div>

          <button className="add-quality-btn" onClick={handleAddQuality}>Add Quality</button>
        </div>

        {/* Right Column: Pricing & Charges */}
        <div className="commercial-column">
          <h3>Pricing & Charges</h3>
          
          <div className="form-group">
            <label>Treatment Charge (TC)</label>
            <div className="input-with-unit">
              <input
                type="number"
                name="treatment_charge"
                value={formData.treatment_charge || ''}
                onChange={handleChange}
                placeholder="0"
              />
              <span>USD dmt</span>
            </div>
            {aiSuggestions.tc && (
              <div className="ai-suggestion">
                {aiSuggestions.tc}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Refining Charge for Ag (RC)</label>
            <div className="input-with-unit">
              <input
                type="number"
                name="refining_charge"
                value={formData.refining_charge || ''}
                onChange={handleChange}
                placeholder="0"
              />
              <span>USD toz</span>
            </div>
            {aiSuggestions.rc && (
              <div className="ai-suggestion warning">
                {aiSuggestions.rc}
              </div>
            )}
            {aiSuggestions.rc && (
              <div className="suggestion-buttons">
                <button className="keep-btn" onClick={handleKeepCurrentRC}>
                  Keep Current Value
                </button>
                <button className="use-suggested-btn" onClick={handleUseSuggestedRC}>
                  Apply Suggestion
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <button 
              className="ai-suggest-btn" 
              onClick={handleAISuggest}
              disabled={!formData.treatment_charge && !formData.refining_charge}
            >
              🤖 AI Suggest
            </button>
          </div>

          <div className="form-group">
            <label>Additional Terms</label>
            <button className="edit-clauses-btn">Edit Clauses</button>
            <div className="clauses-list">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                No transportation credit to Buyer or Seller
              </label>
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                No other payables shall apply
              </label>
              <label className="checkbox-label">
                <input type="checkbox" />
                No other deductions shall apply, subject to assay compliance
              </label>
            </div>
            <button className="add-clause-btn" onClick={handleAddClause}>Add Clause</button>
          </div>
        </div>
      </div>

      <div className="commercial-footer">
        <button onClick={handleProceed} className="proceed-btn">Review & Submit →</button>
      </div>

      {/* Quality Modal */}
      {showQualityModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Quality Specification</h3>
            <p>Quality modal content would go here...</p>
            <button onClick={() => setShowQualityModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Clause Modal */}
      {showClauseModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Custom Clause</h3>
            <p>Clause modal content would go here...</p>
            <button onClick={() => setShowClauseModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
} 