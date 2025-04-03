import sys
import re
import os
import pickle
import spacy
import json
import logging
from collections import defaultdict

# Configuration paths
SKILLS_PATH = './predict/skills.json'
MODEL_PATH = './predict/model_artifacts.pkl'
UPLOAD_FOLDER = './predict/resumes/'

# Configure logging to only write to a file
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler('predict.log')]
)
logger = logging.getLogger(__name__)

# Load NLP model first
try:
    nlp = spacy.load('en_core_web_sm')
    logger.info("spaCy model loaded successfully.")
except OSError as e:
    logger.error(f"spaCy model loading failed: {e}")
    sys.exit(1)

# Load skills database
def load_skills():
    """Load skills database from JSON file"""
    try:
        with open(SKILLS_PATH) as f:
            skills_data = json.load(f)
        logger.info("Skills data loaded successfully.")
        return (
            set(skills_data['technologies']),
            set(skills_data['tools']),
            set(skills_data['certifications'])
        )
    except Exception as e:
        logger.error(f"Error loading skills: {e}")
        return set(), set(), set()

TECHNOLOGIES, TOOLS, CERTIFICATIONS = load_skills()
ALL_SKILLS = TECHNOLOGIES.union(TOOLS).union(CERTIFICATIONS)

# Load ML model artifacts
def load_model():
    """Load the trained model pipeline and label encoder"""
    try:
        with open(MODEL_PATH, 'rb') as f:
            artifacts = pickle.load(f)
        logger.info("Model loaded successfully.")
        return artifacts['pipeline'], artifacts['label_encoder']
    except Exception as e:
        logger.error(f"Model loading failed: {e}")
        raise

try:
    pipeline, label_encoder = load_model()
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    sys.exit(1)

def clean_resume(text):
    """Enhanced text cleaning matching training preprocessing"""
    try:
        text = text.encode('ascii', 'ignore').decode('ascii')
        text = re.sub(r'\b(?:\d{10}|[\w\.-]+@[\w\.-]+\.\w+)\b', ' ', text)
        text = re.sub(r'[^a-zA-Z\s.,#+]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip().lower()

        doc = nlp(text)
        clean_tokens = [
            token.lemma_.lower()
            for token in doc
            if not token.is_stop
            and not token.is_punct
            and len(token.lemma_) > 2
        ]
        return ' '.join(clean_tokens)
    except Exception as e:
        logger.error(f"Text cleaning error: {e}")
        return ""

def extract_skills(text):
    """Extract skills from resume text using combined approaches"""
    skills = set()
    text_lower = text.lower()

    tech_list = sorted(TECHNOLOGIES, key=len, reverse=True)
    tools_list = sorted(TOOLS, key=len, reverse=True)
    cert_list = sorted(CERTIFICATIONS, key=len, reverse=True)

    patterns = {
        'technologies': r'\b(' + '|'.join(re.escape(t) for t in tech_list) + r')\b',
        'tools': r'\b(' + '|'.join(re.escape(t) for t in tools_list) + r')\b',
        'certifications': r'\b(' + '|'.join(re.escape(t) for t in cert_list) + r')\b'
    }

    for category, pattern in patterns.items():
        matches = re.findall(pattern, text_lower, flags=re.IGNORECASE)
        skills.update(matches)

    doc = nlp(text)
    for chunk in doc.noun_chunks:
        chunk_text = chunk.text.lower().strip()
        if chunk_text in ALL_SKILLS:
            skills.add(chunk_text)

    for ent in doc.ents:
        if ent.label_ == "SKILL" and ent.text.lower() in ALL_SKILLS:
            skills.add(ent.text.lower())

    return sorted(skills)

def process_resume(file_path):
    """Main processing function for resume prediction"""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            raw_text = f.read(2048)

        if len(raw_text) < 50:
            logger.warning(f"Resume content too short: {file_path}")
            return {"error": "Resume content too short"}

        cleaned_text = clean_resume(raw_text)
        if not cleaned_text:
            logger.warning(f"Failed to clean resume text: {file_path}")
            return {"error": "Failed to clean resume text"}

        skills = extract_skills(raw_text)
        pred_id = pipeline.predict([cleaned_text])[0]
        category = label_encoder.inverse_transform([pred_id])[0]
        probas = pipeline.predict_proba([cleaned_text])[0]
        confidence = round(probas[pred_id] * 100, 2)

        logger.info(f"Processed file: {file_path}, category: {category}, confidence: {confidence}")
        return {
            "result_category": category,
            "confidence": confidence,
            "skills": skills,
            "error": None
        }

    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        return {"error": "File not found"}

    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        return {"error": str(e)}

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Requires file path argument"}))
        sys.exit(1)

    file_path = sys.argv[1]

    if not os.path.exists(file_path):
        print(json.dumps({"error": "File not found"}))
        logger.error(f"File does not exist: {file_path}")
        sys.exit(1)

    result = process_resume(file_path)
    print(json.dumps(result))