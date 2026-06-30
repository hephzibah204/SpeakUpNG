'use client';

import { useState, useEffect } from 'react';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
}

interface CivicModule {
  id: string;
  title: string;
  content_markdown: string;
  category: string;
  xp_reward: number;
  quizzes: Quiz[];
}

export default function LearnPage() {
  const [modules, setModules] = useState<CivicModule[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Gamification States
  const [userXp, setUserXp] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState<Record<string, boolean>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load local XP and completed quizzes
    const savedXp = parseInt(localStorage.getItem('evote_civic_xp') || '0');
    setUserXp(savedXp);

    const savedCompleted = JSON.parse(localStorage.getItem('evote_completed_quizzes') || '{}');
    setSubmittedQuizzes(savedCompleted);

    fetch('/api/civic')
      .then((res) => res.json())
      .then((data) => {
        setModules(data.modules || []);
        if (data.modules && data.modules.length > 0) {
          setSelectedModuleId(data.modules[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedModule = modules.find((m) => m.id === selectedModuleId);

  const handleSelectOption = (quizId: string, optionIdx: number) => {
    if (submittedQuizzes[quizId]) return; // Cannot change answer after submission
    setSelectedAnswers((prev) => ({ ...prev, [quizId]: optionIdx }));
  };

  const handleSubmitQuiz = (quiz: Quiz, xpReward: number) => {
    const selectedIdx = selectedAnswers[quiz.id];
    if (selectedIdx === undefined || submittedQuizzes[quiz.id]) return;

    const isCorrect = selectedIdx === quiz.correct_option_index;

    // Update results
    setQuizResults((prev) => ({ ...prev, [quiz.id]: isCorrect }));

    // Mark as submitted
    const newSubmitted = { ...submittedQuizzes, [quiz.id]: true };
    setSubmittedQuizzes(newSubmitted);
    localStorage.setItem('evote_completed_quizzes', JSON.stringify(newSubmitted));

    if (isCorrect) {
      const newXp = userXp + xpReward;
      setUserXp(newXp);
      localStorage.setItem('evote_civic_xp', String(newXp));
      alert(`🎉 Correct! You earned +${xpReward} XP!`);
    } else {
      alert('❌ Incorrect answer. Keep learning and try again!');
    }
  };

  const getRankBadge = (xp: number) => {
    if (xp >= 200) return '👑 Civic Champion';
    if (xp >= 100) return '🛡️ Policy Analyst';
    if (xp >= 50) return '🎓 Active Citizen';
    return '🌱 Civic Novice';
  };

  return (
    <div className="min-h-screen bg-[#141714] text-[#f8f7f2] font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with XP Badge */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-[#2c312a] pb-6 mb-10">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-extrabold font-display text-white mb-2">Civic Learning Centre</h1>
            <p className="text-lg text-[#6b7163]">
              Learn about democratic institutions, voting rights, and the constitution.
            </p>
          </div>
          
          <div className="bg-[#1d211b] border border-[#2c312a] px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl">
            <div className="text-center border-r border-[#2c312a] pr-4">
              <div className="text-2xl font-black text-[#e8a020]">{userXp}</div>
              <div className="text-[10px] uppercase font-bold text-[#6b7163]">Total XP</div>
            </div>
            <div>
              <span className="inline-block px-3 py-1 bg-[#008751]/10 border border-[#008751]/30 text-[#00b368] rounded-full text-xs font-bold uppercase tracking-wide">
                {getRankBadge(userXp)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Modules List */}
          <div className="lg:col-span-4 bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 shadow-2xl space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b7163]">Learning Modules</h3>
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b368]"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {modules.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModuleId(m.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      selectedModuleId === m.id
                        ? 'bg-[#008751]/10 border-[#00b368] text-white'
                        : 'bg-[#141714] border-[#2c312a] hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] uppercase font-bold text-[#00b368] bg-[#008751]/10 border border-[#008751]/20 px-2 py-0.5 rounded">
                        {m.category}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm truncate mt-2">{m.title}</h4>
                      <p className="text-[10px] text-zinc-550 mt-1">{m.xp_reward} XP Reward</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reading & Quiz Pane */}
          <div className="lg:col-span-8 space-y-6">
            {selectedModule && (
              <div className="space-y-6 animate-fadeIn">
                {/* Module Reading Card */}
                <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sm:p-10 shadow-2xl">
                  <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed text-sm sm:text-base">
                    {/* Render content dynamically with basic styling */}
                    <div className="space-y-4">
                      {selectedModule.content_markdown
                        .split('\n')
                        .map((line, idx) => {
                          if (line.startsWith('# ')) {
                            return <h2 key={idx} className="text-2xl font-black text-white border-b border-[#2c312a] pb-3 mb-6 font-display">{line.slice(2)}</h2>;
                          }
                          if (line.startsWith('## ')) {
                            return <h3 key={idx} className="text-lg font-bold text-[#e8a020] mt-6 mb-3 font-display">{line.slice(3)}</h3>;
                          }
                          if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                            return <p key={idx} className="pl-4 border-l-2 border-[#00b368] text-zinc-400 py-1">{line}</p>;
                          }
                          return <p key={idx}>{line}</p>;
                        })}
                    </div>
                  </div>
                </div>

                {/* Gamified Quiz Card */}
                {selectedModule.quizzes && selectedModule.quizzes.length > 0 && (
                  <div className="bg-[#1d211b] border border-[#2c312a] rounded-2xl p-6 sm:p-10 shadow-2xl">
                    <h3 className="text-lg font-bold font-display text-white mb-6 flex items-center gap-2">
                      ⚡ Module Quiz Challenge
                    </h3>
                    <div className="space-y-6">
                      {selectedModule.quizzes.map((q) => {
                        const hasSubmitted = submittedQuizzes[q.id];
                        const isCorrect = quizResults[q.id];
                        const selectedIdx = selectedAnswers[q.id];

                        return (
                          <div key={q.id} className="space-y-4 border-t border-[#2c312a]/40 pt-6 first:border-t-0 first:pt-0">
                            <h4 className="font-bold text-sm sm:text-base text-white">{q.question}</h4>
                            <div className="grid grid-cols-1 gap-2.5">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = selectedIdx === oIdx;
                                const showSuccess = hasSubmitted && oIdx === q.correct_option_index;
                                const showFailure = hasSubmitted && isSelected && !isCorrect;

                                return (
                                  <button
                                    key={oIdx}
                                    disabled={hasSubmitted}
                                    onClick={() => handleSelectOption(q.id, oIdx)}
                                    className={`w-full p-4 rounded-xl border text-left font-semibold text-xs sm:text-sm transition-all ${
                                      showSuccess
                                        ? 'bg-[#008751]/10 border-[#00b368] text-[#00b368]'
                                        : showFailure
                                        ? 'bg-[#c0392b]/10 border-[#e57368] text-[#e57368]'
                                        : isSelected
                                        ? 'bg-[#e8a020]/10 border-[#e8a020] text-[#e8a020]'
                                        : 'bg-[#141714] border-[#2c312a] hover:border-zinc-700 text-zinc-300'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {!hasSubmitted ? (
                              <button
                                onClick={() => handleSubmitQuiz(q, selectedModule.xp_reward)}
                                disabled={selectedIdx === undefined}
                                className="px-6 py-3 bg-[#008751] hover:bg-[#00b368] disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-lg"
                              >
                                Submit Answer
                              </button>
                            ) : (
                              <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold border ${
                                isCorrect 
                                  ? 'bg-[#008751]/10 border-[#00b368]/20 text-[#00b368]'
                                  : 'bg-[#c0392b]/10 border-[#c0392b]/20 text-[#e57368]'
                              }`}>
                                {isCorrect 
                                  ? '🎉 Brilliant! You answered correctly!' 
                                  : `❌ That was incorrect. The correct answer was: "${q.options[q.correct_option_index]}"`
                                }
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
