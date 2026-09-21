import { useEffect, useState } from 'react';
import { createShop, getShop, updateShop } from '../api/sparePartShops';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

type FormValues = {
  name: string;
  phone: string;
  address: string;
};

export default function SparePartShopForm(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(!!id);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', phone: '', address: '' }
  });

  useEffect(() => {
    if (!id) return;
    (async ()=>{
      setLoading(true);
      try {
        const data = await getShop(id!);
        const shop = data.data || data;
        reset({ name: shop.name || '', phone: shop.phone || '', address: shop.address || '' });
      } catch (e) {
        console.error('Failed to load shop', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reset]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      if (id) {
        await updateShop(id, values);
      } else {
        await createShop(values);
      }
      navigate('/dashboard/spare-part-shops');
    } catch (e) {
      console.error('Save failed', e);
      alert('Failed to save shop.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6"><p>Loading...</p></div>;

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">{id ? 'Edit' : 'Create'} Spare Part Shop</h1>
            <p className="text-sm text-gray-500">Add or update a spare part shop location.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard/spare-part-shops" className="text-sm text-gray-600 hover:text-gray-900">Back to list</Link>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className={`mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.name ? 'border-red-400' : ''}`}
              placeholder="Shop name"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              {...register('phone', { required: 'Phone is required', minLength: { value: 6, message: 'Phone seems too short' } })}
              className={`mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${errors.phone ? 'border-red-400' : ''}`}
              placeholder="e.g. +251912345678"
            />
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              {...register('address')}
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Street, city, region"
              rows={4}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-end gap-3 pt-4">
            <Link to="/dashboard/spare-part-shops" className="w-full md:w-auto px-4 py-3 text-center rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">Cancel</Link>
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save Shop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
