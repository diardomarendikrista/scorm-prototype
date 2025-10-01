// hanya muncul jika quiz tidak dapat di repeat.

export default function QuizResultPage({ progress, scormVersion, onRetry }) {
  if (!progress) {
    return <div className="text-center">Memuat hasil...</div>;
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
    <div className="w-full h-full flex flex-col justify-center items-center bg-slate-50 p-8">
      <div className="bg-white p-10 rounded-lg shadow-xl text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Ujian Telah Selesai
        </h1>
        <p className="text-slate-600 mb-6">
          Anda telah menggunakan semua kesempatan untuk mengerjakan kuis ini.
        </p>
        <div className="bg-slate-100 p-6 rounded-lg mb-8">
          <p className="text-lg text-slate-500">Skor Akhir Anda</p>
          <p className="text-5xl font-bold text-blue-600 my-2">
            {score || "N/A"}
            <span className="text-3xl text-slate-400">
              {" "}
              / {maxScore || 100}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
