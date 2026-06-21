from pathlib import Path
import sys

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

# Make backend scripts importable
sys.path.append(str(BASE_DIR))

from step13_predict_one_lightcurve import (
    load_model,
    get_lightcurve_from_dataset,
    predict_lightcurve,
    convert_to_builtin_types,
)


DATASET_INDEX = BASE_DIR / "data" / "dataset_index.csv"
RESULTS_DIR = BASE_DIR / "outputs" / "results"

app = FastAPI(
    title="ExoTrace API",
    description="AI-enabled exoplanet transit detection API",
    version="1.0.0",
)

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_CACHE = None


def get_cached_model():
    """
    Loads the trained model only once.
    """
    global MODEL_CACHE

    if MODEL_CACHE is None:
        MODEL_CACHE = load_model()

    return MODEL_CACHE


@app.get("/")
def root():
    return {
        "project": "ExoTrace",
        "status": "running",
        "message": "ExoTrace backend API is active",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "backend": "FastAPI",
        "model_available": (BASE_DIR / "models" / "best_exotrace_classifier.joblib").exists(),
        "dataset_index_available": DATASET_INDEX.exists(),
    }


@app.get("/api/targets")
def list_targets(limit: int = 20):
    """
    Returns available TIC targets from dataset_index.csv.
    """
    if not DATASET_INDEX.exists():
        raise HTTPException(status_code=404, detail="dataset_index.csv not found")

    df = pd.read_csv(DATASET_INDEX)

    records = df[["tic_id", "label", "file_path"]].head(limit).to_dict(orient="records")

    class_counts = df["label"].value_counts().to_dict()

    return {
        "total_targets": len(df),
        "class_counts": class_counts,
        "limit": limit,
        "targets": records,
    }


@app.get("/api/targets/{label}")
def list_targets_by_label(label: str, limit: int = 20):
    """
    Returns targets filtered by label.
    Example labels:
    planet
    false_positive
    eclipsing_binary
    """
    if not DATASET_INDEX.exists():
        raise HTTPException(status_code=404, detail="dataset_index.csv not found")

    df = pd.read_csv(DATASET_INDEX)

    valid_labels = sorted(df["label"].unique())

    if label not in valid_labels:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid label",
                "valid_labels": valid_labels,
            },
        )

    filtered = df[df["label"] == label]

    records = filtered[["tic_id", "label", "file_path"]].head(limit).to_dict(orient="records")

    return {
        "label": label,
        "total": len(filtered),
        "limit": limit,
        "targets": records,
    }


@app.get("/api/predict/{tic_id}")
def predict_by_tic(tic_id: str):
    """
    Runs full prediction for one TIC ID.
    """
    try:
        model, feature_columns, labels, model_name = get_cached_model()

        file_path, selected_tic_id, true_label = get_lightcurve_from_dataset(tic_id)

        result = predict_lightcurve(
            file_path=file_path,
            tic_id=selected_tic_id,
            true_label=true_label,
            model=model,
            feature_columns=feature_columns,
            labels=labels,
            model_name=model_name,
        )

        result = convert_to_builtin_types(result)

        output_file = RESULTS_DIR / f"TIC_{result['tic_id']}_prediction.json"

        return {
            "status": "success",
            "result_file": str(output_file),
            "result": result,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/summary")
def project_summary():
    """
    Returns project-level summary for dashboard.
    """
    if not DATASET_INDEX.exists():
        raise HTTPException(status_code=404, detail="dataset_index.csv not found")

    df = pd.read_csv(DATASET_INDEX)

    return {
        "project": "ExoTrace",
        "description": "AI-enabled detection of exoplanets from noisy astronomical light curves",
        "dataset": {
            "total_lightcurves": len(df),
            "class_counts": df["label"].value_counts().to_dict(),
        },
        "pipeline": [
            "TESS light curve download",
            "Light curve cleaning",
            "Flux normalization",
            "Detrending",
            "BLS transit search",
            "Feature extraction",
            "ML classification",
            "Prediction JSON generation",
        ],
        "model": {
            "name": "ExtraTrees",
            "accuracy": 0.78,
            "macro_f1": 0.77,
            "planet_recall": 0.53,
            "false_positive_recall": 0.82,
            "eclipsing_binary_recall": 1.00,
        },
    }