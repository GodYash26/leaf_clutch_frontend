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
    <div className="verify-container">
      <h1 className="verify-title">Certificate Verification</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-form-group">
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Enter certificate code (e.g., LC-86528U)"
            className="search-input"
          />
          <button
            type="submit"
            disabled={loading || !searchCode.trim()}
            className="btn-verify"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && <div className="loading-state">Loading…</div>}
      
      {/* Error State */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {/* Results */}
      {!loading && !error && data && (
        <div className={`verify-result ${data.valid ? 'verify-result-valid' : 'verify-result-invalid'}`}>
          <div className="verify-result-header">
            {data.valid ? (
              <svg className="verify-icon verify-icon-valid" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="verify-icon verify-icon-invalid" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <h2 className={`verify-result-title ${data.valid ? 'verify-result-title-valid' : 'verify-result-title-invalid'}`}>
              {data.valid ? '✓ Valid Certificate' : '✗ Invalid Certificate'}
            </h2>
          </div>
          
          <p className={`verify-message ${data.valid ? 'verify-message-valid' : 'verify-message-invalid'}`}>
            {data.message}
          </p>
          
          {data.intern && (
            <div className="verify-details">
              <h3 className="verify-details-title">Internship Details:</h3>
              <div className="verify-details-grid">
                <div className="verify-details-row">
                  <span className="verify-details-label">Name:</span>
                  <span className="verify-details-value">{data.intern.fullName}</span>
                </div>
                <div className="verify-details-row">
                  <span className="verify-details-label">Email:</span>
                  <span className="verify-details-value">{data.intern.email}</span>
                </div>
                <div className="verify-details-row">
                  <span className="verify-details-label">Certificate Code:</span>
                  <span className="verify-details-value verify-details-code">{data.intern.certificateCode}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="verify-footer">
        <a href="/" className="verify-back-link">← Back to Users</a>
      </div>
    </div>
  );
}
