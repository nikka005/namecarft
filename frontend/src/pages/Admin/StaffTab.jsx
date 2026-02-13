import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { toast } from '../../hooks/use-toast';

const PERMISSIONS = [
  { id: 'orders', label: 'Manage Orders' },
  { id: 'products', label: 'Manage Products' },
  { id: 'customers', label: 'View Customers' },
  { id: 'coupons', label: 'Manage Coupons' },
  { id: 'reviews', label: 'Manage Reviews' },
  { id: 'settings', label: 'Site Settings' },
  { id: 'analytics', label: 'View Analytics' },
  { id: 'staff', label: 'Manage Staff' },
];

const StaffTab = ({ token, api }) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    permissions: []
  });

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/staff', token);
      setStaff(res.data.staff || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.put(`/admin/staff/${editingStaff.id}`, formData, token);
        toast({ title: 'Staff updated successfully' });
      } else {
        await api.post('/admin/staff', formData, token);
        toast({ title: 'Staff member created successfully' });
      }
      setShowModal(false);
      setEditingStaff(null);
      setFormData({ name: '', email: '', password: '', role: 'staff', permissions: [] });
      fetchStaff();
    } catch (e) {
      toast({ title: 'Error', description: e.response?.data?.detail || 'Failed to save staff', variant: 'destructive' });
    }
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await api.delete(`/admin/staff/${staffId}`, token);
      toast({ title: 'Staff member deleted' });
      fetchStaff();
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const openEditModal = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      password: '',
      role: staffMember.role,
      permissions: staffMember.permissions || []
    });
    setShowModal(true);
  };

  const togglePermission = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-500">Manage your team members and their permissions</p>
        </div>
        <Button onClick={() => { setEditingStaff(null); setFormData({ name: '', email: '', password: '', role: 'staff', permissions: [] }); setShowModal(true); }}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((member) => (
          <div key={member.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${member.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {member.role === 'admin' ? (
                    <ShieldCheck className="w-6 h-6 text-purple-600" />
                  ) : (
                    <Shield className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {member.role}
              </span>
            </div>

            {member.permissions && member.permissions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {member.permissions.slice(0, 3).map((perm) => (
                    <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{perm}</span>
                  ))}
                  {member.permissions.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">+{member.permissions.length - 3} more</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => openEditModal(member)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              {member.role !== 'admin' && (
                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(member.id)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No staff members yet</p>
          <Button className="mt-4" onClick={() => setShowModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add First Staff Member
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>{editingStaff ? 'New Password (leave blank to keep)' : 'Password'}</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingStaff}
              />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.role === 'staff' && (
              <div>
                <Label className="mb-2 block">Permissions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingStaff ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffTab;
