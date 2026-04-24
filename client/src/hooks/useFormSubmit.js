import { useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/apiError";

/**
 * Custom hook for form submission — handles loading state,
 * validation, and success/error toasts.
 *
 * Usage:
 *   const { submit, loading } = useFormSubmit(createComplaint, {
 *     onSuccess: () => { resetForm(); refetch(); },
 *     successMessage: "Complaint submitted!",
 *   });
 *
 *   <form onSubmit={(e) => { e.preventDefault(); submit(formData); }}>
 */
const useFormSubmit = (apiFn, { onSuccess, successMessage, loadingMessage } = {}) => {
  const [loading, setLoading] = useState(false);

  const submit = async (...args) => {
    setLoading(true);
    const toastId = loadingMessage ? toast.loading(loadingMessage) : null;

    try {
      const response = await apiFn(...args);
      const msg =
        successMessage ||
        response?.data?.message ||
        "Success!";

      if (toastId) {
        toast.success(msg, { id: toastId });
      } else {
        toast.success(msg);
      }

      if (onSuccess) onSuccess(response?.data);
      return response?.data;
    } catch (err) {
      const msg = getErrorMessage(err, "Request failed");
      if (toastId) {
        toast.error(msg, { id: toastId });
      } else {
        toast.error(msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading };
};

export default useFormSubmit;
