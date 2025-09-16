export default function ({ progress, scormVersion }) {
  // Jangan tampilkan apa-apa jika belum ada progres
  if (!progress) return null;

  const cmi = progress.cmi || {};
  let score, maxScore;

  if (scormVersion.includes("2004")) {
    score = cmi.score?.scaled; // Skor 2004 biasanya dalam bentuk skala 0-1
    // Untuk mendapatkan skor mentah, kita kalikan 100
    if (score !== undefined) {
      score = parseFloat(score) * 100;
      maxScore = 100;
    }
  } else {
    // SCORM 1.2
    score = cmi.core?.score?.raw;
    maxScore = cmi.core?.score?.max;
  }

  // Hanya tampilkan jika skor adalah angka yang valid
  if (score === undefined || score === null || score === "") {
    return null;
  }

  return (
    <div className="text-sm font-semibold text-gray-700">
      Your Score: {score} / {maxScore || 100}
    </div>
  );
}
