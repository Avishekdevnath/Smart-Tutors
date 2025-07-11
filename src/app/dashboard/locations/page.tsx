"use client";
import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Toast, { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";
import DashboardLayout from "@/components/DashboardLayout";

interface Location {
  _id: string;
  division: string;
  district: string;
  area: string;
  formatted?: string;
  extra?: any;
}

export default function LocationsAdminPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [form, setForm] = useState({
    division: "",
    district: "",
    area: "",
  });
  
  const { toast, showToast, hideToast } = useToast();

  // Fetch locations
  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/locations?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setLocations(data.locations || []);
    } catch (e) {
      showToast("Failed to load locations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [search]);

  // Handle add/edit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editLocation ? "PUT" : "POST";
      const url = editLocation ? `/api/locations/${editLocation._id}` : "/api/locations";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save location");
      showToast(editLocation ? "Location updated" : "Location added", "success");
      setModalOpen(false);
      setForm({ division: "", district: "", area: "" });
      setEditLocation(null);
      fetchLocations();
    } catch (e) {
      showToast("Failed to save location", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete location");
      showToast("Location deleted", "success");
      fetchLocations();
    } catch (e) {
      showToast("Failed to delete location", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open modal for add/edit
  const openModal = (loc?: Location) => {
    if (loc) {
      setEditLocation(loc);
      setForm({
        division: loc.division,
        district: loc.district,
        area: loc.area,
      });
    } else {
      setEditLocation(null);
      setForm({ division: "", district: "", area: "" });
    }
    setModalOpen(true);
  };

  return (
    <DashboardLayout title="Locations" description="Manage location data">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold">Manage Locations</h1>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => openModal()}
          >
            <PlusIcon className="w-5 h-5 mr-2" /> Add Location
          </button>
        </div>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search division, district, area..."
            className="w-full md:w-80 px-3 py-2 border rounded"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Division</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Formatted</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {locations.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">No locations found.</td>
                </tr>
              )}
              {locations.map(loc => (
                <tr key={loc._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{loc.division}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{loc.district}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{loc.area}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-500">{loc.formatted || `${loc.area}, ${loc.district}, ${loc.division}`}</td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button
                      className="p-1 rounded hover:bg-blue-100"
                      onClick={() => openModal(loc)}
                    >
                      <PencilIcon className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-red-100"
                      onClick={() => handleDelete(loc._id)}
                    >
                      <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="text-center py-4 text-blue-500">Loading...</div>}
        </div>
      </div>
      
      {/* Modal for add/edit */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        title={editLocation ? "Edit Location" : "Add Location"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Division</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={form.division}
              onChange={e => setForm(f => ({ ...f, division: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">District</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={form.district}
              onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Area</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              value={form.area}
              onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              required
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-50"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </DashboardLayout>
  );
} 