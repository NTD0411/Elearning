import { useEffect, useState } from 'react';

interface UserRequest {
  userId: number;
  fullName: string;
  email: string;
  portraitUrl?: string; // certificate url reused
  experience?: string;
  createdAt?: string;
}

export default function MentorRequests() {
  const [items, setItems] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Add proper authentication token here
      // For now, this might work if backend allows anonymous access to this endpoint
      const res = await fetch('http://localhost:5074/api/User/mentor-requests/pending');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (userId: number) => {
    // TODO: Add proper authentication token here
    const res = await fetch(`http://localhost:5074/api/User/${userId}/mentor-requests/approve`, { 
      method: 'POST',
      // headers: { 'Authorization': 'Bearer YOUR_TOKEN_HERE' }
    });
    if (res.ok) load();
  };

  const reject = async (userId: number) => {
    const reason = prompt('Enter rejection reason:') || '';
    // TODO: Add proper authentication token here
    const res = await fetch(`http://localhost:5074/api/User/${userId}/mentor-requests/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer YOUR_TOKEN_HERE' },
      body: JSON.stringify(reason)
    });
    if (res.ok) load();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mentor Requests</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="space-y-4">
        {items.map((u) => (
          <div key={u.userId} className="border rounded p-4">
            <div className="font-semibold">{u.fullName} ({u.email})</div>
            {u.portraitUrl && (
              <div className="mt-2">
                <a href={u.portraitUrl} target="_blank" className="text-blue-600">Certificate</a>
              </div>
            )}
            {u.experience && <p className="mt-2 whitespace-pre-wrap text-sm">{u.experience}</p>}
            <div className="mt-3 space-x-2">
              <button onClick={() => approve(u.userId)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
              <button onClick={() => reject(u.userId)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


