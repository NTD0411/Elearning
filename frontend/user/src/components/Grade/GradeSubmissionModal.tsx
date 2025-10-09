"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";

interface GradeSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: {
    submissionId: number;
    examType: string;
    studentName: string;
    answerText?: string;
    answerAudioUrl?: string;
    submissionDate: string;
  };
  onGradeSubmit: () => void;
}

export default function GradeSubmissionModal({
  isOpen,
  onClose,
  submission,
  onGradeSubmit
}: GradeSubmissionModalProps) {
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!score || parseFloat(score) < 0 || parseFloat(score) > 10) {
      toast({
        variant: "destructive",
        title: "Invalid score",
        description: "Please enter a score between 0 and 10",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5074/api/Submission/${submission.submissionId}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          mentorScore: parseFloat(score),
          feedback: feedback,
          status: "Graded"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to grade submission");
      }

      toast({
        title: "Success",
        description: "Submission graded successfully",
      });
      onGradeSubmit();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to grade submission. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Student</Label>
            <div className="col-span-3">
              <p className="text-sm">{submission.studentName}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Type</Label>
            <div className="col-span-3">
              <p className="text-sm">{submission.examType}</p>
            </div>
          </div>

          {submission.answerText && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right">Answer</Label>
              <div className="col-span-3">
                <div className="p-4 bg-muted rounded-md">
                  <pre className="text-sm whitespace-pre-wrap">{submission.answerText}</pre>
                </div>
              </div>
            </div>
          )}

          {submission.answerAudioUrl && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Audio</Label>
              <div className="col-span-3">
                <audio controls className="w-full">
                  <source src={submission.answerAudioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="score" className="text-right">Score</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="col-span-3"
              placeholder="Enter score (0-10)"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="feedback" className="text-right">Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="col-span-3"
              placeholder="Enter feedback for student"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Grade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}