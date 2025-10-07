"use client";

import { Tips } from "@/types/tips";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getTip } from "@/services/tipService";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const TipDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [tip, setTip] = useState<Tips | null>(null);
  const [loading, setLoading] = useState(true);

  const isMentor = session?.user?.role?.toLowerCase() === "mentor";

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const tipData = await getTip(parseInt(params.id));
        setTip(tipData);
      } catch (error) {
        toast.error("Failed to load tip details");
        router.push("/tips");
      } finally {
        setLoading(false);
      }
    };

    fetchTip();
  }, [params.id]);

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
        <div className="max-w-[800px] mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Navigation */}
            <div className="mb-8">
              <Link
                href="/tips"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                ← Back to Tips
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {tip.title}
            </h1>

            {/* Metadata */}
            <div className="flex items-center mb-6 space-x-4 text-sm text-gray-500">
              {tip.mentor && (
                <span className="text-gray-500">
                  By {tip.mentor.name}
                </span>
              )}
              <span>•</span>
              <time>
                {format(new Date(tip.createdAt), "MMMM d, yyyy")}
              </time>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <p className="text-gray-600 whitespace-pre-wrap">
                {tip.content}
              </p>
            </div>

            {/* Actions */}
            {isMentor && (
              <div className="mt-8 flex justify-end space-x-4">
                <Link
                  href={`/tips/${tip.tipId}/edit`}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Edit Tip
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TipDetailPage;