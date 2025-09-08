class ScormAPI {
  constructor() {
    this.data = {
      "cmi.core.lesson_status": "not attempted",
      "cmi.core.student_name": "Student, Example",
      "cmi.core.score.raw": "",
      "cmi.suspend_data": "",
    };
    console.log("SCORM API Mock Initialized");
  }

  LMSInitialize() {
    console.log("LMSInitialize");
    return "true";
  }

  LMSFinish() {
    console.log("LMSFinish");
    return "true";
  }

  LMSGetValue(key) {
    console.log(`LMSGetValue('${key}') ->`, this.data[key] || "");
    return this.data[key] || "";
  }

  LMSSetValue(key, value) {
    console.log(`LMSSetValue('${key}', '${value}')`);
    this.data[key] = value;
    return "true";
  }

  LMSCommit() {
    console.log("LMSCommit", JSON.stringify(this.data));
    return "true";
  }

  LMSGetLastError() {
    return "0";
  }

  LMSGetErrorString() {
    return "No error";
  }

  LMSGetDiagnostic() {
    return "No diagnostic information";
  }
}

const API = new ScormAPI();
export default API;
