'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Certification {
  id: string;
  certification_name: string;
  certification_type: string;
  certificate_number?: string;
  issuing_body: string;
  issue_date: string;
  expiry_date: string;
  extraction_confidence?: number;
  verification_status: string;
  needs_review: boolean;
  supplier: {
    id: string;
    name: string;
    country: string;
    contact_email?: string;
  };
  emailImport?: {
    sender_email: string;
    sender_name?: string;
    received_date: string;
  };
  created_at: string;
}

export default function ReviewQueueClient() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/certifications/review?status=pending');
      const data = await response.json();
      if (data.success) {
        setCertifications(data.certifications);
      }
    } catch (error) {
      console.error('Error fetching review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (certId: string, action: 'approve' | 'reject') => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/certifications/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificationId: certId,
          action,
          notes: reviewNotes,
        }),
      });

      if (response.ok) {
        // Remove from queue
        setCertifications(prev => prev.filter(c => c.id !== certId));
        setSelectedCert(null);
        setReviewNotes('');
      }
    } catch (error) {
      console.error('Error reviewing certification:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading review queue...</div>
      </div>
    );
  }

  if (certifications.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No certifications pending review
          </h3>
          <p className="text-gray-500">
            All certifications have been reviewed or verified automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manual Review Queue</h1>
        <p className="mt-2 text-sm text-gray-600">
          {certifications.length} certification(s) need manual review
        </p>
      </div>

      <div className="space-y-4">
        {certifications.map(cert => (
          <div
            key={cert.id}
            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {cert.certification_name}
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    {cert.certification_type}
                  </span>
                  {cert.extraction_confidence !== null && cert.extraction_confidence !== undefined && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {Math.round(cert.extraction_confidence * 100)}% confidence
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Supplier:</span> {cert.supplier.name}
                  </div>
                  <div>
                    <span className="font-medium">Country:</span> {cert.supplier.country}
                  </div>
                  <div>
                    <span className="font-medium">Certificate #:</span>{' '}
                    {cert.certificate_number || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Issuing Body:</span> {cert.issuing_body}
                  </div>
                  <div>
                    <span className="font-medium">Issue Date:</span>{' '}
                    {new Date(cert.issue_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Expiry Date:</span>{' '}
                    {new Date(cert.expiry_date).toLocaleDateString()}
                  </div>
                </div>

                {cert.emailImport && (
                  <div className="text-xs text-gray-500 mb-4">
                    Imported from email: {cert.emailImport.sender_email} •{' '}
                    {formatDistanceToNow(new Date(cert.emailImport.received_date), {
                      addSuffix: true,
                    })}
                  </div>
                )}

                {selectedCert?.id === cert.id && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)}
                      placeholder="Add review notes (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(cert.id, 'approve')}
                        disabled={submitting}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                      >
                        {submitting ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReview(cert.id, 'reject')}
                        disabled={submitting}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
                      >
                        {submitting ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCert(null);
                          setReviewNotes('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selectedCert?.id !== cert.id && (
                <button
                  onClick={() => setSelectedCert(cert)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
