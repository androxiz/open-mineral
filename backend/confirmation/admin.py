from django.contrib import admin
from .models import (
    Material, Buyer, BusinessConfirmation, ProcessingTask,
    DeliveryTerm, DeliveryPoint, Packaging, TransportMode,
    PaymentMethod, Currency, TriggeringEvent, Surveyor
)

# Register your models here.

admin.site.register(Material)
admin.site.register(Buyer)
admin.site.register(BusinessConfirmation)
admin.site.register(ProcessingTask)
admin.site.register(DeliveryTerm)
admin.site.register(DeliveryPoint)
admin.site.register(Packaging)
admin.site.register(TransportMode)
admin.site.register(PaymentMethod)
admin.site.register(Currency)
admin.site.register(TriggeringEvent)
admin.site.register(Surveyor)
