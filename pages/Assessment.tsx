import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/UI';
import { Clock } from 'lucide-react';

export const Assessment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { submitAssessment, items, quizzes, user } = useStore();
  
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; credentialIssued: boolean } | null>(null);

  const item = items.find(i => i.id === id);
  const quiz = quizzes.find(q => q.itemId === id);

  if (!item || !quiz) return <div>Quiz not found</div>;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const isContributor = user?.role === 'CONTRIBUTOR';
  const canViewDraft = isAdmin || (isContributor && item.createdById === user?.id);
  if (item.status !== 'PUBLISHED' && !canViewDraft) {
    return <div className="p-8 text-slate-600">This course is not published yet.</div>;
  }

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(curr => curr + 1);
    } else {
        // Calculate Score
        let correctCount = 0;
        quiz.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctIndex) correctCount++;
        });
        const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);
        
        const res = submitAssessment(item.id, scorePercent);
        setResult(res);
        setFinished(true);
    }
  };

  // Intro Screen
  if (!started) {
      return (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
              <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-primary">
                  <h1 className="text-3xl font-display uppercase mb-2">{item.title} Assessment</h1>
                  <p className="text-slate-500 mb-8">Prove your skills to earn your credential.</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-slate-50 p-4 rounded-lg">
                          <p className="text-xs font-bold uppercase text-slate-400">Pass Mark</p>
                          <p className="text-2xl font-bold text-slate-800">{quiz.passMark}%</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                          <p className="text-xs font-bold uppercase text-slate-400">Questions</p>
                          <p className="text-2xl font-bold text-slate-800">{quiz.questions.length}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg">
                          <p className="text-xs font-bold uppercase text-slate-400">Time Est.</p>
                          <p className="text-2xl font-bold text-slate-800">{quiz.timeLimitMinutes}m</p>
                      </div>
                  </div>

                  <Button size="lg" onClick={() => setStarted(true)}>Start Assessment</Button>
              </div>
          </div>
      );
  }

  // Result Screen
  if (finished && result) {
      return (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
             <div className="bg-white p-8 rounded-2xl shadow-xl">
                 {result.passed ? (
                     <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h2 className="text-3xl font-display uppercase text-green-600 mb-2">You Passed!</h2>
                        <p className="text-slate-600 mb-8">Great work demonstrating your knowledge.</p>
                        {result.credentialIssued ? (
                             <Button onClick={() => navigate(`/credential/${item.id}`)} variant="secondary" size="lg">
                                View Credential
                             </Button>
                        ) : (
                             <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
                        )}
                     </>
                 ) : (
                     <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">😕</span>
                        </div>
                        <h2 className="text-3xl font-display uppercase text-red-600 mb-2">Not Quite Yet</h2>
                        <p className="text-slate-600 mb-8">Review the material and try again.</p>
                        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
                     </>
                 )}
             </div>
          </div>
      );
  }

  // Quiz Interface
  const q = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
      <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-slate-400 uppercase text-xs">Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                  <Clock size={14} /> {quiz.timeLimitMinutes}:00
              </div>
          </div>
          
          <div className="w-full bg-gray-200 h-2 rounded-full mb-12">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>

          <h2 className="text-2xl font-bold mb-8">{q.prompt}</h2>

          <div className="space-y-4 mb-12">
              {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all ${
                        answers[currentQuestion] === idx 
                        ? 'border-primary bg-blue-50 text-primary font-bold' 
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                      {opt}
                  </button>
              ))}
          </div>

          <div className="flex justify-end">
              <Button 
                onClick={handleNext} 
                disabled={answers[currentQuestion] === undefined}
              >
                  {currentQuestion === quiz.questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
              </Button>
          </div>
      </div>
  );
};
