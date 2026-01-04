// src/pages/BillUploadExpense.tsx
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Upload, ArrowLeft, Receipt, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveExpense } from '../lib/localStorage';

interface ExtractedData {
  amount?: string;
  date?: string;
  description?: string;
}

const BillUploadExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const worker = await createWorker('eng');
      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();

      console.log('OCR TEXT >>>\n', text);

      // Amount – try several ticket/bill-style patterns
      const amountMatch =
        // Rs. 90/-
        text.match(/Rs\.?\s*([0-9]+)\s*\/-/i) ||
        // RS 90, R S 90, etc.
        text.match(/R[ sS]\.?[:\s]*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/i) ||
        // ₹ 90
        text.match(/₹\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/i);

      // Date – prefer dd/mm/yyyy with time, fall back to dd-mm-yyyy, etc.
      const dateMatch =
        text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})\s+\d{1,2}:\d{2}/) ||
        text.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/);

      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      // Description – try to pick a meaningful ticket line
      const descriptionLine =
        lines.find((l) =>
          /(TRIPUN|TRIV|INDIAN RAILWAYS|JOURNEY|KM)/i.test(l),
        ) || lines[0] || '';

      const normalizedDate = dateMatch
        ? (() => {
            const raw = dateMatch[1]; // e.g. 11/12/2025 or 11-12-2025
            const parts = raw.replace(/-/g, '/').split('/');
            if (parts.length === 3) {
              const [d, m, y] = parts;
              const yyyy = y.length === 2 ? `20${y}` : y;
              return `${yyyy}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }
            return new Date().toISOString().split('T')[0];
          })()
        : new Date().toISOString().split('T')[0];

      setExtractedData({
        amount: amountMatch ? amountMatch[1].replace(/,/g, '') : '',
        date: normalizedDate,
        description: descriptionLine,
      });
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process the bill. Please try manual entry.');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
  });

  const handleSave = async () => {
    if (!extractedData) return;

    setLoading(true);
    setError(null);

    try {
      saveExpense({
        amount: parseFloat(extractedData.amount || '0'),
        date: extractedData.date || new Date().toISOString().split('T')[0],
        description: extractedData.description || '',
        category: 'Other',
        type: 'upload',
      });

      setSuccess(true);
      setExtractedData(null);
      setPreviewUrl(null);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to save expense. Please try again.');
      console.error('Error saving expense:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
          <div className="flex items-center mb-8">
            <Receipt className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold text-white">Upload Bill</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
              Expense saved successfully!
            </div>
          )}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-blue-500 hover:bg-gray-700/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-300">
              {isDragActive
                ? 'Drop the bill here...'
                : 'Drag & drop a bill here, or click to select'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports JPG, JPEG, PNG
            </p>
          </div>

          {loading && (
            <div className="mt-6 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 mt-2">Processing bill...</p>
            </div>
          )}

          {previewUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-3">Preview</h3>
              <img
                src={previewUrl}
                alt="Bill preview"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {extractedData && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-white">
                Extracted Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={extractedData.amount}
                  onChange={(e) =>
                    setExtractedData((prev) => ({
                      ...(prev ?? {}),
                      amount: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={extractedData.date}
                  onChange={(e) =>
                    setExtractedData((prev) => ({
                      ...(prev ?? {}),
                      date: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={extractedData.description}
                  onChange={(e) =>
                    setExtractedData((prev) => ({
                      ...(prev ?? {}),
                      description: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-white"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg text-white text-sm font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Expense
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillUploadExpense;
