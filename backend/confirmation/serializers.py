from rest_framework import serializers
from .models import (
    Material, Buyer, BusinessConfirmation, ProcessingTask,
    DeliveryTerm, DeliveryPoint, Packaging, TransportMode,
    PaymentMethod, Currency, TriggeringEvent, Surveyor
)

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class BuyerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Buyer
        fields = '__all__'

class BusinessConfirmationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessConfirmation
        fields = '__all__'

class ProcessingTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcessingTask
        fields = '__all__'

class DeliveryTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryTerm
        fields = '__all__'

class DeliveryPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryPoint
        fields = '__all__'

class PackagingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Packaging
        fields = '__all__'

class TransportModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportMode
        fields = '__all__'

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'

class TriggeringEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TriggeringEvent
        fields = '__all__'

class SurveyorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Surveyor
        fields = '__all__' 