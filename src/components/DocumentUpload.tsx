'use client';

import { useState, useRef } from 'react';
import { X, Plus, Upload, Trash2 } from 'lucide-react';

interface AdditionalDocument {
  id: string;
  label: string;
  file: File;
  preview: string;
}

interface DocumentUploadProps {
  nidPhoto: File | null;
  studentIdPhoto: File | null;
  additionalDocuments: AdditionalDocument[];
  onNidPhotoChange: (file: File | null) => void;
  onStudentIdPhotoChange: (file: File | null) => void;
  onAdditionalDocumentsChange: (documents: AdditionalDocument[]) => void;
  nidPreview?: string | null;
  studentIdPreview?: string | null;
  showRequired?: boolean;
}

export default function DocumentUpload({
  nidPhoto,
  studentIdPhoto,
  additionalDocuments,
  onNidPhotoChange,
  onStudentIdPhotoChange,
  onAdditionalDocumentsChange,
  nidPreview,
  studentIdPreview,
  showRequired = false
}: DocumentUploadProps) {
  const nidInputRef = useRef<HTMLInputElement>(null);
  const studentIdInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null, type: 'nidPhoto' | 'studentIdPhoto') => {
    if (type === 'nidPhoto') {
      onNidPhotoChange(file);
    } else {
      onStudentIdPhotoChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'nidPhoto' | 'studentIdPhoto') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file, type);
    }
  };

  const handleAdditionalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newDoc: AdditionalDocument = {
          id: Date.now().toString(),
          label: '',
          file,
          preview: ev.target?.result as string
        };
        onAdditionalDocumentsChange([...additionalDocuments, newDoc]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newDoc: AdditionalDocument = {
          id: Date.now().toString(),
          label: '',
          file,
          preview: ev.target?.result as string
        };
        onAdditionalDocumentsChange([...additionalDocuments, newDoc]);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateDocumentLabel = (id: string, label: string) => {
    onAdditionalDocumentsChange(
      additionalDocuments.map(doc => 
        doc.id === id ? { ...doc, label } : doc
      )
    );
  };

  const removeDocument = (id: string) => {
    onAdditionalDocumentsChange(
      additionalDocuments.filter(doc => doc.id !== id)
    );
  };

  const renderFileUpload = (
    type: 'nidPhoto' | 'studentIdPhoto',
    label: string,
    description: string,
    preview: string | null,
    file: File | null,
    inputRef: React.RefObject<HTMLInputElement>
  ) => (
    <div>
      <label className="block font-semibold mb-2">
        {label} {showRequired && <span className="text-red-500">*</span>}
      </label>
      <div
        className="w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition hover:border-blue-400 bg-gray-50 relative"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => handleDrop(e, type)}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt={`${label} Preview`} className="h-32 object-contain mb-2 rounded shadow" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFileChange(null, type);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-400 text-sm mb-2">Drag & drop or click to upload {label.toLowerCase()}</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null, type)}
        />
      </div>
      {file && (
        <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
          <span>{file.name}</span>
          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Required Documents */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          Required Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderFileUpload(
            'nidPhoto',
            'NID Photo',
            'Upload a clear photo of your NID',
            nidPreview,
            nidPhoto,
            nidInputRef
          )}
          {renderFileUpload(
            'studentIdPhoto',
            'Student ID Photo',
            'Upload a clear photo of your Student ID',
            studentIdPreview,
            studentIdPhoto,
            studentIdInputRef
          )}
        </div>
      </div>

      {/* Additional Documents */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Additional Documents
          </h3>
          <button
            type="button"
            onClick={() => additionalInputRef.current?.click()}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Document
          </button>
        </div>

        <input
          ref={additionalInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAdditionalFileChange}
        />

        {additionalDocuments.length === 0 ? (
          <div
            className="w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition hover:border-blue-400 bg-gray-50"
            onClick={() => additionalInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleAdditionalDrop}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-400 text-sm mb-2">Drag & drop or click to add additional documents</span>
            <span className="text-gray-300 text-xs">Certificates, awards, or other relevant documents</span>
          </div>
        ) : (
          <div className="space-y-4">
            {additionalDocuments.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={doc.preview} 
                      alt="Document Preview" 
                      className="h-20 w-20 object-cover rounded border"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document Label *
                      </label>
                      <input
                        type="text"
                        value={doc.label}
                        onChange={(e) => updateDocumentLabel(doc.id, e.target.value)}
                        placeholder="e.g., Academic Certificate, Award Certificate, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{doc.file.name}</span>
                      <span>{(doc.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(doc.id)}
                    className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {showRequired && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>• NID Photo and Student ID Photo are required for registration</p>
          <p>• Additional documents are optional but recommended</p>
          <p>• Supported formats: JPG, PNG, GIF (Max 5MB per file)</p>
        </div>
      )}
    </div>
  );
} 