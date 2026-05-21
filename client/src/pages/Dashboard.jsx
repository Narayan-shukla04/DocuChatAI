import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { FileUp, FileText, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/docs');
      setDocuments(res.data);
    } catch (error) {
      console.error('Error fetching documents', error);
      toast.error('Failed to load documents');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (isUploading) return; // Prevent race conditions

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setUploadProgress(0);

    const uploadToast = toast.loading('Uploading document...');

    try {
      await axios.post('http://localhost:5000/api/docs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      toast.success('Document uploaded and processed successfully!', { id: uploadToast });
      fetchDocuments();
    } catch (error) {
      console.error('Upload failed', error);
      toast.error('Upload failed: ' + (error.response?.data?.message || error.message), { id: uploadToast });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span>Are you sure you want to delete this document?</span>
        <div className="flex gap-2 justify-end">
          <button 
            className="px-3 py-1 bg-dark-border rounded text-sm hover:bg-dark-card"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button 
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            onClick={async () => {
              toast.dismiss(t.id);
              const deleteToast = toast.loading('Deleting...');
              try {
                await axios.delete(`http://localhost:5000/api/docs/${id}`);
                setDocuments(documents.filter(doc => doc._id !== id));
                toast.success('Deleted successfully', { id: deleteToast });
              } catch (error) {
                console.error('Delete failed', error);
                toast.error('Failed to delete document', { id: deleteToast });
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };



  return (
    <div className="min-h-screen bg-dark-bg text-text-main">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1E1E2E', color: '#fff', border: '1px solid #313244' } }} />
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Workspace</h1>
          <div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.docx,.txt,.xlsx,.csv,.pptx,image/jpeg,image/png,image/webp"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
              {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Document'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.length === 0 && !isUploading && (
              <div className="col-span-full text-center py-20 text-text-muted">
                <FileUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">No documents uploaded yet.</p>
                <p className="mt-2">Upload a PDF, Word, Excel, Text file, or an Image to start.</p>
              </div>
            )}

            {documents.map((doc, idx) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-4">
                  {doc.docType === 'image' ? (
                    <div className="p-1 bg-dark-bg rounded-xl overflow-hidden h-16 w-16 flex items-center justify-center border border-dark-border">
                      <img src={doc.previewBase64} alt="preview" className="object-cover w-full h-full rounded-lg" />
                    </div>
                  ) : (
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <span className="text-xs text-text-muted bg-dark-border px-2 py-1 rounded-full">
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg truncate mb-1" title={doc.originalName}>
                  {doc.originalName}
                </h3>
                <p className="text-sm text-text-muted mb-6">
                  Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                  {doc.docType === 'image' && <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">Image</span>}
                </p>

                <div className="flex items-center gap-2 mt-auto">
                  <Link
                    to={`/chat/${doc._id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-dark-border hover:bg-primary/20 text-text-main hover:text-primary transition-colors py-2 rounded-lg text-sm font-medium"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </Link>
                  <button 
                    onClick={() => handleDelete(doc._id)}
                    className="p-2 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
