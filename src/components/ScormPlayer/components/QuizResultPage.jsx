// hanya muncul jika quiz tidak dapat di repeat.
import "./quizresultpage.css";

export default function QuizResultPage({ progress, scormVersion, onRetry }) {
  if (!progress) {
    return <div className="scorm-result-loading">Memuat hasil...</div>;
  }

  const cmi = progress.cmi || {};
  let score, maxScore;

  if (scormVersion.includes("2004")) {
    score = cmi.score?.scaled
      ? parseFloat(cmi.score.scaled) * 100
      : cmi.score?.raw;
    maxScore = 100;
  } else {
    score = cmi.core?.score?.raw;
    maxScore = cmi.core?.score?.max;
  }

  return (
    <div className="scorm-result-container">
      <div className="scorm-result-card">
        <h1 className="scorm-result-title">Ujian Telah Selesai</h1>
        <p className="scorm-result-subtitle">
          Anda telah menggunakan semua kesempatan untuk mengerjakan kuis ini.
        </p>

        <div className="scorm-result-score-box">
          <p className="scorm-result-label">Skor Akhir Anda</p>
          <p className="scorm-result-value">
            {score || "N/A"}
            <span className="scorm-result-max"> / {maxScore || 100}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
