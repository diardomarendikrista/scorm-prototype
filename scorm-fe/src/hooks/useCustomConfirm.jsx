// hooks/useCustomConfirm.js
import Button from "components/Button";
import Modal from "components/Modal";
import { useState, useEffect, useCallback } from "react";

export function useCustomConfirm(iframeRef) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: "",
    resolve: null,
  });

  const showConfirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        message,
        resolve,
      });
    });
  }, []);

  // Efek ini akan mengganti `confirm` global
  useEffect(() => {
    const iframeWindow = iframeRef?.current?.contentWindow;
    if (!iframeWindow) return;

    const originalConfirm = iframeWindow.confirm;

    // Ganti fungsi confirm di dalam iframe
    iframeWindow.confirm = (message) => {
      console.log("Confirm dicegat:", message);
      showConfirm(message);
      return false; // Kembalikan false agar alur asli di konten SCORM tidak lanjut
    };

    return () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.confirm = originalConfirm;
      }
    };
  }, [iframeRef, showConfirm]);

  const handleResponse = (response) => {
    if (confirmState.resolve) {
      confirmState.resolve(response);
    }
    setConfirmState({ isOpen: false, message: "", resolve: null });
  };

  const CustomConfirmModal = (
    <Modal
      showModal={confirmState.isOpen}
      title="Konfirmasi"
    >
      <p className="text-gray-700">{confirmState.message}</p>
      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => handleResponse(false)}
        >
          Batal
        </Button>
        <Button onClick={() => handleResponse(true)}>OK</Button>
      </div>
    </Modal>
  );

  return { CustomConfirmModal, showConfirm };
}
