import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from groq_client import analyze_image
from PIL import Image
import tempfile

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({"error": "image file required"}), 400

    image_file = request.files['image']
    gender = request.form.get('gender', 'unspecified')

    filename = secure_filename(image_file.filename or 'upload.jpg')

    with tempfile.NamedTemporaryFile(suffix=filename, delete=True) as tmp:
        image_file.save(tmp.name)
        # Optional: perform light preprocessing or validation with PIL
        try:
            with Image.open(tmp.name) as img:
                img.verify()
        except Exception:
            return jsonify({"error": "invalid image"}), 400

        # Call Groq client (placeholder)
        try:
            result = analyze_image(tmp.name, gender)
        except Exception as e:
            return jsonify({"error": "analysis_failed", "details": str(e)}), 500

    return jsonify(result)


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
