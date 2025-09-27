'use client';

import { useState } from 'react';
import { deleteFlower, type FlowerRecord } from '@/services/actions/flowerActions';
import FlowerCard from './FlowerCard';

interface FlowerGridProps {
  flowers: FlowerRecord[];
  userId: string;
}

export default function FlowerGrid({ flowers, userId }: FlowerGridProps) {
  const [flowerList, setFlowerList] = useState(flowers);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (flowerId: string) => {
    if (!confirm('Are you sure you want to delete this flower?')) {
      return;
    }

    setDeletingId(flowerId);
    try {
      const result = await deleteFlower(flowerId, userId);

      if (result.success) {
        setFlowerList((prev) => prev.filter((flower) => flower.id !== flowerId));
      } else {
        alert(`Delete failed: ${result.message}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete flower');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {flowerList.map((flower) => (
        <FlowerCard key={flower.id} flower={flower} onDelete={handleDelete} isDeleting={deletingId === flower.id} />
      ))}
    </div>
  );
}
