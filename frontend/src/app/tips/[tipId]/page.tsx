"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { type Tip, TipService, UpdateTipRequest } from "@/services/tipService";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

export default function TipDetailPage() {
  const router = useRouter();
  const { tipId } = useParams();
  const searchParams = useSearchParams();
  const { accessToken, user } = useAuth();
  const isEditMode = searchParams.get("edit") === "true";
  const isMentor = user?.role === "Mentor" || user?.role === "mentor";

  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    title: "",
    content: ""
  });

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const tipData = await TipService.getTipById(Number(tipId));
        setTip(tipData);
        setEditForm({
          title: tipData.title,
          content: tipData.content
        });
      } catch (error) {
        console.error("Error fetching tip:", error);
        toast.error("Failed to load tip details");
      } finally {
        setLoading(false);
      }
    };

    fetchTip();
  }, [tipId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("You must be logged in to edit tips");
      return;
    }

    try {
      const updateRequest: UpdateTipRequest = {
        title: editForm.title,
        content: editForm.content
      };
      
      await TipService.updateTip(Number(tipId), updateRequest, accessToken);
      toast.success("Tip updated successfully!");
      router.push("/tips");
    } catch (error: any) {
      console.error("Error updating tip:", error);
      toast.error(error.message || "Failed to update tip");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-16">
        <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tip details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tip) {
    return (
      <div className="min-h-screen pt-32 pb-16">
        <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">
          <div className="text-center py-12">
            <Icon icon="tabler:alert-circle" className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tip Not Found</h2>
            <p className="text-gray-600 mb-6">The tip you are looking for does not exist or has been removed.</p>
            <Link 
              href="/tips"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Icon icon="tabler:arrow-left" className="text-xl" />
              Back to Tips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/tips"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <Icon icon="tabler:arrow-left" className="text-xl" />
            Back to Tips
          </Link>
        </div>

        {/* Content */}
        <article className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          {isEditMode && isMentor ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-xl"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  id="content"
                  value={editForm.content}
                  onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
                <Link
                  href={`/tips/${tipId}`}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          ) : (
            <>
              <header className="mb-8">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{tip.title}</h1>
                  {isMentor && (
                    <Link
                      href={`/tips/${tipId}?edit=true`}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Icon icon="tabler:edit" className="text-2xl" />
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Icon icon="tabler:user" className="text-lg" />
                    <span>By {tip.mentorFullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="tabler:calendar" className="text-lg" />
                    <time dateTime={tip.createdAt}>{formatDate(tip.createdAt)}</time>
                  </div>
                </div>
              </header>

              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-wrap">{tip.content}</p>
              </div>
            </>
          )}
        </article>
      </div>
    </main>
  );
}