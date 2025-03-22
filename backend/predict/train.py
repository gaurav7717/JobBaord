import pandas as pd
import pickle
import re
import spacy
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, f1_score
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight
import numpy as np
import logging

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load spaCy for advanced NLP processing
nlp = spacy.load('en_core_web_sm')

def clean_resume(text):
    """Enhanced text preprocessing pipeline"""
    try:
        # Remove encoding artifacts and special characters
        text = text.encode('ascii', 'ignore').decode('ascii')
        
        # Remove common resume artifacts
        text = re.sub(r'\b(?:phone|email|http|www)\S+\s', ' ', text, flags=re.IGNORECASE)
        text = re.sub(r'[^a-zA-Z\s.,#+]', ' ', text)  # Keep some punctuation
        
        # Handle section headers and bullet points
        text = re.sub(r'\n\s*[•■▪➢]\s*', '\n ', text)
        
        # Lemmatization and stopword removal
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
        logger.error(f"Error cleaning text: {e}")
        return ""

def main():
    try:
        # Load dataset
        df = pd.read_csv('../predict/dataset/OldUpdatedResumeDataSet.csv')
        logger.info(f"Dataset loaded with {len(df)} entries")

        # Clean and preprocess text
        df['cleaned_resume'] = df['Resume'].apply(clean_resume)
        
        # Encode labels
        le = LabelEncoder()
        df['category_id'] = le.fit_transform(df['Category'])
        logger.info(f"Encoding {len(le.classes_)} categories: {list(le.classes_)}")

        # Split data with stratification
        X_train, X_test, y_train, y_test = train_test_split(
            df['cleaned_resume'],
            df['category_id'],
            test_size=0.2,
            stratify=df['category_id'],
            random_state=42
        )

        # Updated LogisticRegression configuration in the pipeline
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                lowercase=True,
                stop_words='english',
                ngram_range=(1, 3),
                max_df=0.9,
                min_df=3
            )),
            ('clf', LogisticRegression(
                class_weight='balanced',
                solver='saga',
                max_iter=2000,  # Increased from 1000
                tol=1e-3,   
                random_state=42
            ))
        ])

       # Simplified hyperparameter grid
        param_grid = {
            'tfidf__max_features': [8000, 10000],
            'tfidf__ngram_range': [(1, 2), (1, 3)],
            'clf__C': [0.1, 1],
            'clf__penalty': ['l1', 'l2']  # Removed elasticnet
        }

        # Grid search with 3-fold CV
        grid_search = GridSearchCV(
            pipeline,
            param_grid,
            cv=3,
            scoring='f1_weighted',
            n_jobs=-1,
            verbose=1
        )

        logger.info("Starting model training...")
        grid_search.fit(X_train, y_train)

        logger.info(f"Best parameters: {grid_search.best_params_}")
        logger.info(f"Best validation score: {grid_search.best_score_:.3f}")

        # Evaluate
        y_pred = grid_search.predict(X_test)
        logger.info("Classification Report:\n" + classification_report(y_test, y_pred, target_names=le.classes_))

        # Save artifacts
        artifacts = {
            'pipeline': grid_search.best_estimator_,
            'label_encoder': le
        }

        with open('../predict/model_artifacts.pkl', 'wb') as f:
            pickle.dump(artifacts, f)

        logger.info("Model saved successfully")

    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise

if __name__ == "__main__":
    main()