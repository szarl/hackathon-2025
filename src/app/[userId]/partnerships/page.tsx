'use client';

import { useState } from 'react';

export default function PartnershipsPage() {
  const [copiedCode, setCopiedCode] = useState('');

  const copyDiscountCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const recommendedProducts = [
    {
      id: 1,
      name: 'Monstera Fertilizer',
      originalPrice: 24.99,
      discountedPrice: 19.99,
      discount: 20,
      image: '🌱',
      brand: 'PlantNutrients Pro',
      description: 'Premium liquid fertilizer for healthy Monstera growth',
    },
    {
      id: 2,
      name: 'Indoor Plant Light',
      originalPrice: 79.99,
      discountedPrice: 59.99,
      discount: 25,
      image: '💡',
      brand: 'GrowBright',
      description: 'Full-spectrum LED grow light for indoor plants',
    },
  ];

  const localPartners = [
    {
      id: 1,
      name: 'Green Haven Garden Center',
      type: 'Garden Store',
      discount: '15% off',
      code: 'HAVEN15',
      address: '123 Garden St, Plant City',
      distance: '0.8 miles away',
    },
    {
      id: 2,
      name: 'Bloom & Blossom Florist',
      type: 'Florist',
      discount: '20% off plant care',
      code: 'BLOOM20',
      address: '456 Flower Ave, Green Valley',
      distance: '1.2 miles away',
    },
    {
      id: 3,
      name: 'Urban Jungle Nursery',
      type: 'Plant Nursery',
      discount: '10% off all plants',
      code: 'JUNGLE10',
      address: '789 Nature Blvd, Leaf Town',
      distance: '2.1 miles away',
    },
  ];

  return (
    <div className='relative box-border flex size-full min-h-screen flex-col bg-[#f7f9f8] p-[24px]'>
      {/* Header */}
      <div className='relative mb-[32px] w-full'>
        <div className="relative w-full font-['Inter:Medium',_sans-serif] text-[28px] font-medium tracking-[0.0703px] text-[#111111]">
          <h1 className='text-center leading-[36px]'>Exclusive Discounts for You</h1>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className='relative mb-[32px] w-full rounded-[16px] bg-[rgba(42,127,98,0.1)] p-[24px]'>
        <div className="mb-[8px] font-['Inter:Medium',_sans-serif] text-[18px] font-medium text-[#2a7f62]">
          <p className='leading-[24px]'>🎉 Welcome to Exclusive Offers</p>
        </div>
        <div className="font-['Inter:Regular',_sans-serif] text-[14px] font-normal text-[#9aa3a7]">
          <p className='leading-[20px]'>Your exclusive access to discounts on plant care accessories.</p>
        </div>
      </div>

      {/* Discount Code Card */}
      <div className='relative mb-[32px] w-full rounded-[16px] border border-solid border-[rgba(17,17,17,0.1)] bg-white p-[24px] shadow-sm'>
        <div className="mb-[12px] font-['Inter:Medium',_sans-serif] text-[16px] font-medium text-[#111111]">
          <p className='leading-[22px]'>Your Special Discount Code</p>
        </div>
        <div className='relative flex items-center justify-between rounded-[8px] bg-[#2a7f62] p-[16px]'>
          <div className="font-['Inter:Medium',_sans-serif] text-[24px] font-medium tracking-[2px] text-white">
            FLOWERAI25
          </div>
          <button
            onClick={() => copyDiscountCode('FLOWERAI25')}
            className='bg-opacity-20 hover:bg-opacity-30 rounded-[6px] bg-white px-[12px] py-[6px] text-white transition-all'
          >
            <div className="font-['Inter:Medium',_sans-serif] text-[12px] font-medium text-[#111111]">
              {copiedCode === 'FLOWERAI25' ? 'Copied!' : 'Copy'}
            </div>
          </button>
        </div>
        <div className="mt-[8px] font-['Inter:Regular',_sans-serif] text-[12px] font-normal text-[#9aa3a7]">
          <p className='leading-[16px]'>Valid until end of month • Use at any partner store</p>
        </div>
      </div>

      {/* Recommended for Your Plants Section */}
      <div className='relative mb-[32px] w-full'>
        <div className="mb-[16px] font-['Inter:Medium',_sans-serif] text-[20px] font-medium text-[#111111]">
          <h2 className='leading-[28px]'>Recommended for Your Plants</h2>
        </div>
        <div className='flex flex-col gap-[16px]'>
          {recommendedProducts.map((product) => (
            <div
              key={product.id}
              className='relative rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)] bg-white p-[16px] shadow-sm'
            >
              <div className='flex items-start gap-[12px]'>
                <div className='relative flex size-[60px] shrink-0 items-center justify-center rounded-[8px] bg-[rgba(42,127,98,0.1)] text-[28px]'>
                  {product.image}
                </div>
                <div className='flex-1'>
                  <div className='mb-[4px] flex items-start justify-between'>
                    <div className="font-['Inter:Medium',_sans-serif] text-[16px] font-medium text-[#111111]">
                      <p className='leading-[22px]'>{product.name}</p>
                    </div>
                    <div className='rounded-[4px] bg-[#2a7f62] px-[8px] py-[2px]'>
                      <div className="font-['Inter:Medium',_sans-serif] text-[12px] font-medium text-white">
                        -{product.discount}%
                      </div>
                    </div>
                  </div>
                  <div className="mb-[4px] font-['Inter:Regular',_sans-serif] text-[12px] font-normal text-[#9aa3a7]">
                    <p className='leading-[16px]'>{product.brand}</p>
                  </div>
                  <div className="mb-[8px] font-['Inter:Regular',_sans-serif] text-[13px] font-normal text-[#9aa3a7]">
                    <p className='leading-[18px]'>{product.description}</p>
                  </div>
                  <div className='flex items-center gap-[8px]'>
                    <div className="font-['Inter:Medium',_sans-serif] text-[16px] font-medium text-[#2a7f62]">
                      ${product.discountedPrice}
                    </div>
                    <div className="font-['Inter:Regular',_sans-serif] text-[14px] font-normal text-[#9aa3a7] line-through">
                      ${product.originalPrice}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Partners Section */}
      <div className='relative mb-[32px] w-full'>
        <div className="mb-[16px] font-['Inter:Medium',_sans-serif] text-[20px] font-medium text-[#111111]">
          <h2 className='leading-[28px]'>Local Partners</h2>
        </div>
        <div className='flex flex-col gap-[12px]'>
          {localPartners.map((partner) => (
            <div
              key={partner.id}
              className='relative rounded-[12px] border border-solid border-[rgba(17,17,17,0.1)] bg-white p-[16px] shadow-sm'
            >
              <div className='mb-[8px] flex items-start justify-between'>
                <div>
                  <div className="mb-[2px] font-['Inter:Medium',_sans-serif] text-[16px] font-medium text-[#111111]">
                    <p className='leading-[22px]'>{partner.name}</p>
                  </div>
                  <div className="font-['Inter:Regular',_sans-serif] text-[12px] font-normal text-[#9aa3a7]">
                    <p className='leading-[16px]'>
                      {partner.type} • {partner.distance}
                    </p>
                  </div>
                </div>
                <div className='rounded-[4px] bg-[rgba(42,127,98,0.1)] px-[8px] py-[4px]'>
                  <div className="font-['Inter:Medium',_sans-serif] text-[12px] font-medium text-[#2a7f62]">
                    {partner.discount}
                  </div>
                </div>
              </div>
              <div className="mb-[12px] font-['Inter:Regular',_sans-serif] text-[13px] font-normal text-[#9aa3a7]">
                <p className='leading-[18px]'>{partner.address}</p>
              </div>
              <div className='flex items-center justify-between rounded-[6px] border border-solid border-[rgba(17,17,17,0.1)] bg-[#f7f9f8] p-[12px]'>
                <div className="font-['Inter:Medium',_sans-serif] text-[14px] font-medium text-[#111111]">
                  Code: {partner.code}
                </div>
                <button
                  onClick={() => copyDiscountCode(partner.code)}
                  className='rounded-[4px] bg-[#2a7f62] px-[12px] py-[4px] text-white transition-all hover:bg-[#236b54]'
                >
                  <div className="font-['Inter:Medium',_sans-serif] text-[12px] font-medium">
                    {copiedCode === partner.code ? 'Copied!' : 'Copy'}
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Discounts Button */}
      <div className='relative w-full'>
        <button className='relative flex h-[48px] w-full shrink-0 items-center justify-center rounded-[6px] bg-[#2a7f62] transition-all hover:bg-[#236b54]'>
          <div className="font-['Inter:Medium',_sans-serif] text-[14px] leading-[0] font-medium tracking-[-0.1504px] text-nowrap text-white not-italic">
            <p className='leading-[20px] whitespace-pre'>View All Discounts</p>
          </div>
        </button>
      </div>
    </div>
  );
}
