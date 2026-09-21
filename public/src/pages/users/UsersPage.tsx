import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { endpoints } from '../../api/endpoints';
import { useFetch } from '../../hooks/useFetch';
import { useMutation } from '../../hooks/useMutation';
import { useToast } from '../../hooks/useToast';
import { FiEdit2, FiTrash2, FiUserPlus } from 'react-icons/fi';

type UserForm = {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
};

const emptyForm: UserForm = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active',
};

const UsersPage: React.FC = () => {
  const toast = useToast();
  const [form, setForm] = useState<UserForm>(emptyForm);
  const { data, loading, refetch } = useFetch(endpoints.USERS.LIST);
  const { mutate: createUser, loading: creating } = useMutation(endpoints.USERS.LIST, 'post');
  const { mutate: updateUser, loading: updating } = useMutation((id: string) => endpoints.USERS.DETAIL(id), 'put');
  const { mutate: deleteUser } = useMutation((id: string) => endpoints.USERS.DETAIL(id), 'delete');

  const users = Array.isArray(data) ? data : data?.data || [];
  const isEditing = Boolean(form.id);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: any = {
      name: form.name,
      email: form.email,
      role: form.role,
      status: form.status,
    };
    if (form.password) payload.password = form.password;

    try {
      if (form.id) {
        await updateUser(payload, form.id);
        toast.success('User updated');
      } else {
        await createUser({ ...payload, password: form.password });
        toast.success('User created');
      }
      setForm(emptyForm);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save user');
    }
  };

  const edit = (user: any) => {
    setForm({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role === 'admin' ? 'admin' : 'user',
      status: user.status === 'suspended' ? 'suspended' : 'active',
    });
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      await deleteUser(undefined, id);
      toast.success('User deleted');
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Create staff accounts and control access roles.</p>
        </div>

        <form onSubmit={submit} className="grid gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-6">
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Full name"
            className="rounded-lg border px-3 py-2 text-sm lg:col-span-2"
            required
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
            className="rounded-lg border px-3 py-2 text-sm lg:col-span-2"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder={isEditing ? 'New password optional' : 'Password'}
            className="rounded-lg border px-3 py-2 text-sm lg:col-span-2"
            required={!isEditing}
          />
          <select
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserForm['role'] }))}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as UserForm['status'] }))}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <button
            type="submit"
            disabled={creating || updating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-gray-300 lg:col-span-2"
          >
            <FiUserPlus />
            {isEditing ? 'Update User' : 'Create User'}
          </button>
          {isEditing && (
            <button type="button" onClick={() => setForm(emptyForm)} className="rounded-lg border px-4 py-2 text-sm lg:col-span-2">
              Cancel Edit
            </button>
          )}
        </form>

        <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No users found.</td></tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3 capitalize">{user.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => edit(user)} className="rounded p-2 text-blue-600 hover:bg-blue-50" aria-label="Edit user">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => remove(user.id)} className="rounded p-2 text-red-600 hover:bg-red-50" aria-label="Delete user">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;

