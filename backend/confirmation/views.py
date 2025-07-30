from django.shortcuts import render
from rest_framework import generics
from .models import Material, Buyer, BusinessConfirmation, ProcessingTask, DeliveryTerm, DeliveryPoint, Packaging, TransportMode, PaymentMethod, Currency, TriggeringEvent, Surveyor
from .serializers import (
    MaterialSerializer, BuyerSerializer, BusinessConfirmationSerializer, ProcessingTaskSerializer,
    DeliveryTermSerializer, DeliveryPointSerializer, PackagingSerializer, TransportModeSerializer,
    PaymentMethodSerializer, CurrencySerializer, TriggeringEventSerializer, SurveyorSerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from celery import shared_task
import time
import os
import requests
import google.generativeai as genai
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view
from dotenv import load_dotenv
load_dotenv()

# Cache for AI suggestions to prevent too frequent API calls
ai_suggestions_cache = {}
CACHE_DURATION = 30  # seconds (increased since manual requests)
MIN_REQUEST_INTERVAL = 0  # no rate limiting for manual requests

# Create your views here.

class MaterialListView(generics.ListAPIView):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

class BuyerListView(generics.ListAPIView):
    queryset = Buyer.objects.all()
    serializer_class = BuyerSerializer

class BusinessConfirmationCreateView(generics.CreateAPIView):
    queryset = BusinessConfirmation.objects.all()
    serializer_class = BusinessConfirmationSerializer

# Celery task definition
@shared_task(bind=True)
def process_confirmation_task(self, processing_task_id):
    try:
        print(f"Starting processing task for ID: {processing_task_id}")
        time.sleep(15)  # Simulate processing for 15 seconds
        from .models import ProcessingTask
        task = ProcessingTask.objects.get(id=processing_task_id)
        task.status = 'completed'
        task.completed_at = timezone.now()
        task.save()
        print(f"Task {processing_task_id} completed successfully")
        return 'completed'
    except Exception as e:
        print(f"Task {processing_task_id} failed: {e}")
        return 'failed'

class TriggerProcessingTaskView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            confirmation_id = request.data.get('business_confirmation_id')
            if not confirmation_id:
                return Response({'error': 'business_confirmation_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            print(f"Creating processing task for confirmation ID: {confirmation_id}")
            
            processing_task = ProcessingTask.objects.create(
                business_confirmation_id=confirmation_id,
                status='pending',
                celery_task_id='pending',
            )
            
            # Trigger the Celery task
            celery_task = process_confirmation_task.apply_async(args=[processing_task.id])
            processing_task.celery_task_id = celery_task.id
            processing_task.save()
            
            print(f"Task created with ID: {celery_task.id}")
            
            serializer = ProcessingTaskSerializer(processing_task)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating task: {e}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProcessingTaskStatusView(generics.RetrieveAPIView):
    queryset = ProcessingTask.objects.all()
    serializer_class = ProcessingTaskSerializer
    lookup_field = 'celery_task_id'
    lookup_url_kwarg = 'task_id'

class DeliveryTermListView(generics.ListAPIView):
    queryset = DeliveryTerm.objects.all()
    serializer_class = DeliveryTermSerializer

class DeliveryPointListView(generics.ListAPIView):
    queryset = DeliveryPoint.objects.all()
    serializer_class = DeliveryPointSerializer

class PackagingListView(generics.ListAPIView):
    queryset = Packaging.objects.all()
    serializer_class = PackagingSerializer

class TransportModeListView(generics.ListAPIView):
    queryset = TransportMode.objects.all()
    serializer_class = TransportModeSerializer

class PaymentMethodListView(generics.ListAPIView):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer

class CurrencyListView(generics.ListAPIView):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer

class TriggeringEventListView(generics.ListAPIView):
    queryset = TriggeringEvent.objects.all()
    serializer_class = TriggeringEventSerializer

class SurveyorListView(generics.ListAPIView):
    queryset = Surveyor.objects.all()
    serializer_class = SurveyorSerializer

@api_view(['POST'])
def ai_suggestions(request):
    """Generate AI suggestions for pricing based on form data"""
    try:
        data = request.data
        material = data.get('material', '')
        treatment_charge = data.get('treatment_charge', '')
        refining_charge = data.get('refining_charge', '')
        delivery_point = data.get('delivery_point', '')
        
        # Create cache key based on input data
        cache_key = f"{material}_{treatment_charge}_{refining_charge}_{delivery_point}"
        current_time = time.time()
        
        # Clear cache if values are changing (to avoid partial value issues)
        if treatment_charge or refining_charge:
            # Clear old cache entries that might interfere
            keys_to_remove = [k for k in ai_suggestions_cache.keys() if k != cache_key]
            for key in keys_to_remove:
                del ai_suggestions_cache[key]
        
        # Check if we have cached result and it's recent enough
        if cache_key in ai_suggestions_cache:
            cached_data, cached_time = ai_suggestions_cache[cache_key]
            if current_time - cached_time < CACHE_DURATION:
                print(f"Returning cached AI suggestion for key: {cache_key}")
                return Response(cached_data)
        
        # Get Gemini API key from environment
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        
        # Smart analysis without AI (fallback)
        tc_suggestion = generate_tc_suggestion(treatment_charge, material)
        rc_suggestion = generate_rc_suggestion(refining_charge, material)
        
        if gemini_api_key:
            try:
                # Configure Gemini API
                genai.configure(api_key=gemini_api_key)
                
                # Create model
                model = genai.GenerativeModel('gemini-2.5-flash')
                
                # Prepare prompt
                prompt = f"""Analyze this business confirmation data and provide specific pricing suggestions:
                - Material: {material}
                - Treatment Charge: {treatment_charge or 'Not set'}
                - Refining Charge: {refining_charge or 'Not set'}
                - Delivery Point: {delivery_point}
                
                Provide specific market insights and pricing recommendations. 
                Format your response exactly as:
                TC: [specific suggestion with reasoning]
                RC: [specific suggestion with reasoning]
                
                Keep each suggestion under 50 words."""
                
                print(f"Sending prompt to Gemini: {prompt}")  # Debug log
                
                # Generate content using Gemini
                response = model.generate_content(prompt)
                
                print(f"Gemini API response: {response.text}")  # Debug log
                
                if response.text:
                    ai_response = response.text.strip()
                    # Parse AI response for TC and RC suggestions
                    if 'TC:' in ai_response and 'RC:' in ai_response:
                        tc_part = ai_response.split('TC:')[1].split('RC:')[0].strip()
                        rc_part = ai_response.split('RC:')[1].strip()
                        tc_suggestion = f"AI: {tc_part}"
                        rc_suggestion = f"AI: {rc_part}"
                    else:
                        # If AI response doesn't have proper format, use AI response for TC and fallback for RC
                        tc_suggestion = f"AI: {ai_response}"
                        rc_suggestion = generate_rc_suggestion(refining_charge, material)
                else:
                    print("Gemini API returned empty response")  # Debug log
                    
            except Exception as e:
                print(f"AI API call failed: {e}")
                # Use fallback suggestions (already set above)
        else:
            print("No Gemini API key found, using fallback")  # Debug log
        
        # Cache the result
        result = {
            'tc_suggestion': tc_suggestion,
            'rc_suggestion': rc_suggestion,
            'source': 'ai' if gemini_api_key else 'fallback'
        }
        ai_suggestions_cache[cache_key] = (result, current_time)
        
        return Response(result)
        
    except Exception as e:
        return Response({
            'error': str(e),
            'tc_suggestion': 'Industry average TC for Lead: $310-$325/dmt',
            'rc_suggestion': 'Your RC is higher than average, adjust to $4.50?',
            'source': 'fallback'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def generate_tc_suggestion(tc_value, material):
    """Generate smart TC suggestions based on input value"""
    try:
        tc = float(tc_value) if tc_value else 0
    except:
        tc = 0
    
    if tc == 0:
        return "Industry average TC for Lead: $310-$325/dmt"
    elif tc > 350:
        return f"⚠️ Your TC (${tc}) is above market average. Consider $320-$330 for better competitiveness."
    elif tc < 280:
        return f"💡 Your TC (${tc}) is below market. Consider $310-$320 for fair pricing."
    elif 300 <= tc <= 330:
        return f"✅ Your TC (${tc}) is within market range. Good pricing!"
    else:
        return f"📊 Your TC (${tc}) is competitive. Market range: $310-$325/dmt"

def generate_rc_suggestion(rc_value, material):
    """Generate smart RC suggestions based on input value"""
    try:
        rc = float(rc_value) if rc_value else 0
    except:
        rc = 0
    
    if rc == 0:
        return "Market average RC for Ag: $4.20-$4.50/toz"
    elif rc > 5.00:
        return f"⚠️ Your RC (${rc}) is high. Suggest $4.50 for market competitiveness."
    elif rc < 3.50:
        return f"💡 Your RC (${rc}) is low. Consider $4.20 for fair pricing."
    elif 4.00 <= rc <= 4.60:
        return f"✅ Your RC (${rc}) is within market range. Good pricing!"
    else:
        return f"📊 Your RC (${rc}) is competitive. Market range: $4.20-$4.50/toz"

@api_view(['POST'])
def parse_assay_file(request):
    """Parse Excel file and extract assay data"""
    if 'file' not in request.FILES:
        return Response({'error': 'No file uploaded'}, status=400)
    
    file = request.FILES['file']
    
    # Check file extension
    if not file.name.lower().endswith(('.xlsx', '.xls', '.csv')):
        return Response({'error': 'Unsupported file format. Please upload .xlsx, .xls, or .csv file'}, status=400)
    
    try:
        import pandas as pd
        
        # Read the file based on extension
        if file.name.lower().endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
        
        # Try to find assay columns with different possible names
        assay_data = {}
        
        # Lead (Pb) - try different column names
        pb_columns = ['Pb', 'Lead', 'PB', 'pb', 'lead']
        for col in pb_columns:
            if col in df.columns:
                assay_data['assay_pb'] = float(df[col].iloc[0]) if len(df) > 0 else 0
                break
        else:
            assay_data['assay_pb'] = 0
        
        # Zinc (Zn) - try different column names
        zn_columns = ['Zn', 'Zinc', 'ZN', 'zn', 'zinc']
        for col in zn_columns:
            if col in df.columns:
                assay_data['assay_zn'] = float(df[col].iloc[0]) if len(df) > 0 else 0
                break
        else:
            assay_data['assay_zn'] = 0
        
        # Copper (Cu) - try different column names
        cu_columns = ['Cu', 'Copper', 'CU', 'cu', 'copper']
        for col in cu_columns:
            if col in df.columns:
                assay_data['assay_cu'] = float(df[col].iloc[0]) if len(df) > 0 else 0
                break
        else:
            assay_data['assay_cu'] = 0
        
        # Silver (Ag) - try different column names
        ag_columns = ['Ag', 'Silver', 'AG', 'ag', 'silver']
        for col in ag_columns:
            if col in df.columns:
                assay_data['assay_ag'] = float(df[col].iloc[0]) if len(df) > 0 else 0
                break
        else:
            assay_data['assay_ag'] = 0
        
        # Add file info
        assay_data['file_name'] = file.name
        assay_data['file_size'] = file.size
        
        return Response({
            'success': True,
            'data': assay_data,
            'message': f'Successfully parsed {file.name}'
        })
        
    except Exception as e:
        return Response({
            'error': f'Error parsing file: {str(e)}',
            'message': 'Please ensure your file contains columns with element names (Pb, Zn, Cu, Ag)'
        }, status=400)
