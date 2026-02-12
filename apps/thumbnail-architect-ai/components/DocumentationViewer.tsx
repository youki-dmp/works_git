import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, Book, FileText, ChevronRight, Loader2 } from 'lucide-react';

interface DocumentationViewerProps {
  onClose: () => void;
}

const DocumentationViewer: React.FC<DocumentationViewerProps> = ({ onClose }) => {
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const docs = [
    { id: 'task.md', title: 'Task List', icon: <FileText className="w-4 h-4" /> },
    { id: 'walkthrough.md', title: 'Walkthrough', icon: <Book className="w-4 h-4" /> },
    { id: 'trend_analysis_specification.md', title: 'Trend Spec', icon: <ChevronRight className="w-4 h-4" /> },
    { id: 'concerns_and_improvements.md', title: 'Concerns & Improvements', icon: <X className="w-4 h-4 text-red-400" /> },
    { id: 'implementation_plan.md', title: 'Implementation Plan', icon: <FileText className="w-4 h-4 text-green-400" /> },
    { id: 'team_assignments.md', title: 'Team Assignments', icon: <ChevronRight className="w-4 h-4 text-indigo-400" /> },
  ];

  useEffect(() => {
    if (activeDoc) {
      setLoading(true);
      fetch(`/docs/internal/${activeDoc}`)
        .then(res => res.text())
        .then(text => {
          setContent(text);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setContent('ファイルの読み込みに失敗しました。');
          setLoading(false);
        });
    }
  }, [activeDoc]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in transition-all">
      <div className="bg-[#0f172a] border border-slate-700 w-full max-w-6xl h-full max-h-[90vh] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Book className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white uppercase">Team Library</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Internal Workflows & Documentation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-grow overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-slate-800 bg-slate-900/30 p-4 space-y-2">
            <h3 className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Documents</h3>
            {docs.map(doc => (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeDoc === doc.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                {doc.icon}
                {doc.title}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-grow overflow-y-auto p-12 bg-[#020617] custom-scrollbar selection:bg-indigo-500/30">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Accessing Secure Storage...</p>
              </div>
            ) : activeDoc ? (
              <div className="max-w-4xl mx-auto">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-4xl font-black text-white mb-8 border-b border-slate-800 pb-4 mt-12 first:mt-0" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-black text-indigo-400 mb-6 mt-10 uppercase tracking-tight" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-slate-200 mb-4 mt-8" {...props} />,
                    p: ({ node, ...props }) => <p className="text-slate-400 mb-4 leading-relaxed tracking-wide text-sm md:text-base" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-none space-y-3 mb-6" {...props} />,
                    li: ({ node, ...props }) => (
                      <li className="flex items-start gap-3 text-slate-400 text-sm md:text-base">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500/50 flex-shrink-0" />
                        <span>{props.children}</span>
                      </li>
                    ),
                    code: ({ node, ...props }) => <code className="bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-[0.9em]" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-600 bg-indigo-900/10 px-6 py-4 rounded-r-2xl italic text-slate-300 mb-6" {...props} />,
                    img: ({ node, ...props }) => (
                      <div className="my-10">
                        <img className="rounded-3xl shadow-2xl border border-slate-800 max-w-full h-auto" {...props} />
                        {props.alt && <p className="text-center text-[10px] text-slate-500 mt-3 font-bold uppercase tracking-widest">{props.alt}</p>}
                      </div>
                    )
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                <Book className="w-16 h-16 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-[0.3em] opacity-40">Select a document to view</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationViewer;
