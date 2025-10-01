/**
 * Mendapatkan base URL dari URL lengkap.
 * Contoh: "http://example.com/scorm/course/index.html" -> "http://example.com/scorm/course/"
 * @param {string} url - URL lengkap.
 * @returns {string} Base URL.
 */
export const getBaseUrl = (url) => {
  return url ? url.substring(0, url.lastIndexOf("/") + 1) : "";
};

/**
 * Memeriksa apakah skor sudah pernah dikirimkan berdasarkan data CMI.
 * @param {object} cmiData - Objek CMI dari SCORM API.
 * @param {string} scormVersion - Versi SCORM ("1.2" atau "2004").
 * @returns {boolean} - True jika skor sudah ada.
 */
export const hasScoreBeenSubmitted = (cmiData, scormVersion) => {
  if (!cmiData) return false;
  // Untuk SCORM 2004
  if (scormVersion.includes("2004")) {
    return cmiData?.score?.raw !== undefined && cmiData.score.raw !== "";
  }
  // Untuk SCORM 1.2
  const scoreValue = cmiData.core?.score?.raw;
  return scoreValue !== undefined && scoreValue !== "";
};
