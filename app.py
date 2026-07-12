import os
import uuid

from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from huggingface_hub import InferenceClient


# Load environment variables
load_dotenv()

app = Flask(__name__)

# Hugging Face token
HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise ValueError("HF_TOKEN not found in .env file")


# Hugging Face Inference Client
client = InferenceClient(
    provider="hf-inference",
    api_key=HF_TOKEN
)


# Home page
@app.route("/")
def home():
    return render_template("index.html")


# Generate image API
@app.route("/generate", methods=["POST"])
def generate_image():

    try:
        # Get JSON data from frontend
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "Invalid request."
            }), 400

        # Get prompt
        prompt = data.get("prompt", "").strip()

        # Validate prompt
        if not prompt:
            return jsonify({
                "success": False,
                "error": "Please enter a prompt."
            }), 400

        if len(prompt) > 500:
            return jsonify({
                "success": False,
                "error": "Prompt must be 500 characters or less."
            }), 400

        print(f"Generating image for prompt: {prompt}")

        # Generate image using AI
        image = client.text_to_image(
            prompt,
            model="black-forest-labs/FLUX.1-schnell"
        )

        # Create unique filename
        filename = f"{uuid.uuid4().hex}.png"

        # Save image inside static/images
        image_path = os.path.join(
            app.static_folder,
            "images",
            filename
        )

        image.save(image_path)

        print(f"Image generated successfully: {filename}")

        # Send image URL to frontend
        return jsonify({
            "success": True,
            "image_url": f"/static/images/{filename}",
            "filename": filename
        })

    except Exception as error:

        print("Image generation error:", error)

        return jsonify({
            "success": False,
            "error": "Image generation failed. Please try again."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)