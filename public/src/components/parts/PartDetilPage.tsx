// src/pages/PartDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import { endpoints } from '../../api/endpoints';
import { useToast } from '../../hooks/useToast';
import axiosClient from '../../api/axiosClient';

const PartDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const detailUrl = id ? endpoints.PARTS.DETAIL(id) : '';
  const { data: part } = useFetch(detailUrl);
  const { mutate: deletePart } = useMutation(endpoints.PARTS.DELETE, 'delete');
  const navigate = useNavigate();
  const toast = useToast();

  if (!part?.data) return (
    <div className="bg-white shadow-md p-6 rounded-lg max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="flex justify-between items-center border-b pb-4">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-9 bg-slate-200 rounded w-24"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-5 bg-slate-200 rounded w-1/2"></div>
        <div className="h-5 bg-slate-200 rounded w-1/2"></div>
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
      </div>
      <div className="flex gap-4 pt-4">
        <div className="w-40 h-40 bg-slate-200 rounded-lg"></div>
        <div className="w-40 h-40 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
  );

  const handleDelete = async () => {
    if (!confirm('Are you sure to delete this part?')) return;
    try {
      // pass id as second param to construct URL correctly
      await deletePart(undefined, id!);
      toast.success('Part deleted');
      navigate('/dashboard/parts');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const data = part.data;

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
    const fromImages = (data.images || []).map((img: any) => getImageUrl(img)).filter(Boolean);
    const inline = getPartImageUrl(data);
    return Array.from(new Set([...(inline ? [inline] : []), ...fromImages]));
  })();

  return (
    <div className="bg-white shadow-md p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{data.name}</h2>
        <div className="space-x-2">
          <button
            onClick={() => navigate(`/dashboard/parts/edit/${id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>

      <p><strong>Part Number:</strong> {data.part_number}</p>
  <p><strong>Agent:</strong> {data.agent?.name || data.agent_name || data.part_item?.agent?.name || '-'}</p>
      <p><strong>Brand:</strong> {data.brand?.name}</p>
      <p><strong>Category:</strong> {data.category?.system}</p>
      <p><strong>Description:</strong> {data.description}</p>

      {validImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {validImages.map((url: string, idx: number) => (
            <img
              key={idx}
              src={url}
              alt={data.name || `Image ${idx + 1}`}
              className="w-full h-40 object-cover rounded border"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PartDetailPage;
