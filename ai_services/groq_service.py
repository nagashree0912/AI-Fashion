from typing import List, Dict, Any
from groq import Groq

class GroqService:
    """
    Groq service for fast LLM inference
    Provides quick fashion advice and recommendations
    Note: Requires GROQ_API_KEY to be set
    """
    
    def __init__(self):
        self.api_key = None  # Set via environment variable
        self.client = None
        self.model = "mixtral-8x7b-32768"  # Fast and capable model
    
    def initialize(self, api_key: str):
        """Initialize Groq client with API key"""
        self.api_key = api_key
        self.client = Groq(api_key=api_key)
    
    async def get_quick_fashion_advice(
        self, 
        user_query: str,
        context: Dict[str, Any] = None
    ) -> str:
        """Get quick fashion advice using Groq's fast inference"""
        
        if not self.client:
            return self._fallback_advice(user_query)
        
        # Build context for the query
        context_str = ""
        if context:
            context_str = f"\nContext: {context}"
        
        prompt = f"""You are a professional fashion stylist. Provide helpful, concise fashion advice.

User Question: {user_query}
{context_str}

Guidelines:
- Be specific and actionable
- Consider current trends
- Keep it concise (2-3 sentences)
- Be encouraging and supportive

Provide your advice:
"""
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.7,
                max_tokens=200
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq API error: {e}")
            return self._fallback_advice(user_query)
    
    async def analyze_style_preference(
        self, 
        user_responses: List[str]
    ) -> Dict[str, Any]:
        """Analyze user's style preferences from their responses"""
        
        if not self.client:
            return self._default_analysis()
        
        prompt = f"""Analyze the following user responses about their style preferences:

{chr(10).join(f"- {r}" for r in user_responses)}

Provide a JSON analysis with:
{{
    "style_profile": "dominant style (e.g., casual, formal, bohemian)",
    "color_preferences": ["list of preferred colors"],
    "budget_sensitivity": "low/medium/high",
    "adventurousness": "conservative/moderate/adventurous",
    "key_insights": ["2-3 key observations"]
}}
"""
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.5,
                max_tokens=300
            )
            import json
            import re
            
            response = chat_completion.choices[0].message.content
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
            
            return self._default_analysis()
        except Exception as e:
            print(f"Groq analysis error: {e}")
            return self._default_analysis()
    
    async def generate_product_description(
        self, 
        product_data: Dict[str, Any]
    ) -> str:
        """Generate enhanced product description using AI"""
        
        if not self.client:
            return product_data.get('description', '')
        
        prompt = f"""Create an engaging product description for a fashion item:

Name: {product_data.get('name', '')}
Category: {product_data.get('category', '')} - {product_data.get('subcategory', '')}
Brand: {product_data.get('brand', '')}
Colors: {', '.join(product_data.get('colors', []))}
Price: ${product_data.get('price', 0)}

Write a compelling 2-3 sentence product description that highlights:
- Key features
- Style and versatility
- Who it's perfect for

Keep it concise and marketing-focused.
"""
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.8,
                max_tokens=150
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq description error: {e}")
            return product_data.get('description', '')
    
    async def get_trend_insights(self, category: str) -> Dict[str, Any]:
        """Get quick trend insights using Groq"""
        
        if not self.client:
            return self._default_trends()
        
        prompt = f"""Provide current fashion trend insights for {category}:

Format as JSON:
{{
    "top_trends": ["trend 1", "trend 2", "trend 3"],
    "popular_colors": ["color 1", "color 2"],
    "style_tips": ["tip 1", "tip 2"],
    "must_have_items": ["item 1", "item 2"]
}}
"""
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                temperature=0.6,
                max_tokens=250
            )
            
            import json
            import re
            
            response = chat_completion.choices[0].message.content
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                return json.loads(json_match.group())
            
            return self._default_trends()
        except Exception as e:
            print(f"Groq trends error: {e}")
            return self._default_trends()
    
    def _fallback_advice(self, query: str) -> str:
        """Provide fallback advice when Groq unavailable"""
        return "Thank you for your question! For personalized fashion advice, explore our curated collections and try our AI outfit matching feature to discover your perfect style."
    
    def _default_analysis(self) -> Dict[str, Any]:
        """Default style analysis"""
        return {
            "style_profile": "versatile",
            "color_preferences": ["neutral colors"],
            "budget_sensitivity": "medium",
            "adventurousness": "moderate",
            "key_insights": ["Open to exploring different styles", "Prefers classic pieces"]
        }
    
    def _default_trends(self) -> Dict[str, Any]:
        """Default trend insights"""
        return {
            "top_trends": ["Sustainable fashion", "Comfort-driven styles"],
            "popular_colors": ["Earth tones", "Neutral palette"],
            "style_tips": ["Layer for versatility", "Invest in basics"],
            "must_have_items": ["Quality basics", "Statement accessories"]
        }

# Create singleton instance
groq_service = GroqService()
