// Biasanya SCORM pakai alert, agar tidak terlalu jadul, kita intercept alert biasa, kemudian ganti pakai modal custom
import Button from "components/Button";
import Modal from "components/Modal";
import { useState, useEffect, useCallback } from "react";

// karena SCORM pakai iframe, kita butuh ref ke iframe.
export function useCustomAlert(iframeRef) {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    // Tunggu sampai iframe siap
    const iframeWindow = iframeRef.current?.contentWindow;
    if (!iframeWindow) return;

    // Simpan alert asli dari window UTAMA dan IFRAME
    const originalParentAlert = window.alert;
    const originalIframeAlert = iframeWindow.alert;

    // Fungsi alert kustom kita
    const customAlert = (message) => {
      console.log("Alert dicegat:", message);
      setAlertState({ isOpen: true, message: message });
    };

    // Ganti alert di kedua konteks
    window.alert = customAlert;
    iframeWindow.alert = customAlert;

    // Fungsi cleanup
    return () => {
      window.alert = originalParentAlert;
      // Pastikan iframe masih ada sebelum mengembalikan alert-nya
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.alert = originalIframeAlert;
      }
    };
  }, [iframeRef.current]);

  const handleClose = useCallback(() => {
    setAlertState({ isOpen: false, message: "" });
  }, []);

  const CustomAlertModal = (
    <Modal
      showModal={alertState.isOpen}
      setShowModal={(isOpen) => setAlertState((prev) => ({ ...prev, isOpen }))}
      title="Info"
      onClose={handleClose}
      closeOnOverlayClick={false}
    >
      <p className="text-gray-700">{alertState.message}</p>
      <div className="flex justify-end mt-6">
        <Button
          variant="info"
          onClick={handleClose}
        >
          OK
        </Button>
      </div>
    </Modal>
  );

  return { CustomAlertModal };
}
