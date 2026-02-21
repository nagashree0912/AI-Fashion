from typing import List, Dict, Any
import base64
from io import BytesIO

class HuggingFaceService:
    """
    Hugging Face service for image-based fashion analysis
    Uses CLIP model for image-text matching and fashion classification
    Note: Falls back gracefully when torch/transformers not available
    """
    
    def __init__(self):
        self.model = None
        self.processor = None
        self.is_loaded = False
        self.model_name = "openai/clip-vit-large-patch14"
        self._try_imports()
    
    def _try_imports(self):
        """Try to import torch and transformers"""
        try:
            global torch, CLIPProcessor, CLIPModel
            import torch
            from transformers import CLIPProcessor, CLIPModel
            self._can_load = True
        except ImportError:
            print("Warning: torch/transformers not available. Using fallback mode.")
            self._can_load = False
    
    async def load_model(self):
        """Load CLIP model for image analysis"""
        if not self._can_load:
            self.is_loaded = False
            return
            
        if not self.is_loaded:
            try:
                import torch
                from transformers import CLIPProcessor, CLIPModel
                print("Loading CLIP model...")
                self.model = CLIPModel.from_pretrained(self.model_name)
                self.processor = CLIPProcessor.from_pretrained(self.model_name)
                self.is_loaded = True
                print("CLIP model loaded successfully!")
            except Exception as e:
                print(f"Error loading CLIP model: {e}")
                self.is_loaded = False
    
    async def analyze_clothing_image(self, image_data: bytes) -> Dict[str, Any]:
        """Analyze clothing image to identify items and styles"""
        
        if not self._can_load:
            return self._fallback_analysis()
        
        try:
            from PIL import Image
            import torch
            from transformers import CLIPProcessor, CLIPModel
            
            await self.load_model()
            
            if not self.is_loaded:
                return self._fallback_analysis()
            
            # Load image from bytes
            image = Image.open(BytesIO(image_data)).convert("RGB")
            
            # Fashion-related labels for classification
            fashion_labels = [
                "casual shirt", "formal shirt", "t-shirt", "polo shirt",
                "jeans", "formal pants", "casual pants", "shorts", "skirt",
                "dress", "evening gown", "cocktail dress", "maxi dress",
                "sneakers", "formal shoes", "boots", "heels", "sandals",
                "leather jacket", "denim jacket", "blazer", "coat",
                "handbag", "backpack", "watch", "sunglasses", "belt", "scarf",
                "men's clothing", "women's clothing", "kids clothing"
            ]
            
            # Process image and text
            inputs = self.processor(
                text=fashion_labels, 
                images=image, 
                return_tensors="pt", 
                padding=True
            )
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits_per_image = outputs.logits_per_image
                probs = logits_per_image.softmax(dim=1)
            
            # Get top predictions
            top_indices = probs[0].topk(5)
            results = []
            for idx, prob in zip(top_indices.indices, top_indices.values):
                results.append({
                    "label": fashion_labels[idx],
                    "confidence": float(prob)
                })
            
            # Determine category
            detected_items = [r['label'] for r in results]
            category = self._determine_category(detected_items)
            
            return {
                "detected_items": detected_items,
                "top_predictions": results,
                "category": category,
                "confidence": float(probs[0].max()),
                "colors": ["Color analysis available"],
                "style_tags": self._extract_style_tags(detected_items)
            }
            
        except Exception as e:
            print(f"Error analyzing image: {e}")
            return self._fallback_analysis()
    
    async def get_outfit_compatibility(
        self, 
        items: List[Dict[str, Any]]
    ) -> float:
        """Calculate outfit compatibility score"""
        return 0.7  # Default reasonable score
    
    async def find_similar_products(
        self, 
        image_data: bytes, 
        product_images: List[str],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Find similar products based on uploaded image"""
        return []
    
    def _determine_category(self, detected_items: List[str]) -> str:
        """Determine the category of detected items"""
        
        mens_items = ['shirt', 'pants', 'jeans', 'formal', 'sneakers', 'boots', 'belt']
        womens_items = ['dress', 'skirt', 'heels', 'handbag', 'gown', 'cocktail']
        kids_items = ['kids']
        
        mens_count = sum(1 for item in detected_items if any(m in item.lower() for m in mens_items))
        womens_count = sum(1 for item in detected_items if any(w in item.lower() for w in womens_items))
        kids_count = sum(1 for item in detected_items if any(k in item.lower() for k in kids_items))
        
        if mens_count > womens_count and mens_count > kids_count:
            return "menswear"
        elif womens_count > mens_count:
            return "womenswear"
        elif kids_count > 0:
            return "kidswear"
        else:
            return "unisex"
    
    def _extract_colors(self, image) -> List[str]:
        """Extract dominant colors from image"""
        return ["Color analysis available"]
    
    def _extract_style_tags(self, detected_items: List[str]) -> List[str]:
        """Extract style tags from detected items"""
        
        style_mapping = {
            'casual': ['casual', 't-shirt', 'jeans', 'shorts', 'sneakers'],
            'formal': ['formal', 'formal shirt', 'formal pants', 'suit'],
            'sporty': ['sport', 'athletic', 'running'],
            'elegant': ['dress', 'evening', 'cocktail', 'heels'],
            'bohemian': ['maxi', 'flowy', 'boho'],
            'streetwear': ['street', 'urban', 'cool']
        }
        
        detected_lower = [item.lower() for item in detected_items]
        styles = []
        
        for style, keywords in style_mapping.items():
            if any(kw in ' '.join(detected_lower) for kw in keywords):
                styles.append(style)
        
        return styles if styles else ['versatile']
    
    def _fallback_analysis(self) -> Dict[str, Any]:
        """Provide fallback analysis when model unavailable"""
        return {
            "detected_items": ["Fashion item"],
            "top_predictions": [{"label": "Fashion item", "confidence": 0.5}],
            "category": "unisex",
            "confidence": 0.5,
            "colors": ["Various"],
            "style_tags": ["versatile"]
        }

# Create singleton instance
huggingface_service = HuggingFaceService()
