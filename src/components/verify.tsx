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

  const code = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : '';

  useEffect(() => {
    const run = async () => {
      if (!code) return;
      try {
        setLoading(true);
        setError(null);
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/user/verify/${code}`);
        setData(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? e.message ?? 'Failed to verify');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [code]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Certificate Verification</h1>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && data && (
        <div className="border rounded p-4">
          <div className={`mb-2 font-medium ${data.valid ? 'text-green-700' : 'text-red-700'}`}>
            {data.valid ? 'Valid Certificate' : 'Invalid Certificate'}
          </div>
          <div className="text-sm text-gray-700 mb-4">{data.message}</div>
          {data.intern && (
            <div className="space-y-1">
              <div><span className="font-semibold">Name:</span> {data.intern.fullName}</div>
              <div><span className="font-semibold">Email:</span> {data.intern.email}</div>
              <div><span className="font-semibold">Code:</span> <span className="font-mono">{data.intern.certificateCode}</span></div>
            </div>
          )}
        </div>
      )}
      <div className="mt-4">
        <a href="/" className="text-blue-600 underline">Back to Users</a>
      </div>
    </div>
  );
}
