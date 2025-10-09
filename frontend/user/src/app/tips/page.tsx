"use client";

import { Tips } from "@/types/tips";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTips, updateTip, deleteTip } from "@/services/tipService";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const TipsPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [tips, setTips] = useState<Tips[]>([]);
  const [filteredTips, setFilteredTips] = useState<Tips[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTipId, setDeletingTipId] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isMentor = session?.user?.role?.toLowerCase() === "mentor";

  useEffect(() => {
    fetchTips();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTips(tips);
    } else {
      const filtered = tips.filter(tip => 
        tip.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTips(filtered);
    }
  }, [searchQuery, tips]);

  const fetchTips = async () => {
    try {
      const data = await getTips();
      setTips(data);
      setFilteredTips(data);
    } catch (error) {
      toast.error("Failed to load tips list");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTip = async () => {
    if (!deletingTipId) return;

    try {
      setIsProcessing(true);
      await deleteTip(deletingTipId);
      setTips(tips.filter(tip => tip.tipId !== deletingTipId));
      toast.success("Tip deleted successfully!");
      setShowDeleteModal(false);
      setDeletingTipId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred while deleting the tip");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <section className="pt-[120px] pb-[120px]">
        <div className="container">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full px-4">
              <div className="mx-auto mb-12 max-w-[510px] text-center lg:mb-20">
                <span className="block mb-2 text-lg font-semibold text-primary">
                  IELTS Learning Tips
                </span>
                <h2 className="mb-3 text-3xl font-bold text-dark sm:text-4xl md:text-[40px] md:leading-[1.2]">
                  Study Tips & Tricks
                </h2>
                <p className="text-base text-body-color">
                  Enhance your IELTS preparation with expert tips from our mentors
                </p>
                <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                  <div className="w-full sm:w-96">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search tips by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  {isMentor && (
                    <Link
                      href="/tips/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary whitespace-nowrap"
                    >
                      Create New Tip
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {filteredTips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {loading ? "Loading..." : "No tips found matching your search."}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap -mx-4">
              {filteredTips.map((tip) => (
              <div key={tip.tipId} className="w-full md:w-1/2 lg:w-1/3 px-4 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                  <Link href={`/tips/${tip.tipId}`} className="block group">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {tip.title}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      {tip.mentor && (
                        <span className="text-sm text-gray-500">
                          By {tip.mentor.name}
                        </span>
                      )}
                      <time className="text-sm text-gray-500">
                        {format(new Date(tip.createdAt), "MMM d, yyyy")}
                      </time>
                    </div>
                  </Link>
                  
                  {isMentor && (
                    <div className="flex justify-end space-x-2 mt-4 border-t pt-4">
                      <Link
                        href={`/tips/${tip.tipId}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setDeletingTipId(tip.tipId);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Delete Confirmation</h3>
          <p className="mb-4">Are you sure you want to delete this tip? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTip}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TipsPage;