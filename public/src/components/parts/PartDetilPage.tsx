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
    if (thumbUrl && typeof thumbUrl === 'string' && !thumbUrl.includes('laykenegn.s3') && !thumbUrl.endsWith('thumb_') && thumbUrl !== '0') return thumbUrl;
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

  const getPartCondition = (p: any) => {
    const raw = String(p?.condition || p?.items?.[0]?.condition || 'new').toLowerCase().trim();
    if (raw === 'used') return { label: 'Used', className: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (raw === 'refurb' || raw === 'refurbished') return { label: 'Refurbished', className: 'text-purple-700 bg-purple-50 border-purple-200' };
    return { label: 'New', className: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const cond = getPartCondition(data);
  const shelf = data.shelf || data.items?.[0]?.shelf || 'N/A';

  return (
    <div className="bg-white shadow-md p-6 rounded-lg space-y-4">
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-800">{data.name}</h2>
          <span className={`inline-flex items-center text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${cond.className}`}>
            {cond.label}
          </span>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => navigate(`/dashboard/parts/edit/${id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <p><strong>Part Number:</strong> {data.part_number || data.sku || '-'}</p>
        <p><strong>Condition:</strong> <span className={`inline-block ml-1 font-bold text-xs uppercase px-2 py-0.5 rounded border ${cond.className}`}>{cond.label}</span></p>
        <p><strong>Shelf / Location:</strong> <span className="inline-block ml-1 font-bold text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">{shelf}</span></p>
        <p><strong>Agent:</strong> {data.agent?.name || data.agent_name || data.part_item?.agent?.name || '-'}</p>
        <p><strong>Brand:</strong> {data.brand?.name || '-'}</p>
        <p><strong>Category:</strong> {data.category?.system || data.category?.name || '-'}</p>
        <p className="md:col-span-2"><strong>Description:</strong> {data.description || 'No description'}</p>
      </div>

      {validImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2 border-t">
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
