'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast, Slide } from 'react-toastify';
import moment from 'moment';

const page = () => {
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

  // Fetch slots
  const fetchSlots = async () => {
    try {
      const response = await fetch('/api/admin/slots');
      const data = await response.json();
      if (response.ok) {
        setSlots(data.slots);
      } else {
        toast.error('Failed to fetch slots');
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  // Handle form submission
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

  // Handle edit
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

  // Handle delete
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

  // Handle toggle active status
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

  // Reset form
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen pt-16 overflow-hidden text-black">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-3">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Slot Management</h1>
              <p className="text-gray-600">Manage available time slots and pricing</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ml-auto text-sm md:text-lg cursor-pointer"
            >
              <Plus size={16} />
              Add Slot
            </button>
          </div>

          {/* Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <div key={slot._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-gray-500" />
                    <span className="font-semibold text-lg">
                      {moment(slot.startTime, 'HH:mm').format('h:mm A')} - {moment(slot.endTime, 'HH:mm').format('h:mm A')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(slot)}
                      className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(slot._id)}
                      className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">Price:</span>
                    </div>
                    <span className="font-semibold">₹{slot.price}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Status:</span>
                    <button
                      onClick={() => handleToggleActive(slot)}
                      className={`flex items-center gap-2 px-2 py-1 rounded-full text-sm ${slot.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {slot.isActive ? <ToggleRight/> : <ToggleLeft />}
                      {slot.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {slots.length === 0 && (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No slots found</h3>
              <p className="text-gray-600">Get started by creating your first slot.</p>
            </div>
          )}

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingSlot(null);
                  resetForm();
                }}
              />

              {/* Modal Content */}
              <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4">
                  {editingSlot ? 'Edit Slot' : 'Add New Slot'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Active</label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingSlot(null);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {editingSlot ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default page;
