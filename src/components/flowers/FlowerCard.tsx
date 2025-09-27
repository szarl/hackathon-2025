'use client';

import { type FlowerRecord } from '@/services/actions/flowerActions';
import Link from 'next/link';

interface FlowerCardProps {
  flower: FlowerRecord;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export default function FlowerCard({ flower, onDelete, isDeleting }: FlowerCardProps) {
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'diseased':
        return 'bg-red-100 text-red-800';
      case 'needs_attention':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'diseased':
        return '🚨';
      case 'needs_attention':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-200 hover:shadow-lg'>
      <Link href={`/${flower.user_id}/flowers/${flower.id}`}>
        <div className='aspect-square overflow-hidden bg-gray-200'>
          <img
            src={flower.image_url}
            alt={flower.name}
            className='h-full w-full object-cover transition-transform duration-200 hover:scale-105'
          />
        </div>
      </Link>

      <div className='p-4'>
        <div className='mb-2 flex items-center justify-between'>
          <h3 className='truncate text-lg font-semibold text-gray-900'>{flower.name}</h3>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getHealthStatusColor(flower.health_status)}`}
          >
            {getHealthStatusIcon(flower.health_status)} {flower.health_status.replace('_', ' ')}
          </span>
        </div>

        {/* Description */}
        <p className='mb-3 line-clamp-3 text-sm text-gray-600'>{flower.description}</p>

        {/* Confidence Score */}
        <div className='mb-3'>
          <div className='mb-1 flex items-center justify-between text-xs text-gray-500'>
            <span>AI Confidence</span>
            <span>{Math.round(flower.confidence_score * 100)}%</span>
          </div>
          <div className='h-1.5 w-full rounded-full bg-gray-200'>
            <div
              className='h-1.5 rounded-full bg-green-600'
              style={{ width: `${flower.confidence_score * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Recommendations Preview */}
        {flower.recommendations && (
          <div className='mb-3'>
            <p className='mb-1 text-xs text-gray-500'>Care Tips:</p>
            <p className='line-clamp-2 text-sm text-gray-700'>{flower.recommendations}</p>
          </div>
        )}

        {/* Health Notes */}
        {flower.health_notes && (
          <div className='mb-3'>
            <p className='mb-1 text-xs text-gray-500'>Health Notes:</p>
            <p className='line-clamp-2 text-sm text-gray-700'>{flower.health_notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-gray-100 pt-3'>
          <span className='text-xs text-gray-500'>Added {formatDate(flower.created_at)}</span>
          <button
            onClick={() => onDelete(flower.id)}
            disabled={isDeleting}
            className='text-sm font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
