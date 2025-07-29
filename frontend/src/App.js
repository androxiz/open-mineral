import React, { useState } from 'react';
import Step1DealBasics from './components/Step1DealBasics';
import Step2CommercialTerms from './components/Step2CommercialTerms';
import Step3PaymentTerms from './components/Step3PaymentTerms';
import Step4ReviewSubmit from './components/Step4ReviewSubmit';
import Step5Summary from './components/Step5Summary';
import './App.css';

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    seller: 'Open Mineral Ltd',
    buyer: '',
    material: '',
    quantity: '',
    quantity_tolerance: 5.0,
    
    // Step 2
    delivery_term: '',
    delivery_point: '',
    packaging: '',
    transport_mode: '',
    inland_freight_buyer: false,
    shipment_period_from: '',
    shipment_period_to: '',
    shipments_evenly_distributed: false,
    assay_file: null,
    assay_pb: '',
    assay_zn: '',
    assay_cu: '',
    assay_ag: '',
    china_import_compliant: false,
    free_of_harmful_impurities: false,
    treatment_charge: '',
    refining_charge: '',
    
    // Step 3
    payment_method: '',
    currency: '',
    triggering_event: '',
    prepayment_percentage: 0,
    provisional_payment: '',
    final_payment: '',
    final_location: '',
    cost_sharing_buyer: 50,
    cost_sharing_seller: 50,
    nominated_surveyor: '',
    payment_clause: 'Payment shall be made within 30 days of invoice date',
    surveyor_clause: 'Surveyor shall be mutually agreed upon by both parties',
    wsmd_clause: 'Weighing, sampling, moisture determination and analysis shall be carried out at final destination'
  });
  const [taskStatus, setTaskStatus] = useState(null);

  const handleProceed = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="App" style={{ background: '#111', minHeight: '100vh' }}>
      {step === 1 && (
        <Step1DealBasics 
          formData={formData} 
          setFormData={setFormData} 
          onProceed={handleProceed} 
        />
      )}
      {step === 2 && (
        <Step2CommercialTerms 
          formData={formData} 
          setFormData={setFormData} 
          onProceed={handleProceed} 
          onBack={handleBack} 
        />
      )}
      {step === 3 && (
        <Step3PaymentTerms 
          formData={formData} 
          setFormData={setFormData} 
          onProceed={handleProceed} 
          onBack={handleBack} 
        />
      )}
      {step === 4 && (
        <Step4ReviewSubmit 
          formData={formData} 
          setFormData={setFormData} 
          onProceed={handleProceed} 
          onBack={handleBack}
          setTaskStatus={setTaskStatus}
        />
      )}
      {step === 5 && (
        <Step5Summary 
          formData={formData}
          taskStatus={taskStatus}
        />
      )}
    </div>
  );
}

export default App;
