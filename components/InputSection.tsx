import React, { ChangeEvent, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, FileType, Sparkles } from 'lucide-react';
import { QuestionInput } from '../types';

interface InputSectionProps {
  input: QuestionInput;
  setInput: React.Dispatch<React.SetStateAction<QuestionInput>>;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const SAMPLE_TEXT = `【題目】
小明在網路上看到一則新聞報導，標題寫著：「立法院三讀通過修正案，降低投票年齡至18歲。」
請問：這項修正案通過後，小明（19歲）可以行使下列哪一項權利？
(A) 罷免總統
(B) 參加公務人員考試
(C) 登記參選立法委員
(D) 簽署公民投票提案

【老師說明】
此題希望能結合時事，測驗學生對於參政權年齡限制的理解。希望確認題目是否符合素養導向命題原則，情境是否適切。`;

const InputSection: React.FC<InputSectionProps> = ({ input, setInput, onAnalyze, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(prev => ({ ...prev, text: e.target.value }));
  };

  const handleLoadExample = () => {
    setInput(prev => ({ ...prev, text: SAMPLE_TEXT }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf = file.type === 'application/pdf';
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setInput(prev => ({
          ...prev,
          file: file,
          filePreview: reader.result as string,
          fileType: isPdf ? 'pdf' : 'image'
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setInput(prev => ({ ...prev, file: null, filePreview: null, fileType: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isButtonDisabled = isAnalyzing || (!input.text.trim() && !input.file);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all duration-300 hover:shadow-md">
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="questionText" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            試題文字 / 題幹 (Optional Text)
          </label>
          <button
            onClick={handleLoadExample}
            disabled={isAnalyzing}
            className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            載入範例 (Example)
          </button>
        </div>
        <textarea
          id="questionText"
          className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-slate-700 placeholder-slate-400 bg-slate-50 transition-colors text-sm leading-relaxed"
          placeholder="請在此輸入題幹敘述，或點擊上方「載入範例」..."
          value={input.text}
          onChange={handleTextChange}
        />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Upload className="w-4 h-4" />
          上傳試題檔案 (PDF / 圖片)
        </label>
        
        {!input.file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group"
          >
            <div className="bg-blue-50 p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
               <FileType className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">
              點擊上傳檔案
            </span>
            <span className="text-xs text-slate-400 mt-1">
              PDF, JPG, PNG
            </span>
          </div>
        ) : (
          <div className="relative border border-slate-200 rounded-lg p-2 bg-slate-50 group">
            <button 
              onClick={removeFile}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm z-10"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
            
            {input.fileType === 'image' && input.filePreview ? (
              <div className="flex justify-center">
                 <img 
                  src={input.filePreview} 
                  alt="Preview" 
                  className="max-h-48 object-contain rounded"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <FileType className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {input.file?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    PDF 文件 • {(input.file!.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,.pdf"
          onChange={handleFileChange}
        />
      </div>

      <button
        onClick={onAnalyze}
        disabled={isButtonDisabled}
        className={`w-full py-3 px-6 rounded-lg font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2
          ${isButtonDisabled 
            ? 'bg-slate-300 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transform active:scale-[0.99]'
          }`}
      >
        {isAnalyzing ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            AI 審題分析中... (Analyzing)
          </>
        ) : (
          <>
            開始審題 (Analyze)
          </>
        )}
      </button>
    </div>
  );
};

export default InputSection;