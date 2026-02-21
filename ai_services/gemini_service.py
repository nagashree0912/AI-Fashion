# Suppress warnings
import warnings
warnings.filterwarnings('ignore', category=FutureWarning)

import json
import re
from typing import List, Dict, Any
from models.product import Product, OutfitRecommendation

# Configure Gemini
GEMINI_API_KEY = "AIzaSyCdyV_rVBiXgG7AeoJxeA0xdrsWVClk0is"

# Try to import and configure Gemini
try:
    import google.genai as genai
    client = genai.Client(api_key=GEMINI_API_KEY)
    USE_NEW_API = True
except Exception as e:
    print(f"google.genai not available: {e}")
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        USE_NEW_API = False
    except Exception as e2:
        print(f"google.generativeai not available: {e2}")
        genai = None
        USE_NEW_API = False

class GeminiService:
    def __init__(self):
        self.use_client = USE_NEW_API and 'client' in dir()
        self.model_name = 'gemini-2.0-flash'
    
    def _generate(self, prompt: str) -> str:
        """Generate content using appropriate API"""
        try:
            if self.use_client and 'client' in dir():
                response = client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                return response.text if hasattr(response, 'text') else str(response)
            elif 'genai' in dir() and genai:
                model = genai.GenerativeModel('gemini-pro')
                response = model.generate_content(prompt)
                return response.text if hasattr(response, 'text') else str(response)
        except Exception as e:
            print(f"Generation error: {e}")
        return ""
    
    async def get_outfit_recommendations(self, selected_product: Product, all_products: List[Product]) -> OutfitRecommendation:
        product_context = self._build_product_context(selected_product, all_products)
        
        prompt = f"""You are a professional fashion stylist. A user has selected: {self._format_product(selected_product)}

Based on this selection, recommend matching items from:
{product_context}

Provide JSON:
{{"matching_items": [product IDs], "style_score": 0.0-10.0, "reasoning": "explanation"}}
"""
        try:
            response_text = self._generate(prompt)
            return self._parse_gemini_response(response_text, all_products, selected_product)
        except Exception as e:
            print(f"Error: {e}")
            return self._fallback_recommendation(selected_product, all_products)
    
    async def get_personalized_advice(self, user_preferences: Dict[str, Any], occasion: str, style: str) -> str:
        prompt = f"""Fashion advice for {style} style, {occasion} occasion. Preferences: {user_preferences}"""
        try:
            return self._generate(prompt)
        except:
            return f"Focus on {style} for {occasion}. Start with neutral basics and add statement pieces."
    
    async def analyze_trends(self, category: str) -> Dict[str, Any]:
        try:
            response = self._generate(f"Trend insights for {category} as JSON")
            return self._parse_trends_response(response)
        except:
            return {"trending_colors": ["Neutral"], "popular_styles": ["Casual"], "must_have_items": [], "styling_tips": []}
    
    async def analyze_image(self, image_data: bytes) -> Dict[str, Any]:
        return {"clothing_type": "Unknown", "colors": [], "style": "Unknown", "occasion": "Various"}
    
    def _build_product_context(self, selected: Product, all_products: List[Product]) -> str:
        return "\n".join([f"- {p.name} (ID:{p.id}, {p.subcategory}, ₹{p.price})" 
                         for p in all_products if p.id != selected.id])
    
    def _format_product(self, product: Product) -> str:
        return f"{product.name} ({product.category}-{product.subcategory}, ₹{product.price})"
    
    def _parse_gemini_response(self, response_text: str, all_products: List[Product], selected: Product) -> OutfitRecommendation:
        try:
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                data = json.loads(json_match.group())
                matching_ids = data.get('matching_items', [])
                matching = [p for p in all_products if p.id in matching_ids]
                if not matching:
                    matching = self._get_fallback_matching(selected, all_products)
                return OutfitRecommendation(main_item=selected, matching_items=matching[:5], 
                                         style_score=data.get('style_score', 8.0), reasoning=data.get('reasoning', ''))
        except: pass
        return self._fallback_recommendation(selected, all_products)
    
    def _get_fallback_matching(self, selected: Product, all_products: List[Product]) -> List[Product]:
        cats = {'shirts': ['pants','bottoms','footwear','accessories'], 'tshirts': ['pants','footwear','accessories'],
                'tops': ['bottoms','footwear','accessories'], 'dresses': ['footwear','accessories'],
                'long_frocks': ['footwear','accessories'], 'pants': ['shirts','tops','footwear','accessories'],
                'bottoms': ['shirts','tops','footwear','accessories'], 'footwear': ['pants','bottoms','shirts','tops'],
                'accessories': ['shirts','tops','pants','dresses'], 'blazers': ['shirts','pants','footwear'],
                'hoodies': ['pants','footwear'], 'sweatshirts': ['pants','footwear'],
                'jackets': ['shirts','tops','pants','bottoms'], 'boys': ['accessories','footwear'],
                'girls': ['accessories','footwear'], 'oversized': ['cargo','pants','footwear','accessories'],
                'cargo': ['oversized','hoodies','footwear'], 'sleeveless': ['bottoms','pants','accessories'],
                'ethnic_wear': ['footwear','accessories']}
        find = cats.get(selected.subcategory, ['shirts','pants','footwear','accessories'])
        return [p for p in all_products if p.id != selected.id and p.subcategory in find][:5]
    
    def _fallback_recommendation(self, selected: Product, all_products: List[Product]) -> OutfitRecommendation:
        matching = self._get_fallback_matching(selected, all_products)
        return OutfitRecommendation(main_item=selected, matching_items=matching, style_score=7.5, 
                                 reasoning="Based on your selection")
    
    def _parse_trends_response(self, text: str) -> Dict[str, Any]:
        try:
            m = re.search(r'\{[\s\S]*\}', text)
            if m: return json.loads(m.group())
        except: pass
        return {"trending_colors": [], "popular_styles": [], "must_have_items": [], "styling_tips": []}

gemini_service = GeminiService()
