from django.db import models

# Create your models here.

class Material(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Buyer(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class DeliveryTerm(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class DeliveryPoint(models.Model):
    name = models.CharField(max_length=100)
    country = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name

class Packaging(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class TransportMode(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class PaymentMethod(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Currency(models.Model):
    code = models.CharField(max_length=3, unique=True)
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=5)
    
    def __str__(self):
        return f"{self.code} ({self.name})"

class TriggeringEvent(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Surveyor(models.Model):
    name = models.CharField(max_length=100)
    company = models.CharField(max_length=100)
    contact_info = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.name} - {self.company}"

class BusinessConfirmation(models.Model):
    # Step 1 fields
    seller = models.CharField(max_length=100, default="Open Mineral Ltd")
    buyer = models.ForeignKey(Buyer, on_delete=models.CASCADE, blank=True, null=True)
    material = models.ForeignKey(Material, on_delete=models.CASCADE, blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    quantity_tolerance = models.DecimalField(max_digits=5, decimal_places=2, default=5.0)
    
    # Step 2 fields
    delivery_term = models.ForeignKey(DeliveryTerm, on_delete=models.CASCADE, blank=True, null=True)
    delivery_point = models.ForeignKey(DeliveryPoint, on_delete=models.CASCADE, blank=True, null=True)
    packaging = models.ForeignKey(Packaging, on_delete=models.CASCADE, blank=True, null=True)
    transport_mode = models.ForeignKey(TransportMode, on_delete=models.CASCADE, blank=True, null=True)
    inland_freight_buyer = models.BooleanField(default=False)
    shipment_period_from = models.DateField(blank=True, null=True)
    shipment_period_to = models.DateField(blank=True, null=True)
    shipments_evenly_distributed = models.BooleanField(default=False)
    
    # Assay fields
    assay_file = models.FileField(upload_to='assay_files/', blank=True, null=True)
    assay_pb = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    assay_zn = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    assay_cu = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    assay_ag = models.DecimalField(max_digits=8, decimal_places=2, blank=True, null=True)
    china_import_compliant = models.BooleanField(default=False)
    free_of_harmful_impurities = models.BooleanField(default=False)
    
    # Pricing fields
    treatment_charge = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    refining_charge = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Step 3: Payment Terms fields
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.CASCADE, blank=True, null=True)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, blank=True, null=True)
    triggering_event = models.ForeignKey(TriggeringEvent, on_delete=models.CASCADE, blank=True, null=True)
    
    # Payment Stages
    prepayment_percentage = models.IntegerField(default=0, help_text="Prepayment percentage (0-100)")
    provisional_payment = models.TextField(blank=True, help_text="Provisional payment terms")
    final_payment = models.TextField(blank=True, help_text="Final payment terms")
    
    # WSMD & Surveyor
    final_location = models.CharField(max_length=200, blank=True)
    cost_sharing_buyer = models.IntegerField(default=50, help_text="Cost sharing percentage for buyer (0-100)")
    cost_sharing_seller = models.IntegerField(default=50, help_text="Cost sharing percentage for seller (0-100)")
    nominated_surveyor = models.ForeignKey(Surveyor, on_delete=models.CASCADE, blank=True, null=True)
    
    # Clause texts (pre-filled with industry standards)
    payment_clause = models.TextField(blank=True, default="Payment shall be made within 30 days of invoice date")
    surveyor_clause = models.TextField(blank=True, default="Surveyor shall be mutually agreed upon by both parties")
    wsmd_clause = models.TextField(blank=True, default="Weighing, sampling, moisture determination and analysis shall be carried out at final destination")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Business Confirmation {self.id} - {self.buyer} - {self.material}"

class ProcessingTask(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    business_confirmation = models.ForeignKey(BusinessConfirmation, on_delete=models.CASCADE, related_name='processing_tasks')
    celery_task_id = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Task {self.celery_task_id} for Confirmation {self.business_confirmation_id} - {self.status}"
