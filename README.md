# Business Confirmation Flow

A multi-step business confirmation application built with React frontend and Django REST API backend, featuring AI-powered pricing suggestions and background task processing.

## 🎯 Overview

This application allows traders to input and validate critical deal information before contract execution. It implements a comprehensive 5-step form with AI validation, background processing, and real-time status updates.

## 🏗️ Architecture

- **Frontend**: React.js with modern UI/UX
- **Backend**: Django REST Framework API
- **Database**: SQLite (development) / PostgreSQL (production)
- **Task Queue**: Celery with Redis broker
- **AI Integration**: Google Gemini API for pricing suggestions
- **Containerization**: Docker & Docker Compose

## 🚀 Features

### Multi-Step Form Flow
1. **Deal Basics**: Seller, Buyer, Material, Quantity with validation
2. **Commercial Terms**: Delivery, Assay/Quality, Pricing & Charges with AI suggestions
3. **Payment Terms**: Payment Method, Stages, WSMD & Surveyor
4. **Review & Submit**: AI validation with background task processing
5. **Summary Page**: Deal overview with interactive charts and actions

### AI-Powered Features
- **Smart Pricing Suggestions**: TC/RC recommendations based on market data
- **AI Validation**: Real-time deal validation and warnings
- **Button-Triggered AI**: Manual AI suggestion requests for better UX

### Background Processing
- **Celery Tasks**: 15-second simulated processing
- **Real-time Polling**: Frontend status updates
- **Task Completion**: Database status tracking

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

## 🛠️ Installation & Setup

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd open_mineral
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env-example .env
   
   # Edit .env file and add your Gemini API key
   # Get your key from: https://makersuite.google.com/app/apikey
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/
   - Django Admin: http://localhost:8000/admin/

### Option 2: Local Development

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Start Celery Worker**
   ```bash
   cd backend
   celery -A backend worker --loglevel=info --pool=solo
   ```

4. **Start Redis**
   ```bash
   redis-server
   ```

## 🗄️ Database Setup

The application uses SQLite by default for development. For production, configure PostgreSQL in your environment variables.

### Database Migrations
```bash
# For Docker setup
docker-compose exec backend python manage.py migrate

# For local setup
cd backend
python manage.py migrate
```

## 🔧 Configuration

### Environment Variables

The project includes a `.env-example` file with all required and optional variables. To set up your environment:

1. **Copy the example file:**
   ```bash
   cp .env-example .env
   ```

2. **Edit the .env file** and replace the placeholder values with your actual configuration:
   - `GEMINI_API_KEY`: Your Google Gemini API key (required)
   - `DEBUG`: Set to `False` for production
   - `DATABASE_URL`: PostgreSQL connection string for production
   - `REDIS_URL`: Redis connection string for production

**Required Variables:**
- `GEMINI_API_KEY`: Get your key from [Google AI Studio](https://makersuite.google.com/app/apikey)

**Optional Variables (for production):**
- `DEBUG`: Set to `False`
- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection
- `SECRET_KEY`: Django secret key
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts

### Django Settings

Key settings in `backend/settings.py`:
- `CELERY_BROKER_URL`: Redis connection
- `CORS_ALLOWED_ORIGINS`: Frontend communication
- `REST_FRAMEWORK`: API configuration

## 📱 Usage

### Step 1: Deal Basics
- Select buyer from dropdown
- Choose material type
- Enter quantity with tolerance
- Validation ensures required fields

### Step 2: Commercial Terms
- Configure delivery terms and packaging
- Upload assay files (mocked)
- Set TC/RC with AI suggestions
- Click "AI Suggest" for pricing recommendations

### Step 3: Payment Terms
- Select payment method and currency
- Set prepayment percentage with slider
- Configure cost sharing (50/50 default)
- Edit pre-filled industry clauses

### Step 4: Review & Submit
- Review all form data
- AI validation shows warnings
- Submit triggers 15-second background task
- Real-time status polling

### Step 5: Summary
- Deal overview with key metrics
- Interactive market trends chart
- Action buttons for PDF download, sharing
- Success confirmation on task completion

## 🔌 API Endpoints

### Core Endpoints
- `GET /api/buyers/` - List buyers
- `GET /api/materials/` - List materials
- `POST /api/business-confirmations/` - Create confirmation
- `POST /api/ai-suggestions/` - Get AI pricing suggestions

### Task Management
- `POST /api/trigger-processing/` - Start background task
- `GET /api/task-status/<task_id>/` - Check task status

### Step 3 Data
- `GET /api/payment-methods/` - Payment methods
- `GET /api/currencies/` - Available currencies
- `GET /api/triggering-events/` - Payment triggers
- `GET /api/surveyors/` - Surveyor companies

## 🤖 AI Integration

### Gemini API Setup
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `.env` file
3. AI suggestions work automatically

### AI Features
- **TC/RC Suggestions**: Market-based pricing recommendations
- **Validation Warnings**: Deal risk assessment
- **Smart Fallbacks**: Works without API key

## 🐳 Docker Services

- **backend**: Django API server
- **frontend**: React development server
- **celery**: Background task worker
- **redis**: Message broker

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 Monitoring

### Celery Monitoring
```bash
# Monitor task queue
celery -A backend flower

# Check worker status
celery -A backend inspect active
```

### Logs
```bash
# View all logs
docker-compose logs

# View specific service
docker-compose logs backend
docker-compose logs celery
```

## 🚀 Deployment

### Production Setup
1. Update `DEBUG=False` in settings
2. Configure production database
3. Set up proper CORS origins
4. Use production Redis instance
5. Configure static file serving

### Environment Variables for Production
```env
# Copy from .env-example and update these values:
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://username:password@host:5432/database
REDIS_URL=redis://username:password@host:6379/0
GEMINI_API_KEY=your_actual_gemini_api_key
SECRET_KEY=your_django_secret_key
```

## 🐛 Troubleshooting

### Common Issues

1. **Celery Connection Error**
   ```bash
   # Check Redis is running
   docker-compose logs redis
   
   # Restart Celery
   docker-compose restart celery
   ```

2. **Frontend API Connection**
   - Verify `REACT_APP_API_URL` in frontend/.env
   - Check CORS settings in Django

3. **AI Suggestions Not Working**
   - Verify `GEMINI_API_KEY` is set
   - Check API key permissions
   - Review backend logs for errors

4. **Task Status Polling Fails**
   - Ensure `lookup_url_kwarg` is set in views
   - Check task ID format in URLs

### Debug Commands
```bash
# Check service status
docker-compose ps

# View real-time logs
docker-compose logs -f

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 📝 Development

### Code Structure
```
open_mineral/
├── backend/
│   ├── confirmation/          # Main Django app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API endpoints
│   │   ├── serializers.py    # DRF serializers
│   │   └── urls.py           # URL routing
│   ├── settings.py           # Django settings
│   └── celery.py             # Celery configuration
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Step1DealBasics.jsx
│   │   │   ├── Step2CommercialTerms.jsx
│   │   │   ├── Step3PaymentTerms.jsx
│   │   │   ├── Step4ReviewSubmit.jsx
│   │   │   └── Step5Summary.jsx
│   │   └── App.js            # Main app component
│   └── package.json
├── docker-compose.yml        # Service orchestration
└── README.md
```

### Adding New Features
1. **Backend**: Add models, views, serializers
2. **Frontend**: Create React components
3. **API**: Update URL patterns
4. **Testing**: Add unit tests

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the logs for error details

---

**Built with ❤️ using React, Django, Celery, and Docker** 