import { useMemo, useState } from "react";
import { 
  FiSearch, FiEdit3, FiTrash2, FiMaximize2, FiMinimize2,
  FiPackage, FiLayers, FiHash, FiInfo, FiImage, FiX, FiEye, FiRefreshCw,
  FiUser, FiArchive, FiMapPin, FiPhone, FiCalendar
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useFetch } from "../../hooks/useFetch";
import { useMutation } from "../../hooks/useMutation";
import { endpoints } from "../../api/endpoints";
import axiosClient from "../../api/axiosClient";
import { useToast } from "../../hooks/useToast";
import { useAgent } from "../../context/AgentContext";
import RequestError from "../RequestError";

interface PartListProps {
  onEdit: (id: string) => void;
  initialMine?: boolean;
  initialSearch?: string;
  agentId?: string | null;
  categoryId?: string | null;
  status?: string | null;
}

export default function PartList({
  onEdit,
  initialMine,
  initialSearch,
  agentId,
  categoryId,
  status,
}: PartListProps) {
  const agentCtx = useAgent();
  const toast = useToast();

  const [search, setSearch] = useState(initialSearch || "");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showStockTotal, setShowStockTotal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const effectiveAgentId = agentId ?? agentCtx.selectedAgent;

  // URL Building
  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (initialMine) params.append("owner", "me");
    if (effectiveAgentId) params.append("agent_id", String(effectiveAgentId));
    if (categoryId) params.append("category_id", String(categoryId));
    if (status) params.append("status", status);
    return endpoints.PARTS.LIST + (params.toString() ? `?${params.toString()}` : "");
  }, [effectiveAgentId, categoryId, status, initialMine]);

  const { data: parts, refetch, loading, refreshing, error } = useFetch(url);
  const { mutate: deletePart } = useMutation(endpoints.PARTS.DELETE, "delete");

  const partsList = useMemo(() => parts?.data?.data || [], [parts]);

  const getAgentName = (part: any) => {
    return (
      part?.agent?.name ||
      part?.agent_name ||
      part?.items?.find((it: any) => it?.agent?.name)?.agent?.name ||
      part?.items?.[0]?.agent?.name ||
      "-"
    );
  };

  const getAgentPhone = (part: any) => {
    return (
      part?.agent?.phone ||
      part?.items?.find((it: any) => it?.agent?.phone)?.agent?.phone ||
      part?.items?.[0]?.agent?.phone ||
      null
    );
  };

  const getTotalQuantity = (part: any) => {
    if (part?.total_quantity !== undefined && part?.total_quantity !== null) {
      return Number(part.total_quantity);
    }
    if (Array.isArray(part?.items)) {
      return part.items.reduce((sum: number, it: any) => sum + Number(it?.quantity || 0), 0);
    }
    return 0;
  };

  const indexedParts = useMemo(() => {
    return partsList.map((part: any) => ({
      part,
      searchText: [
        part?.name,
        part?.part_number,
        part?.sku,
        part?.brand?.name,
        part?.category?.system,
        part?.category?.name,
        part?.description,
        part?.agent?.name,
        part?.items?.[0]?.agent?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }));
  }, [partsList]);

  const filteredParts = useMemo(() => {
    const terms = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return partsList;

    return indexedParts
      .filter(({ searchText }: any) => terms.every((term: string) => searchText.includes(term)))
      .map(({ part }: any) => part);
  }, [search, partsList, indexedParts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This action will permanently remove this part.")) return;
    try {
      await deletePart(undefined, id);
      toast.success("Part removed from inventory");
      refetch();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success("Parts list refreshed");
    } catch {
      toast.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getImageUrl = (img: any) => {
    if (!img) return null;
    if (img.thumb_url || img.url) return img.thumb_url || img.url;
    const base = axiosClient.defaults.baseURL?.replace(/\/api\/?$/, '') || window.location.origin;
    const path = img.thumb_path || img.file_path;
    if (!path) return null;
    if (/^(https?:\/\/|data:image\/)/i.test(path)) return path;
    return `${base}/storage/${String(path).replace(/^\/?storage\//, '').replace(/^\/+/, '')}`;
  };

  const parseSpecs = (specs: any) => {
    try {
      if (!specs) return [];
      if (typeof specs === "string") {
        const parsed = JSON.parse(specs);
        return Array.isArray(parsed) ? parsed.map((i: any) => typeof i === "string" ? JSON.parse(i) : i) : [];
      }
      return Array.isArray(specs) ? specs : [];
    } catch { return []; }
  };

  // Display price in Ethiopian Birr
  const formatMoney = (value: any) => {
    const num = Number(value || 0);
    return `${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Birr`;
  };

  const formatRegisteredDate = (value: any) => {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-w-0 space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="relative w-full xl:max-w-xl group">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search name, part #, brand, or agent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-semibold"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowStockTotal((value) => !value)}
            className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-black"
          >
            <FiEye size={16} />
            {showStockTotal ? "Hide Total" : "Show Total"}
          </button>

          <AnimatePresence>
            {showStockTotal && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200"
              >
                <FiPackage className="text-blue-400" />
                <span className="text-xs font-black uppercase tracking-widest">Total Parts</span>
                <span className="text-base font-black text-blue-400">{filteredParts.length}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div
          className="min-w-0 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"
          role="status"
          aria-live="polite"
          aria-label="Loading parts"
        >
          <div className="h-1 bg-blue-500 animate-pulse" />
          <div className="flex items-center justify-center gap-2 border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-500">
            <FiRefreshCw size={16} className="animate-spin text-blue-500" />
            Loading parts...
          </div>
          <div className="min-w-[1100px] space-y-3 p-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="grid grid-cols-[50px_minmax(180px,1.2fr)_100px_110px_120px_85px_130px_125px_110px] gap-3 items-center">
                <div className="h-10 w-10 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-4 bg-slate-100 animate-pulse rounded" />
                <div className="h-4 bg-slate-100 animate-pulse rounded" />
                <div className="h-4 bg-slate-100 animate-pulse rounded" />
                <div className="h-4 bg-slate-100 animate-pulse rounded" />
                <div className="h-4 bg-slate-100 animate-pulse rounded" />
                <div className="h-4 bg-slate-100 animate-pulse rounded" />
                <div className="h-4 bg-slate-100 animate-pulse rounded" />
                <div className="h-9 bg-slate-100 animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <RequestError message={error} onRetry={handleRefresh} />}

      {/* Data Table */}
      {!loading && !error && (
        <div className="relative min-w-0 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          {refreshing && (
            <div
              className="absolute inset-x-0 top-0 z-20 flex items-center justify-center gap-2 rounded-t-2xl bg-white/85 py-2 text-xs font-bold text-slate-500 backdrop-blur-sm"
              role="status"
              aria-live="polite"
            >
              <FiRefreshCw size={14} className="animate-spin text-blue-500" />
              Updating parts...
            </div>
          )}
          <div className="min-w-[1100px]">
            {/* Table Header */}
            <div className="sticky top-0 z-10 grid grid-cols-[50px_minmax(180px,1.2fr)_100px_110px_120px_85px_130px_125px_110px] items-center gap-3 px-4 py-3.5 bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <span>Img</span>
              <span>Part</span>
              <span>Brand</span>
              <span>Category</span>
              <span>Agent</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Registered</span>
              <span className="text-right">Actions</span>
            </div>

            {filteredParts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-20 text-center bg-white"
              >
                <FiInfo size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold">No parts matching your search were found.</p>
              </motion.div>
            ) : (
              filteredParts.map((p: any, index: number) => {
                const totalQty = getTotalQuantity(p);
                const agentName = getAgentName(p);

                return (
                  <div key={p.id} className="border-b border-slate-100 last:border-b-0">
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      className={`grid grid-cols-[50px_minmax(180px,1.2fr)_100px_110px_120px_85px_130px_125px_110px] items-center gap-3 px-4 py-3 transition-colors ${
                        expandedId === p.id ? "bg-blue-50/60 cursor-pointer" : "hover:bg-slate-50 cursor-pointer"
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="h-11 w-11 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0">
                        <button
                          type="button"
                          className="h-full w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.images?.[0]) setPreviewImage(getImageUrl(p.images[0]));
                          }}
                        >
                          {p.images?.[0] ? (
                            <img src={getImageUrl(p.images[0])} className="w-full h-full object-cover" alt={p.name || "Part image"} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><FiImage size={20}/></div>
                          )}
                        </button>
                      </div>

                      {/* Part Info */}
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-black text-slate-300">{(index + 1).toString().padStart(2, "0")}</span>
                          <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                            <FiHash size={11}/> {p.part_number || p.sku || "N/A"}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-800 truncate" title={p.name}>{p.name}</h3>
                        <p className="text-xs text-slate-400 truncate" title={p.description}>{p.description || "No description"}</p>
                      </div>

                      {/* Brand */}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate" title={p.brand?.name}>{p.brand?.name || "Generic"}</p>
                      </div>

                      {/* Category Badge */}
                      <div className="min-w-0">
                        <span className="inline-flex max-w-full bg-blue-50 text-blue-600 text-[11px] font-black uppercase px-2.5 py-1 rounded-lg border border-blue-100 truncate">
                          {p.category?.system || p.category?.name || "PART"}
                        </span>
                      </div>

                      {/* Agent Badge */}
                      <div className="min-w-0">
                        <span 
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200/80 truncate max-w-full" 
                          title={`Agent: ${agentName}`}
                        >
                          <FiUser size={12} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{agentName}</span>
                        </span>
                      </div>

                      {/* Quantity in Stock */}
                      <div>
                        {totalQty > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/90">
                            {totalQty} pcs
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                            0 pcs
                          </span>
                        )}
                      </div>

                      {/* Price in Birr */}
                      <div>
                        <p className="text-sm font-black text-blue-600">Selling Price {formatMoney(p.unit_price)}</p>
                        <p className="text-[11px] font-bold text-slate-400">Cost {formatMoney(p.unit_cost)}</p>
                      </div>

                      {/* Registration Date */}
                      <div className="min-w-0">
                        <p className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600" title={p.created_at || "Registration date unavailable"}>
                          <FiCalendar size={13} className="flex-shrink-0 text-slate-400" />
                          <span className="truncate">{formatRegisteredDate(p.created_at)}</span>
                        </p>
                      </div>

                      {/* Action Buttons: Expand, Edit, Delete */}
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expandedId === p.id ? null : p.id);
                          }}
                          className={`p-2 rounded-xl transition-all ${expandedId === p.id ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                          title={expandedId === p.id ? "Collapse Details" : "View Details"}
                        >
                          {expandedId === p.id ? <FiMinimize2 size={15}/> : <FiMaximize2 size={15} />}
                        </button>
                        
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(p.id);
                          }}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title="Edit Part"
                        >
                          <FiEdit3 size={15} />
                        </button>

                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p.id);
                          }}
                          className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          title="Delete Part"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </motion.div>

                    {/* Expanded Details Drawer */}
                    <AnimatePresence>
                      {expandedId === p.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-slate-50/80 border-t border-slate-100"
                        >
                          <div className="p-5 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Visual Images */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                  <FiImage /> Visual Reference
                                </h4>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                  {p.images?.length ? p.images.map((img: any) => (
                                    <img 
                                      key={img.id}
                                      src={getImageUrl(img)}
                                      onClick={() => setPreviewImage(getImageUrl(img))}
                                      alt={p.name || "Part image"}
                                      className="h-24 w-32 object-cover rounded-xl border-4 border-white shadow-sm cursor-zoom-in hover:scale-105 transition-transform"
                                    />
                                  )) : (
                                    <div className="text-slate-400 italic text-sm p-4 bg-white rounded-xl border border-slate-100">
                                      No images uploaded
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Technical & Pricing Details */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                  <FiLayers /> Pricing & Specifications
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Unit Cost</p>
                                    <p className="text-base font-black text-slate-800">{formatMoney(p.unit_cost)}</p>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Selling Price</p>
                                    <p className="text-base font-black text-blue-600">{formatMoney(p.unit_price)}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {parseSpecs(p.technical_specs).map((spec: any, i: number) => (
                                    <div key={i} className="bg-white px-3 py-1.5 rounded-lg text-xs border border-slate-200 shadow-sm">
                                      <span className="font-black text-slate-400 mr-1.5">{spec.key}:</span>
                                      <span className="font-bold text-slate-700">{spec.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="mt-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Registered</p>
                                <p className="inline-flex items-center gap-2 text-sm font-black text-slate-800">
                                  <FiCalendar size={14} className="text-slate-400" />
                                  {formatRegisteredDate(p.created_at)}
                                </p>
                              </div>
                                
                              {/* Inventory & Agent Details */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                  <FiArchive /> Inventory & Sourcing
                                </h4>
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2 text-xs">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                    <span className="text-slate-400 font-bold flex items-center gap-1"><FiArchive size={12}/> In Stock Qty:</span>
                                    <span className="font-black text-emerald-600 text-sm">{totalQty} pcs</span>
                                  </div>
                                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                    <span className="text-slate-400 font-bold flex items-center gap-1"><FiMapPin size={12}/> Shelf / Location:</span>
                                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs">{p.shelf || p.items?.[0]?.shelf || "N/A"}</span>
                                  </div>
                                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                    <span className="text-slate-400 font-bold flex items-center gap-1"><FiUser size={12}/> Agent:</span>
                                    <span className="font-bold text-slate-800">{agentName}</span>
                                  </div>
                                  {getAgentPhone(p) && (
                                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                      <span className="text-slate-400 font-bold flex items-center gap-1"><FiPhone size={12}/> Agent Phone:</span>
                                      <span className="font-bold text-slate-800">{getAgentPhone(p)}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-bold flex items-center gap-1"><FiMapPin size={12}/> Store:</span>
                                    <span className="font-bold text-slate-800">{p.items?.[0]?.store?.name || "Default Store"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Prominent Edit & Delete Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/70">
                              <button
                                type="button"
                                onClick={() => onEdit(p.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow hover:bg-emerald-700 transition-colors"
                              >
                                <FiEdit3 size={14} /> Edit Part
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(p.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-black border border-rose-200 transition-colors"
                              >
                                <FiTrash2 size={14} /> Delete Part
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setPreviewImage(null)}
          >
            <button
              type="button"
              className="absolute top-10 right-10 text-white hover:rotate-90 transition-transform duration-300"
              onClick={() => setPreviewImage(null)}
            >
              <FiX size={36} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              src={previewImage} 
              alt="Part preview"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
