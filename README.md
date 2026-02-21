# StyleSai - AI Fashion Platform

An AI-powered personalized fashion recommendation platform built with FastAPI, HTML, CSS, and JavaScript.

## Features

- **Personalized Styling Advice** - AI-powered fashion recommendations
- **Outfit Matching** - When you select a product, get matching items (pants, footwear, accessories)
- **Image-Based Analysis** - Upload clothing images for AI analysis using Hugging Face CLIP
- **Trend-Aware Suggestions** - Stay updated with latest fashion trends
- **Interactive UI** - Modern, responsive design

## Tech Stack

### Backend
- **FastAPI** - Python web framework
- **Google Gemini API** - For AI styling advice and outfit recommendations
- **Hugging Face** - CLIP model for image analysis
- **Groq** - Fast LLM inference

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Responsive design
- Modern UI/UX

## Project Structure

```
stylesaii/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── ai_services/
│   │   ├── gemini_service.py   # Gemini AI integration
│   │   ├── huggingface_service.py  # Hugging Face models
│   │   └── groq_service.py     # Groq integration
│   ├── models/
│   │   └── product.py          # Product models
│   ├── data/
│   │   └── products.json       # Product database (90 products)
│   └── routers/
│       ├── products.py         # Product endpoints
│       ├── cart.py             # Cart + Checkout endpoints
│       └── recommendations.py   # AI recommendation endpoints
├── frontend/
│   ├── index.html              # Main page
│   ├── css/
│   │   └── style.css           # Styles
│   └── js/
│       ├── api.js              # API calls
│       ├── cart.js             # Cart + Checkout functionality
│       ├── ai.js               # AI features
│       └── app.js              # Main application
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js (optional)
- API keys:
  - Google Gemini API key (configured in backend)

### Step 1: Install Python Dependencies

```
bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start the Backend Server

```
bash
cd backend
python main.py
```

The API will start at `http://localhost:8000`

### Step 3: Open the Frontend

Open `frontend/index.html` in your browser, or serve it:

```
bash
# Using Python
cd frontend
python -m http.server 8080

# Then open http://localhost:8080
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get single product
- `GET /api/products/category/{category}` - Get by category
- `GET /api/products/subcategory/{subcategory}` - Get by subcategory

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/{id}` - Remove item
- `POST /api/cart/checkout` - Place order
- `POST /api/cart/apply-coupon` - Apply coupon

### AI Recommendations
- `POST /api/recommend/outfit` - Get outfit recommendations
- `POST /api/recommend/match` - Get matching items
- `POST /api/recommend/analyze-image` - Analyze uploaded image
- `GET /api/recommend/trends/{category}` - Get trends

## Coupon Codes

Available coupons:
- `STYLE10` - 10% off
- `STYLE20` - 20% off
- `NEWUSER` - 15% off
- `FASHION25` - 25% off

## Running the Full Application

1. **Start Backend:**
   
```
bash
   cd backend
   python main.py
   
```

2. **Open Frontend:**
   - Navigate to `frontend/index.html` in your browser
   - Or use a local server: `cd frontend && python -m http.server 8080`

3. **Test Features:**
   - Browse products across categories (Men, Women, Kids, GenZ)
   - Click on a product to see details
   - Add products to cart
   - Use checkout with delivery address and payment options
   - Apply coupon codes
   - Use AI features (chat, image upload, outfit builder)

## Categories Available

### Men's Wear
- Shirts, T-Shirts, Blazers, Hoodies, Sweatshirts
- Pants, Footwear, Accessories

### Women's Wear
- Tops, Dresses, Long Frocks, Sleeveless, Ethnic Wear
- Bottoms, Footwear, Accessories

### Kids Wear
- Boys, Girls, Accessories

### GenZ
- Oversized, Cargo, Hoodies, Pants, Jackets, Footwear, Accessories

## Deployment

### Production Deployment

1. **Backend (Railway/Render/Heroku):**
   - Push code to GitHub
   - Connect to Railway/Render
   - Set environment variables
   - Deploy

2. **Frontend (Netlify/Vercel):**
   - Build the frontend
   - Deploy static files

## License

MIT License

---

Built with ❤️ using FastAPI, Gemini AI, Hugging Face, and Groq
