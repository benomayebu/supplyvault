import { Metadata } from 'next';
import ReviewQueueClient from '@/components/review/review-queue-client';

export const metadata: Metadata = {
  title: 'Manual Review Queue | SupplyVault',
  description: 'Review and approve pending certifications',
};

export default function ReviewPage() {
  return <ReviewQueueClient />;
}
