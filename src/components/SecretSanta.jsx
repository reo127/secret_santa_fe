import { useState, useRef } from 'react';
import { Upload, AlertCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';

export default function SecretSanta() {
  const [employeeFile, setEmployeeFile] = useState(null);
  const [lastYearFile, setLastYearFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const employeeFileRef = useRef(null);
  const lastYearFileRef = useRef(null);

  const handleEmployeeFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setEmployeeFile(file);
      setError('');
    } else {
      setError('Please upload a valid Excel file (.xlsx)');
    }
  };

  const handleLastYearFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setLastYearFile(file);
      setError('');
    } else {
      setError('Please upload a valid Excel file (.xlsx)');
    }
};

    const handleGenerate = async () => {
        if (!employeeFile || !lastYearFile) {
          setError('Please upload both files');
          return;
        }
      
        setLoading(true);
        setError('');
        setResult(null);
      
        const formData = new FormData();
        formData.append('employeeList', employeeFile);
        formData.append('lastYearList', lastYearFile);
      
        try {
          const response = await fetch('https://secret-santa-be.vercel.app/api/secret-santa', {
            method: 'POST',
            body: formData,
          });
      
          if (!response.ok) {
            const errorData = await response.json(); 
            throw new Error(errorData.message || 'Failed to generate assignments');
          }
      
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
      
          const link = document.createElement('a');
          link.href = url;
          link.download = 'secret_santa_assignments.xlsx';
          document.body.appendChild(link);
          link.click();
      
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
      
          setResult({ message: 'Assignments downloaded successfully' });
        } catch (err) {
          setError(err.message || 'Something went wrong');
        } finally {
          setLoading(false);
        }
      };
      

  const handleReset = () => {
    setEmployeeFile(null);
    setLastYearFile(null);
    setResult(null);
    setError('');
    if (employeeFileRef.current) employeeFileRef.current.value = '';
    if (lastYearFileRef.current) lastYearFileRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-6">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-blue-600">Secret Santa Generator</h1>
          <p className="text-gray-500 mt-2">Upload employee and last year’s assignment files to generate new pairs</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee List (Excel)</label>
            <div className="mt-2 flex items-center space-x-3">
              <button
                onClick={() => employeeFileRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
              >
                <FileSpreadsheet className="w-5 h-5 inline mr-2" />
                {employeeFile ? employeeFile.name : 'Choose File'}
              </button>
              <input
                type="file"
                ref={employeeFileRef}
                onChange={handleEmployeeFileChange}
                accept=".xlsx"
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Year’s Assignments (Excel)</label>
            <div className="mt-2 flex items-center space-x-3">
              <button
                onClick={() => lastYearFileRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
              >
                <FileSpreadsheet className="w-5 h-5 inline mr-2" />
                {lastYearFile ? lastYearFile.name : 'Choose File'}
              </button>
              <input
                type="file"
                ref={lastYearFileRef}
                onChange={handleLastYearFileChange}
                accept=".xlsx"
                className="hidden"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
              <AlertCircle className="w-5 h-5 inline mr-2" />
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleGenerate}
              disabled={loading || !employeeFile || !lastYearFile}
              className={`flex-1 px-4 py-2 text-white rounded-md ${
                loading || !employeeFile || !lastYearFile
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400'
              }`}
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin inline" />
              ) : (
                <>
                  <Upload className="w-5 h-5 inline mr-2" />
                  Generate Assignments
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-300"
            >
              Reset
            </button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-green-50 text-green-600 rounded-lg border border-green-200">
              <h3 className="font-bold text-lg">
                {result.hasMatches ? 'Matches Found with Last Year' : 'Assignments Generated Successfully'}
              </h3>
              <p className="text-sm mt-1">{result.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
