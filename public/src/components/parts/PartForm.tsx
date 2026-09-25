import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import { endpoints } from '../../api/endpoints';
import { useToast } from '../../hooks/useToast';
import { compressImages, isValidImage, formatFileSize } from '../../utils/imageCompression';

interface PartFormProps {
  partId?: string;
  onSuccess: () => void;
  mode?: 'full' | 'upload';
  controlledAgentId?: string;
  onAgentChange?: (id: string) => void;
  keepAgentAfterSubmit?: boolean;
  controlledImages?: File[] | null;
  onImagesChange?: (files: File[] | null) => void;
  hideFileInput?: boolean;
  formId?: string;
}

export default function PartForm({
  partId,
  onSuccess,
  mode = 'full',
  controlledAgentId,
  onAgentChange,
  keepAgentAfterSubmit,
  controlledImages,
  onImagesChange,
  hideFileInput,
  formId,
}: PartFormProps) {
  const toast = useToast();

  // -------------------- Form Fields --------------------
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [technicalSpecs, setTechnicalSpecs] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(true);

  const [storeId, setStoreId] = useState('');
  const [agentId, setAgentId] = useState('');
  const effectiveAgentId = controlledAgentId ?? agentId;
  const [shelf, setShelf] = useState('');
  const [isNewShelfOpen, setIsNewShelfOpen] = useState(false);
  const [newShelfName, setNewShelfName] = useState('');
  const [isCreatingShelf, setIsCreatingShelf] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurb'>('new');
  const [status] = useState('available');

  const [images, setImages] = useState<File[] | null>(null);
  const effectiveImages = controlledImages ?? images;
  const [existingImages, setExistingImages] = useState<any[] | null>(null);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [compressingImages, setCompressingImages] = useState(false);

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { data: brands, loading: brandsLoading } = useFetch(endpoints.BRANDS.LIST);
  const { data: categories, loading: categoriesLoading } = useFetch(endpoints.CATEGORIES.LIST);
  const { data: agents, loading: agentsLoading } = useFetch(endpoints.AGENTS?.LIST || '/agents');
  const { data: shelvesData, loading: shelvesLoading, refetch: refetchShelves } = useFetch(endpoints.SHELVES?.LIST || '/shelves');

  const { mutate, loading } = useMutation(
    partId ? endpoints.PARTS.UPDATE(partId) : endpoints.PARTS.CREATE,
    partId ? 'put' : 'post'
  );

  // -------------------- Load Existing Part --------------------
  const [partLoading, setPartLoading] = useState<boolean>(!!partId);

  useEffect(() => {
    if (!partId) return;

    let mounted = true;
    setPartLoading(true);
    axiosClient
      .get(endpoints.PARTS.DETAIL(partId))
      .then((res) => {
        if (!mounted) return;
        const d = res?.data?.data || res?.data || {};

        // Basic fields
        setSku(d.sku || '');
        setName(d.name || '');
        setPartNumber(d.part_number || '');
        setBrandId(d.brand_id || '');
        setCategoryId(d.category_id || '');
        setDescription(d.description || '');
        setIsActive(d.is_active ?? true);

        // -------------------- Technical Specs --------------------
        if (Array.isArray(d.technical_specs)) {
          const specObj: Record<string, string> = {};
          d.technical_specs.forEach((s: any) => {
            try {
              const parsed = typeof s === 'string' ? JSON.parse(s) : s;
              if (parsed.key) specObj[parsed.key] = parsed.value;
            } catch {
              // fallback if parsing fails
            }
          });
          setTechnicalSpecs(specObj);
        } else if (typeof d.technical_specs === 'object') {
          setTechnicalSpecs(d.technical_specs || {});
        }

        // -------------------- Part Item & Location --------------------
        setShelf(d.shelf || d.items?.[0]?.shelf || '');
        if (d.items?.length) {
          const item = d.items[0];
          setStoreId(item.store_id || '');
          setAgentId(item.agent_id || '');
          setQuantity(String(item.quantity ?? ''));
          setUnitCost(item.unit_cost || '');
          setUnitPrice(item.unit_price || '');
          setSerialNumber(item.serial_number || '');
          setCondition(item.condition || 'new');
        }

        // -------------------- Images --------------------
        if (d.images?.length) {
          setExistingImages(d.images || null);
        } else {
          setExistingImages(null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setPartLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [partId]);

  // -------------------- Handlers --------------------
  const inputBase =
    'w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  const selectBase = inputBase + ' bg-white appearance-none';
  const buttonPrimary =
    'w-full py-3 bg-blue-600 text-white rounded-lg font-semibold text-[16px] active:scale-[0.99] transition';
  const buttonSecondary =
    'px-4 py-2 rounded-lg bg-gray-100 border text-gray-700 text-sm active:scale-[0.98] transition';


  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      if (onImagesChange) onImagesChange(null);
      else setImages(null);
      return;
    }

    // Validate files
    const fileArray = Array.from(files);
    const invalidFiles = fileArray.filter((f) => !isValidImage(f));
    if (invalidFiles.length > 0) {
      toast.error(`Invalid image format: ${invalidFiles.map((f) => f.name).join(', ')}`);
      return;
    }

    // Compress images in parallel
    setCompressingImages(true);
    try {
      const compressedFiles = await compressImages(fileArray, {
        maxWidth: 1600,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeKB: 500,
      });

      const originalSize = fileArray.reduce((sum, f) => sum + f.size, 0);
      const compressedSize = compressedFiles.reduce((sum, f) => sum + f.size, 0);
      const savings = Math.round(((originalSize - compressedSize) / originalSize) * 100);

      if (savings > 0) {
        toast.success(`Images compressed: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${savings}% smaller)`);
      }

      if (onImagesChange) onImagesChange(compressedFiles);
      else setImages(compressedFiles);
    } catch (err) {
      toast.error('Failed to compress images');
      console.error('Image compression error:', err);
    } finally {
      setCompressingImages(false);
    }
  };

  const handleRemoveExistingImage = (id: string) => {
    setExistingImages((prev) => (prev ? prev.filter((i) => String(i.id) !== String(id)) : prev));
    setRemovedImageIds((prev) => [...prev, String(id)]);
  };

  // -------------------- Submit --------------------
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrors({});

    try {
      const formData = new FormData();
      if (sku) formData.append('sku', sku);
      formData.append('name', name);
      if (partNumber) formData.append('part_number', partNumber);
      if (brandId) formData.append('brand_id', brandId);
      if (categoryId) formData.append('category_id', categoryId);
      if (description) formData.append('description', description);
      if (unitCost) formData.append('unit_cost', unitCost);
      if (unitPrice) formData.append('unit_price', unitPrice);
      formData.append('part_item[condition]', condition);
      if (mode === 'full') formData.append('is_active', String(isActive));

      const specsArray = Object.entries(technicalSpecs).map(([k, v]) => ({ key: k, value: v }));
      specsArray.forEach((s, idx) => formData.append(`technical_specs[${idx}]`, JSON.stringify(s)));

      const partItem = {
        store_id: storeId || null,
        agent_id: effectiveAgentId || null,
        shelf: shelf || null,
        quantity: quantity === '' ? null : Number(quantity),
        unit_cost: unitCost || null,
        unit_price: unitPrice || null,
        serial_number: serialNumber || null,
        condition: condition || 'new',
        status: status || 'available',
      };
      Object.entries(partItem).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') return;
        formData.append(`part_item[${k}]`, String(v));
      });

      if (shelf) formData.append('shelf', shelf);
      if (effectiveAgentId) formData.append('agent_id', String(effectiveAgentId));

      if (effectiveImages && effectiveImages.length > 0) {
        effectiveImages.forEach((file, idx) => {
          formData.append('images[]', file);
          if (effectiveAgentId) {
            formData.append(`images_meta[${idx}][agent_id]`, String(effectiveAgentId));
          }
        });
      }

      // send removed existing image ids if any
      if (removedImageIds && removedImageIds.length > 0) {
        removedImageIds.forEach((id) => formData.append('remove_image_ids[]', id));
      }

      await mutate(formData, { isFormData: true });
      toast.success(partId ? 'Part updated successfully' : 'Part created successfully');
      onSuccess();

      if (mode === 'upload') {
        setName('');
        setPartNumber('');
        setBrandId('');
        setCategoryId('');
        setDescription('');
        setTechnicalSpecs({});
        setShelf('');
        setIsNewShelfOpen(false);
        setNewShelfName('');
        setQuantity('');
        setUnitCost('');
        setUnitPrice('');
        setSerialNumber('');
        setCondition('new');
        if (!controlledAgentId && !keepAgentAfterSubmit) setAgentId('');
        setImages(null);
        if (onImagesChange) onImagesChange(null);
      }
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors) {
        setErrors(validationErrors);
        const firstField = Object.keys(validationErrors)[0];
        const firstMsg = validationErrors[firstField]?.[0];
        if (firstMsg) toast.error(firstMsg);
      } else {
        toast.error('Failed to save part');
      }
    }
  };

  const handleCreateShelf = async () => {
    const trimmed = newShelfName.trim();
    if (!trimmed) {
      toast.error('Please enter a shelf name');
      return;
    }
    try {
      setIsCreatingShelf(true);
      const res = await axiosClient.post(endpoints.SHELVES?.CREATE || '/shelves', {
        name: trimmed,
      });
      const createdShelf = res?.data?.data;
      toast.success(`Shelf "${trimmed}" created!`);
      setShelf(createdShelf?.name || trimmed);
      setNewShelfName('');
      setIsNewShelfOpen(false);
      if (refetchShelves) refetchShelves();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create shelf';
      toast.error(msg);
    } finally {
      setIsCreatingShelf(false);
    }
  };

  const brandOptions = brands?.data?.data ?? [];
  const categoryOptions = categories?.data?.data ?? [];
  const agentOptions = agents?.data?.data ?? [];
  const shelfOptions = shelvesData?.data ?? (Array.isArray(shelvesData) ? shelvesData : []);
  const isFetchingBackend = Boolean(brandsLoading || categoriesLoading || agentsLoading || shelvesLoading || partLoading);
  const storageBase = axiosClient.defaults.baseURL?.replace(/\/api\/?$/, '') || window.location.origin;

  // -------------------- Render --------------------
  return (
    <div className="w-full max-w-full px-0">
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="w-full max-w-full bg-white shadow-sm border border-gray-200 rounded-none p-4 space-y-5 sm:rounded-lg sm:p-5"
        aria-labelledby="partform-heading"
      >
        <div className="flex items-center justify-between">
          <h2 id="partform-heading" className="text-lg font-bold text-gray-800">
            {partId ? 'Edit Part' : mode === 'upload' ? ' Upload Part' : 'Create New Part'}
          </h2>
        </div>

        {isFetchingBackend && (
          <div className="mb-3">
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
              <div className="h-2 bg-blue-500 w-1/3 animate-pulse" />
            </div>
            <p className="mt-2 text-sm text-gray-500">Loading data from server...</p>
          </div>
        )}

        {/* Part Details */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Part Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputBase}
            required
          />
          {errors?.name && <p className="text-sm text-red-600">{errors.name[0]}</p>}

          <input
            type="text"
            placeholder="Part Number"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            className={inputBase}
          />

          <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={selectBase} required>
            <option value="">Select Brand</option>
            {brandOptions.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectBase}>
            <option value="">Select Category</option>
            {categoryOptions.map((c: any) => (
              <option key={c.id} value={c.id}>
                {[c.system, c.subsystem].filter(Boolean).join(' - ') || c.name || `Category ${c.id}`}
              </option>
            ))}
          </select>

         
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputBase + ' h-24 resize-y'}
          />
        </div>

       
      

    
        <div className="pt-3 border-t space-y-3">
     
          {mode === 'full' && <input type="text" placeholder="Store ID" value={storeId} onChange={(e) => setStoreId(e.target.value)} className={inputBase} />}

          <select
            value={effectiveAgentId}
            onChange={(e) => {
              const next = e.target.value;
              if (!controlledAgentId) setAgentId(next);
              if (onAgentChange) onAgentChange(next);
            }}
            className={selectBase}
          >
            <option value="">Select Agent</option>
            {agentOptions.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {/* Shelf / Location Selector */}
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <select
                  value={shelf}
                  onChange={(e) => setShelf(e.target.value)}
                  className={selectBase}
                >
                  <option value="">Select Shelf / Location</option>
                  {shelfOptions.map((s: any) => (
                    <option key={s.id || s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                  {shelf && !shelfOptions.some((s: any) => s.name === shelf) && (
                    <option value={shelf}>{shelf} (Current)</option>
                  )}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setIsNewShelfOpen((prev) => !prev)}
                className="px-3 py-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 active:scale-[0.98] transition whitespace-nowrap"
                title="Add a new shelf"
              >
                {isNewShelfOpen ? 'Cancel' : '+ New Shelf'}
              </button>
            </div>

            {/* Inline Quick Add Shelf Form */}
            {isNewShelfOpen && (
              <div className="p-3 bg-slate-50 border border-dashed border-blue-300 rounded-lg space-y-2">
                <div className="text-xs font-bold text-slate-700">Add New Shelf / Location</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Shelf 1, Shelf 2, Rack A"
                    value={newShelfName}
                    onChange={(e) => setNewShelfName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateShelf();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleCreateShelf}
                    disabled={isCreatingShelf || !newShelfName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {isCreatingShelf ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputBase} min={1} />
          <input type="number" placeholder="Initial price" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} className={inputBase} step="0.01" min="0" />
          <input type="number" placeholder="Selling price" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} className={inputBase} step="0.01" min="0" />

          <select value={condition} onChange={(e) => setCondition(e.target.value as any)} className={selectBase}>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurb">Refurbished</option>
          </select>

          {mode === 'full' && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 text-blue-600" />
              <span className="text-gray-700">Part is Active</span>
            </label>
          )}
        </div>

        {/* Images */}
        {!hideFileInput && (
          <div className="w-full border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">Upload Images (Multiple)</div>
            </div>

            <div className="flex gap-3">
              <label htmlFor="camera-input" className={buttonSecondary + ' inline-flex items-center cursor-pointer'}>Use Camera</label>
              <input id="camera-input" type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => handleFiles(e.target.files)} disabled={mode === 'upload' && !effectiveAgentId} />

              <div className="relative inline-block">
                <button type="button" className={buttonSecondary} disabled={mode === 'upload' && !effectiveAgentId}>Choose from device</button>
                <input type="file" accept="image/*" multiple style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} onChange={(e) => handleFiles(e.target.files)} disabled={mode === 'upload' && !effectiveAgentId} />
              </div>
            </div>

            {effectiveImages && effectiveImages.length > 0 && (
              <p className="mt-2 text-sm text-gray-500">
                {compressingImages ? '⏳ Compressing...' : `✓ ${effectiveImages.length} image(s) ready. Total: ${formatFileSize(effectiveImages.reduce((sum, f) => sum + f.size, 0))}`}
              </p>
            )}

            {/* Existing images when editing */}
            {existingImages && existingImages.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {existingImages.map((img: any) => (
                  <div key={img.id} className="relative inline-block">
                    <img
                      src={
                        (() => {
                          const p = img.thumb_url || img.url || img.thumb_path || img.file_path || '';
                          if (!p) return '';
                          // Data URLs and absolute HTTP URLs are used as-is
                          if (/^(data:image\/|https?:\/\/)/i.test(p)) return p;
                          // Relative storage path — prefix with backend storage base
                          return `${storageBase}/storage/${p.replace(/^\/?storage\//, '').replace(/^\/+/, '')}`;
                        })()
                      }
                      className="w-24 h-16 object-cover rounded border"
                      alt="existing"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img.id)}
                      className="absolute -top-1 -right-1 bg-white rounded-full p-1 text-sm shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div>
          <button type="submit" className={buttonPrimary} disabled={loading || compressingImages || (mode === 'upload' && (!effectiveAgentId || !(effectiveImages && effectiveImages.length > 0)))}>
            {compressingImages ? 'Compressing images...' : loading ? 'Saving...' : partId ? 'Update Part' : mode === 'upload' ? 'Upload Parts' : 'Add Part'}
          </button>
        </div>
      </form>
    </div>
  );
}
