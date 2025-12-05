import React from 'react';
import { AnalysisResult, AssessmentCriteria, QuestionImprovement } from '../types';
import { CheckCircle2, AlertCircle, TrendingUp, BrainCircuit, BookOpen, Target, Scale, ClipboardCheck, ArrowRight, FileEdit, ShieldCheck, Printer } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnalysisReportProps {
  result: AnalysisResult;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let colorClass = 'bg-red-100 text-red-700 border-red-200';
  if (score >= 80) colorClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
  else if (score >= 60) colorClass = 'bg-amber-100 text-amber-700 border-amber-200';

  return (
    <div className={`px-4 py-2 rounded-full border ${colorClass} font-bold text-xl flex items-center justify-center min-w-[4rem]`}>
      {score}
    </div>
  );
};

const CriteriaCard: React.FC<{ criteria: AssessmentCriteria; icon: React.ReactNode }> = ({ criteria, icon }) => {
  let statusColor = 'bg-slate-50 border-slate-200';
  let iconColor = 'text-slate-400';
  
  switch (criteria.status) {
    case 'excellent':
      statusColor = 'bg-emerald-50 border-emerald-200';
      iconColor = 'text-emerald-600';
      break;
    case 'good':
      statusColor = 'bg-blue-50 border-blue-200';
      iconColor = 'text-blue-600';
      break;
    case 'warning':
      statusColor = 'bg-amber-50 border-amber-200';
      iconColor = 'text-amber-600';
      break;
    case 'critical':
      statusColor = 'bg-red-50 border-red-200';
      iconColor = 'text-red-600';
      break;
  }

  return (
    <div className={`p-4 rounded-xl border ${statusColor} transition-all break-inside-avoid`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-white shadow-sm ${iconColor}`}>
            {icon}
          </div>
          <h4 className="font-bold text-slate-800">{criteria.title}</h4>
        </div>
        <ScoreBadge score={criteria.score} />
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mt-2">{criteria.description}</p>
    </div>
  );
};

const QuestionImprovementCard: React.FC<{ improvement: QuestionImprovement }> = ({ improvement }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow break-inside-avoid">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded border border-indigo-200 flex-shrink-0">
          {improvement.questionId}
        </span>
        <h5 className="font-bold text-slate-800 text-sm flex-1">{improvement.issue}</h5>
      </div>
      <div className="flex gap-2 items-start mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <ArrowRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-semibold text-emerald-700">建議修改：</span>
          {improvement.suggestion}
        </p>
      </div>
    </div>
  );
};

const AnalysisReport: React.FC<AnalysisReportProps> = ({ result }) => {
  const chartData = [
    { name: 'Score', value: result.overallScore },
    { name: 'Remaining', value: 100 - result.overallScore }
  ];
  
  const COLORS = result.overallScore >= 80 ? ['#10b981', '#ecfdf5'] : result.overallScore >= 60 ? ['#f59e0b', '#fffbeb'] : ['#ef4444', '#fef2f2'];

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Header Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden">
        {/* Print Button */}
        <button 
          onClick={() => window.print()}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all print:hidden"
          title="列印報告 / 另存 PDF"
        >
          <Printer className="w-5 h-5" />
        </button>

        <div className="relative w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-slate-800">{result.overallScore}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">總分</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              認知層次 (Bloom's): {result.bloomsLevel}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">審題總結</h3>
          <p className="text-slate-600 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Detailed Criteria Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <CriteriaCard 
          criteria={result.criteriaBreakdown.realContext} 
          icon={<BookOpen className="w-5 h-5" />} 
        />
        <CriteriaCard 
          criteria={result.criteriaBreakdown.problemSolving} 
          icon={<Target className="w-5 h-5" />} 
        />
        <CriteriaCard 
          criteria={result.criteriaBreakdown.interdisciplinary} 
          icon={<BrainCircuit className="w-5 h-5" />} 
        />
        <CriteriaCard 
          criteria={result.criteriaBreakdown.technicalQuality} 
          icon={<Scale className="w-5 h-5" />} 
        />
        <CriteriaCard 
          criteria={result.criteriaBreakdown.editorialQuality} 
          icon={<ClipboardCheck className="w-5 h-5" />} 
        />
        <CriteriaCard 
          criteria={result.criteriaBreakdown.contentReview} 
          icon={<ShieldCheck className="w-5 h-5" />} 
        />
      </div>

      {/* Specific Question Improvements - NEW SECTION */}
      {result.questionImprovements && result.questionImprovements.length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 break-inside-avoid">
          <h4 className="flex items-center gap-2 text-indigo-800 font-bold mb-4">
            <FileEdit className="w-5 h-5" />
            個別試題修改建議 (Specific Question Improvements)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.questionImprovements.map((item, idx) => (
              <QuestionImprovementCard key={idx} improvement={item} />
            ))}
          </div>
        </div>
      )}

      {/* Lists: Strengths, Weaknesses, Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Strengths */}
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 break-inside-avoid">
          <h4 className="flex items-center gap-2 text-emerald-800 font-bold mb-4">
            <CheckCircle2 className="w-5 h-5" />
            優點 (Strengths)
          </h4>
          <ul className="space-y-3">
            {result.strengths.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-emerald-700">
                <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-100 break-inside-avoid">
          <h4 className="flex items-center gap-2 text-red-800 font-bold mb-4">
            <AlertCircle className="w-5 h-5" />
            待改進 (Weaknesses)
          </h4>
          <ul className="space-y-3">
            {result.weaknesses.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-red-700">
                <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* General Suggestions */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 break-inside-avoid">
          <h4 className="flex items-center gap-2 text-blue-800 font-bold mb-4">
            <TrendingUp className="w-5 h-5" />
            整體建議 (General Suggestions)
          </h4>
          <ul className="space-y-3">
            {result.suggestions.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-sm text-blue-700">
                <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default AnalysisReport;