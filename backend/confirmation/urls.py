from django.urls import path
from . import views

urlpatterns = [
    path('materials/', views.MaterialListView.as_view(), name='material-list'),
    path('buyers/', views.BuyerListView.as_view(), name='buyer-list'),
    path('business-confirmations/', views.BusinessConfirmationCreateView.as_view(), name='business-confirmation-create'),
    path('trigger-processing/', views.TriggerProcessingTaskView.as_view(), name='trigger-processing'),
    path('task-status/<str:task_id>/', views.ProcessingTaskStatusView.as_view(), name='task-status'),
    path('delivery-terms/', views.DeliveryTermListView.as_view(), name='delivery-term-list'),
    path('delivery-points/', views.DeliveryPointListView.as_view(), name='delivery-point-list'),
    path('packaging/', views.PackagingListView.as_view(), name='packaging-list'),
    path('transport-modes/', views.TransportModeListView.as_view(), name='transport-mode-list'),
    path('payment-methods/', views.PaymentMethodListView.as_view(), name='payment-method-list'),
    path('currencies/', views.CurrencyListView.as_view(), name='currency-list'),
    path('triggering-events/', views.TriggeringEventListView.as_view(), name='triggering-event-list'),
    path('surveyors/', views.SurveyorListView.as_view(), name='surveyor-list'),
    path('ai-suggestions/', views.ai_suggestions, name='ai-suggestions'),
    path('parse-assay-file/', views.parse_assay_file, name='parse-assay-file'),
] 