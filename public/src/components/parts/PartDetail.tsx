// src/components/parts/PartDetail.tsx
import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { endpoints } from '../../api/endpoints';
import axiosClient from '../../api/axiosClient';

interface PartDetailProps {
  partId: string;
}

const PartDetail: React.FC<PartDetailProps> = ({ partId }) => {
  const { data: part, error } = useFetch(endpoints.PARTS.DETAIL(partId));

  if (!part || !part.data) return (
    <div className="bg-white shadow rounded p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
      <div className="h-4 bg-slate-200 rounded w-1/5"></div>
      <div className="flex gap-2 pt-2">
        <div className="w-32 h-32 bg-slate-200 rounded-lg"></div>
        <div className="w-32 h-32 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );
  if (error) return <div className="p-4 text-red-600">Failed to load part</div>;

  const p = part.data;

  // build storage base from axios client baseURL (e.g. https://api.example.com/api -> https://api.example.com)
  const storageBase = (() => {
    try {
      const b = axiosClient.defaults.baseURL || '';
      return b.replace(/\/api\/?$/, '');
    } catch (e) {
      return (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
    }
  })();

  const getImageUrl = (img: any) => {
    if (!img) return '';
    if (img.thumb_url || img.url) return img.thumb_url || img.url;
    const path = img.thumb_path || img.file_path || img.path;
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return `${storageBase}/storage/${String(path).replace(/^\/?storage\//, '').replace(/^\/+/, '')}`;
  };

  return (
    <div className="bg-white shadow rounded p-4 space-y-2">
      <h2 className="text-xl font-bold">{p.name}</h2>
      <p><strong>Part Number:</strong> {p.part_number}</p>
      <p><strong>Brand:</strong> {p.brand?.name}</p>
      <p><strong>Category:</strong> {p.category?.name}</p>
      <div className="flex flex-wrap">
        {p.images?.map((img: any) => (
          <img key={img.id} src={getImageUrl(img)} alt={img.id} className="w-32 h-32 object-cover m-1" />
        ))}
      </div>
    </div>
  );
};

export default PartDetail;
