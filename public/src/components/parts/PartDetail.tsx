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
    const thumbUrl = img.thumb_url || img.url;
    if (thumbUrl && typeof thumbUrl === 'string' && !thumbUrl.endsWith('thumb_') && thumbUrl !== '0') return thumbUrl;
    const path = String(img.thumb_path || img.file_path || img.path || '').trim();
    if (!path || path === '0' || path === 'false' || path.endsWith('thumb_') || path.endsWith('/thumb_')) return '';
    if (/^(https?:\/\/|data:image\/)/i.test(path)) return path;
    return `${storageBase}/storage/${String(path).replace(/^\/?storage\//, '').replace(/^\/+/, '')}`;
  };

  const getPartImageUrl = (part: any) => {
    if (!part) return null;
    const specs = part.technical_specs;
    if (specs) {
      if (Array.isArray(specs)) {
        for (const s of specs) {
          try {
            const parsed = typeof s === 'string' ? JSON.parse(s) : s;
            if (parsed?.key === '__image_data' || parsed?.key === 'image') {
              if (typeof parsed?.value === 'string' && (parsed.value.startsWith('data:image/') || parsed.value.startsWith('http'))) {
                return parsed.value;
              }
            }
          } catch {}
        }
      } else if (typeof specs === 'object') {
        const val = specs.__image_data || specs.image;
        if (typeof val === 'string' && (val.startsWith('data:image/') || val.startsWith('http'))) {
          return val;
        }
      }
    }
    return null;
  };

  const validImages = (() => {
    const fromImages = (p.images || []).map((img: any) => getImageUrl(img)).filter(Boolean);
    const inline = getPartImageUrl(p);
    return Array.from(new Set([...(inline ? [inline] : []), ...fromImages]));
  })();

  return (
    <div className="bg-white shadow rounded p-4 space-y-2">
      <h2 className="text-xl font-bold">{p.name}</h2>
      <p><strong>Part Number:</strong> {p.part_number}</p>
      <p><strong>Brand:</strong> {p.brand?.name}</p>
      <p><strong>Category:</strong> {p.category?.name}</p>
      <div className="flex flex-wrap">
        {validImages.map((url: string, idx: number) => (
          <img
            key={idx}
            src={url}
            alt={p.name || `Image ${idx + 1}`}
            className="w-32 h-32 object-cover m-1 rounded border border-slate-200"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PartDetail;
