'use client';
import { useState } from 'react';
import Papa from 'papaparse';

export default function CSVUploadZone({ onDataLoaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const processFile = (file) => {
    if (!file || (file.type !== 'text/csv' && !file.name.endsWith('.csv'))) {
      setError('Invalid file type. Please upload a valid .csv file.');
      return;
    }

    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.data && onDataLoaded) {
          onDataLoaded(results.data);
        }
      },
      error: (err) => {
        setError(`Parsing error: ${err.message}`);
      }
    });
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
        isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-white hover:border-indigo-400'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
      }}
    >
      <div className="text-3xl mb-2">📁</div>
      <p className="text-sm font-medium text-slate-700">Drag and drop your bank CSV statement here</p>
      <p className="text-xs text-slate-400 mt-1">or click to browse local files</p>
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        id="csv-file-input"
        onChange={(e) => processFile(e.target.files[0])}
      />
      <label 
        htmlFor="csv-file-input" 
        className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 cursor-pointer transition-all"
      >
        Select File
      </label>
      {error && <p className="text-xs text-rose-500 mt-3 font-medium">{error}</p>}
    </div>
  );
}