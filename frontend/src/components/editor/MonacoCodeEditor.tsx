import React, { useRef, useEffect } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Diagnostic, LanguageSlug } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface MonacoCodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: LanguageSlug;
  diagnostics: Diagnostic[];
  activeDiagnostic?: Diagnostic | null;
  onRun?: () => void;
  onAnalyze?: () => void;
  readOnly?: boolean;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  code,
  onChange,
  language,
  diagnostics,
  activeDiagnostic,
  onRun,
  onAnalyze,
  readOnly = false,
}) => {
  const { theme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsCollectionRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  // Map our language slugs to Monaco editor languages
  const getMonacoLanguage = (lang: LanguageSlug): string => {
    switch (lang) {
      case 'python': return 'python';
      case 'javascript': return 'javascript';
      case 'cpp': return 'cpp';
      default: return 'plaintext';
    }
  };

  const handleEditorDidMount: OnMount = (editorInstance, monacoInstance) => {
    editorRef.current = editorInstance;
    monacoRef.current = monacoInstance;

    // Define custom dark theme
    monacoInstance.editor.defineTheme('codemaster-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: '2dd4bf', fontStyle: 'bold' },
        { token: 'string', foreground: 'fde047' },
        { token: 'number', foreground: 'c084fc' },
        { token: 'function', foreground: '60a5fa' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#c9d1d9',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#2dd4bf',
        'editor.selectionBackground': '#1e293b',
        'editor.inactiveSelectionBackground': '#161b22',
        'editorCursor.foreground': '#2dd4bf',
        'editorWhitespace.foreground': '#374151',
        'editorError.foreground': '#f43f5e',
        'editorWarning.foreground': '#f59e0b',
        'editorInfo.foreground': '#38bdf8',
      }
    });

    monacoInstance.editor.setTheme(theme === 'dark' ? 'codemaster-dark' : 'light');

    // Register keyboard shortcuts
    editorInstance.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
      if (onRun) onRun();
    });

    editorInstance.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyMod.Shift | monacoInstance.KeyCode.KeyA, () => {
      if (onAnalyze) onAnalyze();
    });
  };

  // Sync theme changes with Monaco
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'codemaster-dark' : 'light');
    }
  }, [theme]);

  // Reveal active diagnostic line when user selects one
  useEffect(() => {
    if (!editorRef.current || !activeDiagnostic) return;
    const model = editorRef.current.getModel();
    if (!model) return;
    const lineCount = model.getLineCount();
    const safeLine = Math.min(Math.max(1, activeDiagnostic.line), lineCount);
    editorRef.current.revealLineInCenter(safeLine);
    editorRef.current.setPosition({ lineNumber: safeLine, column: activeDiagnostic.column });
  }, [activeDiagnostic]);

  // Synchronize Monaco Markers and Line Highlights with Diagnostics
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    const lineCount = model.getLineCount();

    // 1. Set Monaco Markers (Squiggly underlines and hover tooltips)
    const markers: editor.IMarkerData[] = diagnostics.map((diag) => {
      let severity = monacoRef.current!.MarkerSeverity.Error;
      if (diag.severity === 'warning') severity = monacoRef.current!.MarkerSeverity.Warning;
      if (diag.severity === 'info') severity = monacoRef.current!.MarkerSeverity.Info;

      const safeLine = Math.min(Math.max(1, diag.line), lineCount);
      const lineContent = model.getLineContent(safeLine) || '';
      
      const startCol = Math.max(1, Math.min(diag.column, lineContent.length + 1));
      const endCol = Math.max(startCol + 1, diag.end_column || lineContent.length + 1);

      return {
        severity,
        startLineNumber: safeLine,
        startColumn: startCol,
        endLineNumber: diag.end_line ? Math.min(diag.end_line, lineCount) : safeLine,
        endColumn: endCol,
        message: `${diag.message}${diag.suggested_fix ? `\n💡 Suggestion: ${diag.suggested_fix}` : ''}`,
        source: `CodeMaster Preflight [${diag.source}]`,
        code: diag.error_code
      };
    });

    monacoRef.current.editor.setModelMarkers(model, 'codemaster-analyzer', markers);

    // 2. Set Visual Line Highlight, Gutter Dot, and Inline Trailing Badge Decorations
    const newDecorations: editor.IModelDeltaDecoration[] = diagnostics.map((diag) => {
      const safeLine = Math.min(Math.max(1, diag.line), lineCount);
      const isError = diag.severity === 'error';
      const lineContent = model.getLineContent(safeLine) || '';
      const cleanMsg = diag.message
        .replace(/^Python Syntax Error:\s*/, '')
        .replace(/^JavaScript Syntax Error:\s*/, '')
        .replace(/^C\+\+:\s*/, '');

      return {
        range: new monacoRef.current!.Range(safeLine, 1, safeLine, lineContent.length + 1),
        options: {
          isWholeLine: true,
          className: isError ? 'monaco-error-line' : 'monaco-warning-line',
          glyphMarginClassName: isError ? 'monaco-error-glyph' : 'monaco-warning-glyph',
          glyphMarginHoverMessage: { value: `**[${diag.error_code}]** ${diag.message}` },
          overviewRuler: {
            color: isError ? '#f43f5e' : '#f59e0b',
            position: monacoRef.current!.editor.OverviewRulerLane.Right
          },
          minimap: {
            color: isError ? '#f43f5e' : '#f59e0b',
            position: monacoRef.current!.editor.MinimapPosition.Inline
          },
          after: {
            content: `   ⛔ ${cleanMsg}`,
            inlineClassName: isError ? 'monaco-inline-error-badge' : 'monaco-inline-warning-badge',
          }
        }
      };
    });

    if (decorationsCollectionRef.current) {
      decorationsCollectionRef.current.set(newDecorations);
    } else {
      decorationsCollectionRef.current = editorRef.current.createDecorationsCollection(newDecorations);
    }

  }, [diagnostics]);

  const errorDiagnostics = diagnostics.filter(d => d.severity === 'error');
  const primaryError = errorDiagnostics.length > 0 ? errorDiagnostics[0] : null;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-slate-800 bg-[#0d1117] shadow-xl">
      <Editor
        height="100%"
        width="100%"
        language={getMonacoLanguage(language)}
        value={code}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          readOnly,
          minimap: { enabled: true, maxColumn: 80 },
          automaticLayout: true,
          tabSize: language === 'python' ? 4 : 2,
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true },
          padding: { top: 12, bottom: 12 },
          renderValidationDecorations: 'on',
          glyphMargin: true,
          hover: { delay: 150 },
        }}
      />

      {/* Floating Instant Error Spotter Badge in Editor Corner */}
      {primaryError && (
        <div className="pointer-events-none absolute bottom-3 right-5 z-10 flex items-center gap-2 rounded-full bg-rose-950/90 border border-rose-500/50 px-3 py-1 shadow-xl backdrop-blur text-xs font-mono text-rose-200">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping shrink-0" />
          <span className="font-bold text-rose-400">Preflight Error Spotted:</span>
          <span className="text-slate-300">Line {primaryError.line}:{primaryError.column}</span>
          <span className="rounded bg-rose-900/60 px-1.5 py-0.2 text-[10px] text-rose-200 font-bold border border-rose-500/40">
            {primaryError.error_code}
          </span>
        </div>
      )}
    </div>
  );
};
