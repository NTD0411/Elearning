import { useEffect, useState } from 'react';

// Certificate Modal Component
function CertificateModal({ 
  isOpen, 
  onClose, 
  imageUrl 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  imageUrl: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
         onClick={onClose}>
      <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto"
           onClick={e => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button onClick={onClose}
                  className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <img 
             src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:5074${imageUrl}`}
             alt="Certificate" 
             className="max-w-full max-h-[70vh] object-contain"
             onError={(e) => {
               const target = e.target as HTMLImageElement;
               target.onerror = null;
               console.error('Error loading certificate:', imageUrl);
             }} />
      </div>
    </div>
  );
}

interface UserRequest {
  userId: number;
  fullName: string;
  email: string;
  portraitUrl?: string;
  certificateUrl?: string;
  experience?: string;
  createdAt?: string;
}

export default function MentorRequests() {
  const [items, setItems] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

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
      
      {/* Certificate Modal */}
      <CertificateModal
        isOpen={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        imageUrl={selectedCertificate || ''}
      />
      <div className="space-y-4">
        {items.map((u) => (
          <div key={u.userId} className="border rounded p-4">
            <div className="font-semibold">{u.fullName} ({u.email})</div>
            {u.certificateUrl && (
              <div className="mt-2">
                <button
                  onClick={() => u.certificateUrl && setSelectedCertificate(u.certificateUrl)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  View Certificate
                </button>
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


