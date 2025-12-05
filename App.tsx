import React, { useState } from 'react';
import { PenTool, Info } from 'lucide-react';
import InputSection from './components/InputSection';
import AnalysisReport from './components/AnalysisReport';
import { QuestionInput, AnalysisResult } from './types';
import { analyzeQuestion } from './services/geminiService';

const App: React.FC = () => {
  const [input, setInput] = useState<QuestionInput>({
    text: '',
    file: null,
    filePreview: null,
    fileType: null
  });
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.text.trim() && !input.file) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeQuestion(input.text, input.file);
      setResult(data);
    } catch (err) {
      setError("分析過程發生錯誤，請稍後再試。請確保您已設定 API Key。");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <PenTool size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600">
              社會領域素養導向評量審題系統
            </h1>
          </div>
          <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
            <Info size={16} />
            命題原則說明
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4">
              <h2 className="text-indigo-800 font-bold mb-2 text-sm uppercase tracking-wide">使用說明</h2>
              <p className="text-sm text-indigo-700 leading-relaxed">
                請輸入題幹文字，或直接上傳整份試題 PDF 檔案。系統將依據「真實情境」、「問題解決」及「核心素養」等指標進行分析。
              </p>
            </div>
            <InputSection 
              input={input} 
              setInput={setInput} 
              onAnalyze={handleAnalyze} 
              isAnalyzing={isAnalyzing} 
            />
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <Info className="w-5 h-5" />
                {error}
              </div>
            )}

            {result ? (
              <AnalysisReport result={result} />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <PenTool className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">尚無分析結果</p>
                <p className="text-sm mt-2">請在左側輸入或上傳題目以開始分析</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm mt-8">
        © {new Date().getFullYear()} Social Studies Assessment Analyst. Based on principles by NAER.
      </footer>
    </div>
  );
};

export default App;