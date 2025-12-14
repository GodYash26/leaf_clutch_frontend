import { useEffect, useState } from 'react';
import axios from 'axios';

type VerifyResponse = {
  valid: boolean;
  message: string;
  intern?: {
    fullName: string;
    email: string;
    certificateCode: string;
  };
};

export default function Verify() {
  const [data, setData] = useState<VerifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCode, setSearchCode] = useState('');

  const urlCode = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

  const verifyCode = async (code: string) => {
    if (!code) {
      setError('Please enter a certificate code');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setData(null);
      // Use GET with query params for search
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/search?code=${encodeURIComponent(code)}`);
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e.message ?? 'Failed to verify');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(searchCode);
  };

  useEffect(() => {
    if (urlCode && urlCode !== 'verify') {
      setSearchCode(urlCode);
      verifyCode(urlCode);
    }
  }, [urlCode]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Certificate Verification</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Enter certificate code (e.g., LC-86528U)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !searchCode.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && <div className="text-center py-4">Loading…</div>}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Results */}
      {!loading && !error && data && (
        <div className={`border-2 rounded-lg p-6 ${data.valid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-4">
            {data.valid ? (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <h2 className={`text-xl font-semibold ${data.valid ? 'text-green-800' : 'text-red-800'}`}>
              {data.valid ? '✓ Valid Certificate' : '✗ Invalid Certificate'}
            </h2>
          </div>
          
          <p className={`mb-4 ${data.valid ? 'text-green-700' : 'text-red-700'}`}>
            {data.message}
          </p>
          
          {data.intern && (
            <div className="bg-white rounded p-4 space-y-3">
              <h3 className="font-semibold text-gray-800 mb-3">Internship Details:</h3>
              <div className="grid gap-2">
                <div className="flex">
                  <span className="font-semibold text-gray-600 w-32">Name:</span>
                  <span className="text-gray-900">{data.intern.fullName}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-600 w-32">Email:</span>
                  <span className="text-gray-900">{data.intern.email}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-600 w-32">Certificate Code:</span>
                  <span className="font-mono text-blue-600 font-medium">{data.intern.certificateCode}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6">
        <a href="/" className="text-blue-600 hover:underline">← Back to Users</a>
      </div>
    </div>
  );
}
