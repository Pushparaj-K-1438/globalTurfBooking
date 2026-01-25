'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import moment from 'moment';

const SlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    price: 400,
    isActive: true
  });

  const fetchSlots = async () => {
    try {
      const response = await fetch('/api/admin/slots');
      const data = await response.json();
      if (response.ok && Array.isArray(data.slots)) {
        setSlots(data.slots);
      } else {
        setSlots([]);
        toast.error(data.error || 'Failed to fetch slots');
      }
    } catch (error) {
      toast.error('Error fetching slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'price' ? parseFloat(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startTime || !formData.endTime) {
      toast.error('Start time and end time are required');
      return;
    }

    try {
      const url = editingSlot ? `/api/admin/slots/${editingSlot._id}` : '/api/admin/slots';
      const method = editingSlot ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingSlot ? 'Slot updated successfully' : 'Slot created successfully');
        setShowAddModal(false);
        setEditingSlot(null);
        resetForm();
        fetchSlots();
      } else {
        toast.error(data.error || 'Failed to save slot');
      }
    } catch (error) {
      toast.error('Error saving slot');
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
      isActive: slot.isActive
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      const response = await fetch(`/api/admin/slots/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Slot deleted successfully');
        fetchSlots();
      } else {
        toast.error('Failed to delete slot');
      }
    } catch (error) {
      toast.error('Error deleting slot');
    }
  };

  const handleToggleActive = async (slot) => {
    try {
      const response = await fetch(`/api/admin/slots/${slot._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !slot.isActive }),
      });

      if (response.ok) {
        toast.success(`Slot ${!slot.isActive ? 'activated' : 'deactivated'} successfully`);
        fetchSlots();
      } else {
        toast.error('Failed to update slot status');
      }
    } catch (error) {
      toast.error('Error updating slot status');
    }
  };

  const resetForm = () => {
    setFormData({
      startTime: '',
      endTime: '',
      price: 400,
      isActive: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Slot Management</h1>
            <p className="text-xs text-slate-500">Manage available time slots and pricing</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slot</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid */}
        {slots.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No slots found</h3>
            <p className="text-slate-500 mt-1">Get started by creating your first slot.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <div key={slot._id} className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-4 -mt-4 z-0 group-hover:bg-emerald-50 transition-colors"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Clock size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {moment(slot.startTime, 'HH:mm').format('h:mm A')} - {moment(slot.endTime, 'HH:mm').format('h:mm A')}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Daily Schedule</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Price</p>
                      <p className="text-xl font-bold text-slate-900">₹{slot.price}</p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(slot)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${slot.isActive
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                    >
                      {slot.isActive ? <CheckCircle size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
                      {slot.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleEdit(slot)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 text-sm font-medium transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slot._id)}
                      className="w-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">
                {editingSlot ? 'Edit Slot' : 'New Slot'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingSlot(null);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-7 pr-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                  Make this slot active immediately
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSlot(null);
                    resetForm();
                  }}
                  className="flex-1 py-2.5 text-slate-600 font-medium border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
                >
                  {editingSlot ? 'Update Slot' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotsPage;
