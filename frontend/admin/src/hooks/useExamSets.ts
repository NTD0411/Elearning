import { useState, useEffect } from 'react';

export interface ExamSet {
  examSetId: number;
  examSetTitle: string;
  examSetCode: string;
  totalQuestions: number; // Target number of questions
  createdAt: string;
  questionCount: number; // Actual questions created so far
  type: string;
}

export function useExamSets(examType: string) {
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExamSets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.VITE_API_URL || 'https://e-learningsite.runasp.net/api'}/ExamSet/${examType}`);
      
      if (response.ok) {
        const data = await response.json();
        setExamSets(data);
        setError(null);
      } else {
        setError('Failed to fetch exam sets');
      }
    } catch (err) {
      setError('Error fetching exam sets');
      console.error('Error fetching exam sets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamSets();
  }, [examType]);

  return { examSets, loading, error, refetch: fetchExamSets };
}