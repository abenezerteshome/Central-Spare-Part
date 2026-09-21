// src/components/agents/AgentsForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '../../hooks/useMutation';
import { endpoints } from '../../api/endpoints';
import { useToast  } from '../../hooks/useToast';

interface AgentsFormProps {
  agent?: any;
  onSuccess?: () => void;
}

const AgentsForm: React.FC<AgentsFormProps> = ({ agent, onSuccess }) => {
  const { register, handleSubmit, reset } = useForm();
  const toast = useToast();

  const { mutate: createAgent } = useMutation(endpoints.AGENTS.CREATE, 'post');
  const { mutate: updateAgent } = useMutation((id: string) => endpoints.AGENTS.UPDATE(id), 'put');
  
  useEffect(() => {
    if (agent) reset(agent);
    else reset({});
  }, [agent]);

  const onSubmit = async (data: any) => {
    try {
      if (agent) await updateAgent(agent.id, data);
      else await createAgent(data);
      toast.success('Agent saved successfully');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error('Failed to save agent');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <input {...register('name')} placeholder="Agent Name" className="border p-2 rounded w-full" required />
      <input {...register('phone')} placeholder="Phone Number" className="border p-2 rounded w-full" />
      <input {...register('address')} placeholder="Address" className="border p-2 rounded w-full" />
      
      <button>


      </button>
      <button  type='submit' className='bg-blue-200'>f..

      </button>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {agent ? 'Update Agent' : 'Add Agent'}
      </button>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {agent ? 'Update Agent' : 'Add Agent'}
      </button>
    </form>
  );
};

export default AgentsForm;
