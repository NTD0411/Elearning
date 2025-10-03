"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TipService, Tip, CreateTipRequest, UpdateTipRequest } from "@/services/tipService";
import toast from "react-hot-toast";
import Link from "next/link";

export default function TipsPage() {
  const router = useRouter();
  const { user, isAuthenticated, accessToken } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTips, setFilteredTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [newTip, setNewTip] = useState({ title: "", content: "" });

  // Fetch tips from API
  const fetchTips = async () => {
    try {
      setLoading(true);
      const fetchedTips = await TipService.getTips({ searchTerm });
      setTips(fetchedTips);
      setFilteredTips(fetchedTips);
    } catch (error) {
      console.error("Error fetching tips:", error);
      toast.error("Failed to load tips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  // Refetch tips when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "") {
        fetchTips();
      } else {
        fetchTips();
      }
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Check if user is mentor
  const isMentor = user?.role === "Mentor" || user?.role === "mentor";
  
  // Debug log
  console.log("User data:", user);
  console.log("User role:", user?.role);
  console.log("Is mentor:", isMentor);

  // Handle create tip
  const handleCreateTip = async () => {
    if (!accessToken) {
      toast.error("You must be logged in to create tips");
      return;
    }

    try {
      const createRequest: CreateTipRequest = {
        title: newTip.title,
        content: newTip.content
      };
      
      await TipService.createTip(createRequest, accessToken);
      toast.success("Tip created successfully!");
      
      setNewTip({ title: "", content: "" });
      setShowCreateModal(false);
      fetchTips(); // Refresh the list
    } catch (error: any) {
      console.error("Error creating tip:", error);
      toast.error(error.message || "Failed to create tip");
    }
  };

  // Handle edit tip
  const handleEditTip = async () => {
    if (!editingTip || !accessToken) {
      toast.error("You must be logged in to edit tips");
      return;
    }

    try {
      const updateRequest: UpdateTipRequest = {
        title: editingTip.title,
        content: editingTip.content
      };
      
      await TipService.updateTip(editingTip.tipId, updateRequest, accessToken);
      toast.success("Tip updated successfully!");
      
      setEditingTip(null);
      fetchTips(); // Refresh the list
    } catch (error: any) {
      console.error("Error updating tip:", error);
      toast.error(error.message || "Failed to update tip");
    }
  };

  // Handle delete tip
  const handleDeleteTip = async (tipId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tip này?")) return;
    
    if (!accessToken) {
      toast.error("You must be logged in to delete tips");
      return;
    }

    try {
      await TipService.deleteTip(tipId, accessToken);
      toast.success("Tip deleted successfully!");
      fetchTips(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting tip:", error);
      toast.error(error.message || "Failed to delete tip");
    }
  };

  return (
  <main className="pt-32 pb-16">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Learning Tips
          </h1>
          <p className="text-lg text-gray-600">
            Discover valuable tips and insights from our experienced mentors
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search tips by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Icon
              icon="tabler:search"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"
            />
          </div>
        </div>

        {/* Mentor CRUD Section */}
        {isMentor && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              <Icon icon="tabler:plus" className="text-xl" />
              Create New Tip
            </button>
          </div>
        )}

        {/* Tips List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tips...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTips.length === 0 ? (
              <div className="text-center py-12">
                <Icon icon="tabler:search-off" className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No tips found matching your search.</p>
              </div>
            ) : (
              filteredTips.map((tip) => (
                <div
                  key={tip.tipId}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/tips/${tip.tipId}`)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 flex-1">
                      {tip.title}
                    </h2>
                    {isMentor && (
                      <div className="flex gap-2 ml-4">
                        <Link
                          href={`/tips/${tip.tipId}?edit=true`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Icon icon="tabler:edit" className="text-lg" />
                        </Link>
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteTip(tip.tipId); }}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Icon icon="tabler:trash" className="text-lg" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>By {tip.mentorFullName}</span>
                    <span>{formatDate(tip.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Tip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Tip</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tip title"
                value={newTip.title}
                onChange={(e) => setNewTip({ ...newTip, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="Tip content"
                value={newTip.content}
                onChange={(e) => setNewTip({ ...newTip, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTip}
                disabled={!newTip.title || !newTip.content}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTip({ title: "", content: "" });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tip Modal */}
      {editingTip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Tip</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tip title"
                value={editingTip.title}
                onChange={(e) => setEditingTip({ ...editingTip, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="Tip content"
                value={editingTip.content}
                onChange={(e) => setEditingTip({ ...editingTip, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditTip}
                disabled={!editingTip.title || !editingTip.content}
                className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update
              </button>
              <button
                onClick={() => setEditingTip(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
