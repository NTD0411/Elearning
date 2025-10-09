"use client";

import { Tips, UpdateTipDto } from "@/types/tips";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getTip, updateTip } from "@/services/tipService";
import { toast } from "react-hot-toast";

const EditTipPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tip, setTip] = useState<Tips | null>(null);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const tipData = await getTip(parseInt(params.id));
        setTip(tipData);
      } catch (error) {
        toast.error("Failed to load tip data");
        router.push("/tips");
      } finally {
        setLoading(false);
      }
    };

    fetchTip();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tip || !session?.user?.role || session.user.role.toLowerCase() !== "mentor") {
      toast.error("You must be a mentor to edit tips");
      return;
    }

    try {
      setSaving(true);
      await updateTip(tip.tipId, {
        title: tip.title,
        content: tip.content
      });
      toast.success("Tip updated successfully!");
      router.push("/tips");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred while updating the tip");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tip) {
    return null;
  }

  return (
    <section className="pt-[120px] pb-[120px]">
      <div className="container">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full px-4">
            <div className="mx-auto mb-12 max-w-[510px] text-center lg:mb-20">
              <span className="block mb-2 text-lg font-semibold text-primary">
                Edit Tip
              </span>
              <h2 className="mb-3 text-3xl font-bold text-dark sm:text-4xl md:text-[40px] md:leading-[1.2]">
                Update Your Tip
              </h2>
            </div>
          </div>

          <div className="w-full px-4">
            <div className="max-w-[600px] mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={tip.title}
                    onChange={(e) => setTip({ ...tip, title: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    id="content"
                    rows={6}
                    value={tip.content}
                    onChange={(e) => setTip({ ...tip, content: e.target.value })}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {saving ? "Updating..." : "Update Tip"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditTipPage;