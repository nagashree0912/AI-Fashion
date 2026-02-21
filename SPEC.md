# StyleSai - AI Fashion Platform Specification

## Project Overview
- **Project Name**: StyleSai - AI-Powered Personal Fashion Stylist
- **Type**: Full-stack Web Application (FastAPI + HTML/CSS/JS)
- **Core Functionality**: AI-powered personalized fashion recommendations with outfit matching
- **Target Users**: Fashion-conscious individuals seeking personalized styling advice

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **AI Integration**: 
  - Google Gemini API (for styling advice and recommendations)
  - Hugging Face (for image analysis using CLIP)
  - Groq (for fast LLM inference)
- **Database**: In-memory JSON-based (for demo)

### Frontend
- **Technologies**: HTML5, CSS3, Vanilla JavaScript
- **Structure**: Separate frontend folder with modern UI

## AI Model Recommendations (Hugging Face)

### 1. Image-Based Analysis
- **Model**: `openai/clip-vit-large-patch14`
- **Use Case**: Analyze clothing images, detect fashion items, extract visual features
- **Alternative**: `laion/CLIP-ViT-L-14-DataComp.XL-S1M` for faster inference

### 2. Outfit Compatibility
- **Model**: `Baidu-Research/OutfitCompatibility` 
- **Use Case**: Determine if items match together
- **Alternative**: Custom trained fashion compatibility model

### 3. Fashion Classification
- **Model**: `IDEA-Research/FashionGPT` 
- **Use Case**: Classify clothing categories, colors, styles

### 4. Trend Analysis
- **Model**: `facebook/bart-large-mnli` (for trend classification)
- **Use Case**: Categorize fashion trends

### 5. Personalized Recommendations
- **Model**: `sentence-transformers/all-MiniLM-L6-v2` (for user preference matching)
- **Use Case**: Match user preferences with products

## Features

### 1. Product Catalog
- Men's Wear (Shirts, Pants, Accessories, Footwear)
- Women's Wear (Dresses, Tops, Bottoms, Accessories, Footwear)
- Kids Wear (Boys, Girls, Accessories)

### 2. AI Features
- Personalized outfit recommendations
- Image-based clothing analysis
- Smart outfit matching (shirt + pants + accessories + footwear)
- Trend-aware suggestions
- Interactive styling assistant

### 3. Shopping Cart
- Add/remove products
- View cart total
- AI-suggested complementary items

### 4. User Interface
- Responsive design
- Product filtering by category
- AI recommendation panel
- Visual outfit builder

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
│   │   └── products.json        # Product database
│   └── routers/
│       ├── products.py         # Product endpoints
│       ├── cart.py             # Cart endpoints
│       └── recommendations.py  # AI recommendation endpoints
├── frontend/
│   ├── index.html              # Main page
│   ├── css/
│   │   └── style.css           # Styles
│   ├── js/
│   │   ├── app.js              # Main application
│   │   ├── api.js              # API calls
│   │   ├── cart.js             # Cart functionality
│   │   └── ai.js               # AI features
│   └── assets/
│       └── images/             # Product images
└── SPEC.md
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/{category}` - Get products by category
- `GET /api/products/{id}` - Get single product

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/{id}` - Remove item from cart

### AI Recommendations
- `POST /api/recommend/outfit` - Get outfit recommendations
- `POST /api/recommend/match` - Get matching items for selected product
- `POST /api/analyze/image` - Analyze clothing image

## Deployment Steps

1. Install Python dependencies
2. Set up environment variables
3. Run backend server
4. Open frontend in browser
5. Test all features

## Acceptance Criteria

1. ✅ Products display correctly for all categories
2. ✅ Cart functionality works (add/remove items)
3. ✅ AI recommendations return matching outfits
4. ✅ Image analysis works with uploaded images
5. ✅ Responsive UI on all devices
6. ✅ No errors in console
7. ✅ FastAPI backend runs without issues
