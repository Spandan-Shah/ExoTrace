export const API_BASE_URL = "http://127.0.0.1:8000";

export type ClassCounts = {
  planet: number;
  false_positive: number;
  eclipsing_binary: number;
};

export type SummaryResponse = {
  project: string;
  description: string;
  dataset: {
    total_lightcurves: number;
    class_counts: ClassCounts;
  };
  pipeline: string[];
  model: {
    name: string;
    accuracy: number;
    macro_f1: number;
    planet_recall: number;
    false_positive_recall: number;
    eclipsing_binary_recall: number;
  };
};

export type Target = {
  tic_id: string | number;
  label: string;
  file_path: string;
};

export type TargetsResponse = {
  total_targets?: number;
  total?: number;
  class_counts?: Record<string, number>;
  limit: number;
  targets: Target[];
};

export type PredictionFeatures = {
  period_days: number;
  duration_days: number;
  duration_hours: number;
  transit_time: number;
  depth: number;
  depth_percent: number;
  snr: number;
  bls_power: number;
  n_points_used: number;
  n_in_transit_points: number;
  n_detected_transits: number;
  odd_even_depth_difference: number;
  secondary_eclipse_depth: number;
  v_shape_score: number;
  baseline_days: number;
  period_search_min_days: number;
  period_search_max_days: number;
};

export type PlotUrls = {
  normalized?: string;
  detrended?: string;
  phase_folded?: string;
};

export type PredictionResult = {
  tic_id: string;
  true_label: string;
  predicted_label: string;
  decision: string;
  confidence: number;
  planet_probability: number;
  class_probabilities: Record<string, number>;
  model_name: string;
  features: PredictionFeatures;
  plot_urls?: PlotUrls;
};

export type PredictionResponse = {
  status: string;
  result_file: string;
  result: PredictionResult;
};

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export function getSummary() {
  return apiGet<SummaryResponse>("/api/summary");
}

export function getTargets(limit = 20) {
  return apiGet<TargetsResponse>(`/api/targets?limit=${limit}`);
}

export function getTargetsByLabel(label: string, limit = 20) {
  return apiGet<TargetsResponse>(`/api/targets/${label}?limit=${limit}`);
}

export function predictByTic(ticId: string | number) {
  return apiGet<PredictionResponse>(`/api/predict/${ticId}`);
}