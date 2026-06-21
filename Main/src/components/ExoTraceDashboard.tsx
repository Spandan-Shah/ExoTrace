import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { LightCurvePlots } from "./LightCurvePlots";
import {
  getSummary,
  getTargetsByLabel,
  predictByTic,
  SummaryResponse,
  Target,
  PredictionResult,
} from "../lib/api";

export function ExoTraceDashboard() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [selectedTic, setSelectedTic] = useState("146172354");
  const [selectedLabel, setSelectedLabel] = useState("planet");
  const [error, setError] = useState<string | null>(null);

  async function loadDashboardData(label = selectedLabel) {
    try {
      setLoading(true);
      setError(null);

      const summaryData = await getSummary();
      const targetsData = await getTargetsByLabel(label, 12);

      setSummary(summaryData);
      setTargets(targetsData.targets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown API error");
    } finally {
      setLoading(false);
    }
  }

  async function changeTargetLabel(label: string) {
    setSelectedLabel(label);
    await loadDashboardData(label);
  }

  async function runPrediction(ticId?: string | number) {
    try {
      setLoading(true);
      setError(null);

      const id = ticId ?? selectedTic;
      setSelectedTic(String(id));

      const predictionData = await predictByTic(id);
      setPrediction(predictionData.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown prediction error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData("planet");
  }, []);

  const planetProbability = prediction
    ? Math.round(prediction.planet_probability * 100)
    : 0;

  const confidence = prediction
    ? Math.round(prediction.confidence * 100)
    : 0;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>AI-enabled Exoplanet Transit Detection</p>
          <h1 style={styles.title}>ExoTrace</h1>
          <p style={styles.subtitle}>
            Detecting possible exoplanet transits from noisy TESS light curves using BLS features and machine learning.
          </p>
        </div>

        <div style={styles.statusCard}>
          <div style={styles.statusDot}></div>
          <span>Backend Connected</span>
        </div>
      </header>

      {error && <div style={styles.errorBox}>{error}</div>}

      <section style={styles.grid}>
        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Light Curves</p>
          <h2 style={styles.metricValue}>
            {summary?.dataset.total_lightcurves ?? "-"}
          </h2>
          <p style={styles.metricNote}>Balanced pilot dataset</p>
        </div>

        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Best Model</p>
          <h2 style={styles.metricValue}>{summary?.model.name ?? "-"}</h2>
          <p style={styles.metricNote}>Selected by macro F1</p>
        </div>

        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Accuracy</p>
          <h2 style={styles.metricValue}>
            {summary ? `${(summary.model.accuracy * 100).toFixed(1)}%` : "-"}
          </h2>
          <p style={styles.metricNote}>Test split performance</p>
        </div>

        <div style={styles.metricCard}>
          <p style={styles.metricLabel}>Macro F1</p>
          <h2 style={styles.metricValue}>
            {summary ? `${(summary.model.macro_f1 * 100).toFixed(1)}%` : "-"}
          </h2>
          <p style={styles.metricNote}>Balanced class metric</p>
        </div>
      </section>

      <section style={styles.mainGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Dataset Overview</h2>
              <p style={styles.panelSubtitle}>
                Three-class light curve classification dataset
              </p>
            </div>
          </div>

          <div style={styles.classGrid}>
            <div style={styles.classBox}>
              <p style={styles.classLabel}>Planet</p>
              <h3 style={styles.classValue}>
                {summary?.dataset.class_counts.planet ?? "-"}
              </h3>
            </div>

            <div style={styles.classBox}>
              <p style={styles.classLabel}>False Positive</p>
              <h3 style={styles.classValue}>
                {summary?.dataset.class_counts.false_positive ?? "-"}
              </h3>
            </div>

            <div style={styles.classBox}>
              <p style={styles.classLabel}>Eclipsing Binary</p>
              <h3 style={styles.classValue}>
                {summary?.dataset.class_counts.eclipsing_binary ?? "-"}
              </h3>
            </div>
          </div>

          <h3 style={styles.smallHeading}>Available Targets</h3>

          <div style={styles.filterRow}>
            <button
              style={{
                ...styles.filterButton,
                ...(selectedLabel === "planet" ? styles.activeFilterButton : {}),
              }}
              onClick={() => changeTargetLabel("planet")}
            >
              Planet
            </button>

            <button
              style={{
                ...styles.filterButton,
                ...(selectedLabel === "false_positive"
                  ? styles.activeFilterButton
                  : {}),
              }}
              onClick={() => changeTargetLabel("false_positive")}
            >
              False Positive
            </button>

            <button
              style={{
                ...styles.filterButton,
                ...(selectedLabel === "eclipsing_binary"
                  ? styles.activeFilterButton
                  : {}),
              }}
              onClick={() => changeTargetLabel("eclipsing_binary")}
            >
              Eclipsing Binary
            </button>
          </div>

          <div style={styles.targetList}>
            {targets.map((target) => (
              <button
                key={`${target.tic_id}-${target.label}`}
                style={styles.targetButton}
                onClick={() => runPrediction(target.tic_id)}
              >
                <span>TIC {target.tic_id}</span>
                <span style={styles.badge}>{target.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Run Transit Prediction</h2>
          <p style={styles.panelSubtitle}>
            Enter a TIC ID from the dataset and run the trained ExoTrace classifier.
          </p>

          <div style={styles.inputRow}>
            <input
              value={selectedTic}
              onChange={(event) => setSelectedTic(event.target.value)}
              placeholder="Enter TIC ID"
              style={styles.input}
            />

            <button
              onClick={() => runPrediction()}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading ? "Analyzing..." : "Predict"}
            </button>
          </div>

          {prediction ? (
            <div style={styles.predictionCard}>
              <div style={styles.predictionHeader}>
                <div>
                  <p style={styles.metricLabel}>Prediction Result</p>
                  <h2 style={styles.predictedLabel}>
                    {prediction.predicted_label}
                  </h2>
                  <p style={styles.decision}>{prediction.decision}</p>
                </div>

                <div style={styles.probCircle}>
                  <strong>{planetProbability}%</strong>
                  <span>planet</span>
                </div>
              </div>

              <div style={styles.resultGrid}>
                <div>
                  <p style={styles.resultLabel}>TIC ID</p>
                  <p style={styles.resultValue}>{prediction.tic_id}</p>
                </div>

                <div>
                  <p style={styles.resultLabel}>True Label</p>
                  <p style={styles.resultValue}>{prediction.true_label}</p>
                </div>

                <div>
                  <p style={styles.resultLabel}>Confidence</p>
                  <p style={styles.resultValue}>{confidence}%</p>
                </div>

                <div>
                  <p style={styles.resultLabel}>Model</p>
                  <p style={styles.resultValue}>{prediction.model_name}</p>
                </div>
              </div>

              <h3 style={styles.smallHeading}>Transit Features</h3>

              <div style={styles.featureGrid}>
                <Feature
                  label="Period"
                  value={`${prediction.features.period_days.toFixed(4)} d`}
                />
                <Feature
                  label="Duration"
                  value={`${prediction.features.duration_hours.toFixed(2)} h`}
                />
                <Feature
                  label="Depth"
                  value={`${prediction.features.depth_percent.toFixed(4)}%`}
                />
                <Feature
                  label="SNR"
                  value={prediction.features.snr.toFixed(2)}
                />
                <Feature
                  label="BLS Power"
                  value={prediction.features.bls_power.toFixed(4)}
                />
                <Feature
                  label="Transits"
                  value={String(prediction.features.n_detected_transits)}
                />
              </div>

              <h3 style={styles.smallHeading}>Class Probabilities</h3>

              <div style={styles.probabilityList}>
                {Object.entries(prediction.class_probabilities).map(
                  ([label, probability]) => (
                    <div key={label} style={styles.probabilityRow}>
                      <span>{label}</span>

                      <div style={styles.probabilityTrack}>
                        <div
                          style={{
                            ...styles.probabilityFill,
                            width: `${Math.round(probability * 100)}%`,
                          }}
                        />
                      </div>

                      <strong>{(probability * 100).toFixed(1)}%</strong>
                    </div>
                  )
                )}
              </div>

              <LightCurvePlots plotUrls={prediction.plot_urls} />
            </div>
          ) : (
            <div style={styles.emptyState}>
              Run a prediction to see the classification, transit features, and probability scores.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Feature({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.featureBox}>
      <p style={styles.resultLabel}>{label}</p>
      <p style={styles.resultValue}>{value}</p>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #08111f 0%, #101a32 50%, #0b1020 100%)",
    color: "#e5edf7",
    padding: "32px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  eyebrow: {
    color: "#7dd3fc",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    fontSize: "12px",
    margin: 0,
  },
  title: {
    fontSize: "54px",
    margin: "8px 0",
    lineHeight: 1,
  },
  subtitle: {
    maxWidth: "760px",
    color: "#b8c7dc",
    fontSize: "16px",
    lineHeight: 1.6,
  },
  statusCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "999px",
    padding: "10px 16px",
    color: "#c7f9cc",
  },
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#22c55e",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  metricCard: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "20px",
  },
  metricLabel: {
    color: "#9fb1c9",
    fontSize: "13px",
    margin: 0,
  },
  metricValue: {
    fontSize: "30px",
    margin: "8px 0",
  },
  metricNote: {
    color: "#7e90a8",
    fontSize: "13px",
    margin: 0,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "0.95fr 1.35fr",
    gap: "20px",
  },
  panel: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  panelTitle: {
    margin: 0,
    fontSize: "24px",
  },
  panelSubtitle: {
    color: "#a7b7cc",
    lineHeight: 1.5,
  },
  classGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    marginTop: "18px",
    marginBottom: "24px",
  },
  classBox: {
    background: "rgba(0,0,0,0.22)",
    borderRadius: "16px",
    padding: "14px",
  },
  classLabel: {
    color: "#9fb1c9",
    fontSize: "12px",
    margin: 0,
  },
  classValue: {
    margin: "6px 0 0 0",
    fontSize: "24px",
  },
  smallHeading: {
    marginTop: "20px",
    marginBottom: "12px",
  },
  filterRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  filterButton: {
    background: "rgba(255,255,255,0.07)",
    color: "#dbeafe",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "999px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },
  activeFilterButton: {
    background: "#38bdf8",
    color: "#06111f",
  },
  targetList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "360px",
    overflowY: "auto",
  },
  targetButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.07)",
    color: "#e5edf7",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "12px",
    cursor: "pointer",
  },
  badge: {
    background: "rgba(125, 211, 252, 0.15)",
    color: "#7dd3fc",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
    marginBottom: "18px",
  },
  input: {
    flex: 1,
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.24)",
    color: "#ffffff",
    fontSize: "15px",
  },
  primaryButton: {
    padding: "13px 18px",
    borderRadius: "12px",
    border: "none",
    background: "#38bdf8",
    color: "#06111f",
    fontWeight: 700,
    cursor: "pointer",
  },
  predictionCard: {
    background: "rgba(0,0,0,0.20)",
    borderRadius: "20px",
    padding: "18px",
    border: "1px solid rgba(255,255,255,0.10)",
  },
  predictionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
  },
  predictedLabel: {
    margin: "8px 0",
    fontSize: "32px",
    textTransform: "capitalize",
  },
  decision: {
    color: "#bae6fd",
    margin: 0,
  },
  probCircle: {
    width: "104px",
    height: "104px",
    borderRadius: "50%",
    border: "8px solid rgba(56,189,248,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    background: "rgba(56,189,248,0.10)",
  },
  resultGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginTop: "20px",
  },
  resultLabel: {
    color: "#9fb1c9",
    fontSize: "12px",
    margin: 0,
  },
  resultValue: {
    margin: "5px 0 0 0",
    fontWeight: 700,
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  featureBox: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "12px",
  },
  probabilityList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  probabilityRow: {
    display: "grid",
    gridTemplateColumns: "140px 1fr 64px",
    alignItems: "center",
    gap: "12px",
  },
  probabilityTrack: {
    height: "10px",
    background: "rgba(255,255,255,0.12)",
    borderRadius: "999px",
    overflow: "hidden",
  },
  probabilityFill: {
    height: "100%",
    background: "#38bdf8",
    borderRadius: "999px",
  },
  emptyState: {
    padding: "30px",
    border: "1px dashed rgba(255,255,255,0.25)",
    borderRadius: "16px",
    color: "#9fb1c9",
    textAlign: "center",
  },
  errorBox: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.45)",
    color: "#fecaca",
    padding: "14px",
    borderRadius: "14px",
    marginBottom: "18px",
  },
};