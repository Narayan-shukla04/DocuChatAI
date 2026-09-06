import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../services/api";
import { getErrorMessage } from "../utils/errorMessage";

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await api.get("/docs");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents", error);
      toast.error("Failed to load documents");
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchDocuments());
  }, [fetchDocuments]);

  const uploadDocument = useCallback(
    async (file) => {
      if (!file || isUploading) return false;

      const formData = new FormData();
      formData.append("file", file);

      setIsUploading(true);
      setUploadProgress(0);

      const uploadToast = toast.loading("Uploading document...");

      try {
        await api.post("/docs/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          },
        });

        toast.success("Document uploaded and processed successfully!", {
          id: uploadToast,
        });
        await fetchDocuments();
        return true;
      } catch (error) {
        console.error("Upload failed", error);
        toast.error(
          `Upload failed: ${getErrorMessage(error, "Unknown error")}`,
          { id: uploadToast },
        );
        return false;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [fetchDocuments, isUploading],
  );

  const deleteDocument = useCallback(async (id) => {
    const deleteToast = toast.loading("Deleting...");

    try {
      await api.delete(`/docs/${id}`);
      setDocuments((currentDocuments) =>
        currentDocuments.filter((document) => document._id !== id),
      );
      toast.success("Deleted successfully", { id: deleteToast });
      return true;
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete document", { id: deleteToast });
      return false;
    }
  }, []);

  return {
    documents,
    isUploading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
  };
};
