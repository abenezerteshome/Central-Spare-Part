// src/components/categories/CategoriesForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '../../hooks/useMutation';
import { endpoints } from '../../api/endpoints';
import { useToast  } from '../../hooks/useToast'

interface CategoriesFormProps {
  category?: any;
  onSuccess?: () => void;
}

const CategoriesForm: React.FC<CategoriesFormProps> = ({ category, onSuccess }) => {
  const { register, handleSubmit, reset } = useForm();
  const toast = useToast();

  const { mutate: createCategory } = useMutation(endpoints.CATEGORIES.CREATE, 'post');
  const { mutate: updateCategory } = useMutation((id: string) => `${endpoints.CATEGORIES.UPDATE(id)}`, 'put');

  useEffect(() => {
    // Normalize incoming category shape so form fields populate correctly whether
    // backend returns { name, description } or { title, details } etc.
    if (category) {
      const initial = {
        system: category.system ?? category.title ?? '',
        description: category.description ?? category.details ?? category.detail ?? '',
      };
      reset(initial);
    } else {
      reset({ name: '', description: '' });
    }
  }, [category, reset]);


  const onSubmit = async (data: any) => {
    try {
      // Log payload for debugging and ensure we only send expected fields
      const payload = { system: data.system, description: data.description };
      console.log('Saving category payload', payload);

  if (category) await updateCategory(payload, category.id);
  else await createCategory(payload);

      toast.success('Category saved successfully');
      if (onSuccess) onSuccess();
    } catch (err) {
      // Try to surface server error message when available
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'Failed to save category';
      console.error('Category save error', err);
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <input
        {...register('system')}
        placeholder="Category Name"
        className="border p-2 rounded w-full"
        required
      />
      <input type="text" className='bg-red '  required/>
     
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {category ? 'Update Category' : 'Add Category'}
      </button>
    </form>
  );
};

export default CategoriesForm;
