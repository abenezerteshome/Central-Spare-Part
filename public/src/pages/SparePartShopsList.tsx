import { useEffect, useMemo, useState } from 'react';
import { listShops, deleteShop } from '../api/sparePartShops';
import { Link } from 'react-router-dom';

import { FiEye, FiEyeOff, FiTrash2, FiEdit2, FiChevronLeft, FiChevronRight, FiHome } from 'react-icons/fi';
import { useToast } from '../hooks/useToast';
interface Shop {
	id: number | string;
	name?: string;
	phone?: string;
	address?: string;
	[key: string]: any;
}

const inputBase = 'w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

export default function SparePartShopsList() {
	const [shops, setShops] = useState<Shop[]>([]);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState('');
	const [expandedId, setExpandedId] = useState<number | string | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [targetDeleteId, setTargetDeleteId] = useState<number | string | null>(null);
	const toast = useToast();

	// pagination & sorting
	const [page, setPage] = useState(1);
	const pageSize = 8;
	const [sortField] = useState<'name' | 'phone' | 'address' | 'id'>('name');
	const [sortDir] = useState<'asc' | 'desc'>('asc');

	const fetch = async () => {
		setLoading(true);
		try {
			const data = await listShops();
			// Normalize API response into an array. Support: array, { data: [] }, { shops: [] }, { items: [] }
			let items: Shop[] = [];
			if (Array.isArray(data)) items = data;
			else if (data && Array.isArray((data as any).data)) items = (data as any).data;
			else if (data && Array.isArray((data as any).shops)) items = (data as any).shops;
			else if (data && Array.isArray((data as any).items)) items = (data as any).items;
			else items = [];

			setShops(items);
		} catch (e) {
			console.error('Failed to load shops', e);
			setShops([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetch(); }, []);

	const handleDelete = (id: number | string) => {
		setTargetDeleteId(id);
		setConfirmOpen(true);
	};

	const onConfirmDelete = async () => {
		if (!targetDeleteId) return;
		setConfirmOpen(false);
		try {
			await deleteShop(targetDeleteId);
			toast.success('Shop deleted');
			fetch();
		} catch (e) {
			console.error('Delete failed', e);
			toast.error('Failed to delete shop');
		} finally {
			setTargetDeleteId(null);
		}
	};

	const filtered = useMemo(() => {
		const q = query.toLowerCase().trim();
		let list = shops.filter(s =>
			!q || String(s.id).toLowerCase().includes(q)
			|| (s.name || '').toLowerCase().includes(q)
			|| (s.phone || '').toLowerCase().includes(q)
			|| (s.address || '').toLowerCase().includes(q)
		);

		// sort
		list = list.sort((a, b) => {
			const A = String((a as any)[sortField] ?? '').toLowerCase();
			const B = String((b as any)[sortField] ?? '').toLowerCase();
			if (A < B) return sortDir === 'asc' ? -1 : 1;
			if (A > B) return sortDir === 'asc' ? 1 : -1;
			return 0;
		});

		return list;
	}, [shops, query, sortField, sortDir]);

	// pagination
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);
	const visible = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

	return (
		<div className="p-6">
			<div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800" aria-label="Back to home">
							<FiHome className="h-5 w-5" />
						</Link>
						<div>
							<h2 className="text-2xl font-semibold">Spare Part Shops</h2>
							<p className="text-sm text-gray-500">Manage your spare part shop locations</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Link
							to="/dashboard/spare-part-shops/new"
							className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm"
						>
							Create New
						</Link>
					</div>
				</div>

				<div className="flex items-center gap-3 mb-4">
					<input
						value={query}
						onChange={e => { setQuery(e.target.value); setPage(1); }}
						placeholder="Search by name, phone, address or id"
						className={inputBase + ' flex-1 max-w-xs'}
					/>
					<div className="text-sm text-gray-600">{loading ? 'Loading...' : `${filtered.length} item(s)`}</div>
				</div>

				{/* Column headers (visible on all sizes like PartList) */}
				<div className="grid grid-cols-5 md:grid-cols-5 font-semibold text-gray-700 px-2 py-2 border-b">
					<div className="text-xs md:text-sm">No</div>
					<div className="text-xs md:text-sm">Name</div>
					<div className="text-xs md:text-sm">Phone</div>
					<div className="text-xs md:text-sm">Address</div>
					<div className="text-xs md:text-sm text-center">Actions</div>
				</div>

				{/* List */}
				<div className="space-y-3 mt-3">
					{loading && (
						<div className="space-y-3">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="animate-pulse bg-white rounded-lg border shadow-sm p-3 h-20" />
							))}
						</div>
					)}

					{!loading && filtered.length === 0 && (
						<div className="w-full p-4 text-center text-gray-600 bg-gray-100 rounded-lg border">No shops found.</div>
					)}

					{visible.map((s, idx) => (
						<div key={s.id}>
							<div className="bg-white rounded-lg border shadow-sm p-3">

								{/* Mobile row */}
								<div className="md:hidden flex items-center gap-3">
									<div className="text-xs font-semibold text-gray-700 w-6">{(page - 1) * pageSize + idx + 1}</div>
									<div className="flex-1 font-medium text-gray-900 truncate">{s.name || `#${s.id}`}</div>
									<div className="text-sm text-gray-600 w-20 truncate">{s.phone || '-'}</div>
									<div className="flex items-center justify-end gap-2">
										<button
											onClick={() => setExpandedId(prev => (prev === s.id ? null : s.id))}
											className="p-2 rounded hover:bg-gray-100"
										>
											{expandedId === s.id ? <FiEyeOff /> : <FiEye />}
										</button>
										<Link to={`/dashboard/spare-part-shops/${s.id}/edit`} className="p-2 rounded hover:bg-gray-100 text-blue-600">
											<FiEdit2 />
										</Link>
										<button onClick={() => handleDelete(s.id)} className="p-2 rounded hover:bg-gray-100 text-red-500">
											<FiTrash2 />
										</button>
									</div>
								</div>

								{/* Desktop row */}
								<div className="hidden md:grid grid-cols-5 items-center px-2">
									<div className="text-gray-700 font-medium">{(page - 1) * pageSize + idx + 1}</div>
									<div className="font-medium text-gray-800">{s.name}</div>
									<div className="text-gray-600">{s.phone || '-'}</div>
									<div className="text-gray-700 text-sm line-clamp-1">{s.address || '-'}</div>
									<div className="flex items-center justify-center gap-3">
										<button
											onClick={() => setExpandedId(prev => (prev === s.id ? null : s.id))}
											className="p-2 rounded hover:bg-gray-100"
										>
											<FiEye />
										</button>
										<Link to={`/dashboard/spare-part-shops/${s.id}/edit`} className="p-2 rounded hover:bg-gray-100 text-blue-600">
											<FiEdit2 />
										</Link>
										<button onClick={() => handleDelete(s.id)} className="p-2 rounded hover:bg-gray-100 text-red-500">
											<FiTrash2 />
										</button>
									</div>
								</div>
							</div>

							{/* Expanded details */}
							<div className={`transition-all overflow-hidden ${expandedId === s.id ? 'max-h-[900px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
								<div className="bg-gray-50 rounded-lg p-3 border">
									<div className="text-sm text-gray-700 space-y-1">
										<div><b>Name:</b> {s.name || '-'}</div>
										<div><b>Phone:</b> {s.phone || '-'}</div>
										<div><b>Address:</b> {s.address || '-'}</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Pagination (desktop & mobile) */}
				<div className="mt-4 flex items-center justify-between">
					<div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
					<div className="flex items-center gap-2">
						<button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded disabled:opacity-50">
							<FiChevronLeft />
						</button>
						<button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded disabled:opacity-50">
							<FiChevronRight />
						</button>
					</div>
				</div>

				{/* Mobile FAB */}
				<Link
					to="/dashboard/spare-part-shops/new"
					className="md:hidden fixed bottom-6 right-4 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
					aria-label="Create Shop"
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
				</Link>

				{/* Confirm Modal */}
				{confirmOpen && (
					<div className="fixed inset-0 z-60 flex items-center justify-center">
						<div className="absolute inset-0 bg-black/40" onClick={() => setConfirmOpen(false)} />
						<div className="relative bg-white rounded-lg p-6 z-70 w-11/12 max-w-md">
							<h3 className="text-lg font-semibold">Delete shop?</h3>
							<p className="text-sm text-gray-600 mt-2">This action cannot be undone. Are you sure?</p>
							<div className="mt-4 flex justify-end gap-3">
								<button onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded border">Cancel</button>
								<button onClick={onConfirmDelete} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
