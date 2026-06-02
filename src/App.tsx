import React, { useState, useEffect } from 'react';
import { generateAnkiCard, AnkiCardData } from './lib/gemini';
import { Copy, Loader2, Check, Key } from 'lucide-react';

function CopyableField({ label, value, isFullWidth = false, isDark = false, isSerif = true, isItalic = false }: { label: string; value: string, isFullWidth?: boolean, isDark?: boolean, isSerif?: boolean, isItalic?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 md:p-8 rounded-3xl border flex flex-col justify-between group transition-all ${isDark ? 'bg-[#1A1A1A] text-white border-transparent shadow-xl' : 'bg-white border-[#1A1A1A]/5 text-[#1A1A1A]'} ${isFullWidth ? 'md:col-span-2' : ''}`}>
      <div className="space-y-4">
        <label className={`block text-[10px] font-bold uppercase tracking-widest ${isDark ? 'opacity-50' : 'opacity-40'}`}>
          {label}
        </label>
        <p className={`text-xl md:text-2xl break-words ${isSerif ? 'font-serif' : 'font-mono text-base md:text-lg'} ${isItalic ? 'italic leading-relaxed' : ''}`}>
          {value}
        </p>
      </div>
      <button 
        onClick={handleCopy}
        className={`self-end text-[10px] font-bold uppercase border px-3 py-1.5 rounded-lg mt-6 transition-opacity flex items-center gap-1.5
          ${isDark ? 'border-white/20 hover:bg-white/10 text-white' : 'border-[#1A1A1A]/20 hover:bg-[#1A1A1A]/5 text-[#1A1A1A] opacity-100 md:opacity-0 group-hover:opacity-100'} 
          ${copied ? (isDark ? '!text-green-400 !border-green-400/30 opacity-100' : '!text-green-600 !border-green-600/30 opacity-100') : ''}`}
      >
        {copied ? (
          <><Check size={12} strokeWidth={3} /> Copiado</>
        ) : (
          'Copiar'
        )}
      </button>
    </div>
  );
}

export default function App() {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<AnkiCardData | null>(null);

  // Manejo de la API KEY en localStorage
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
    else setShowKeyInput(true);
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setShowKeyInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    if (!apiKey) {
      setError('Por favor, ingresa tu API Key de Gemini primero.');
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await generateAnkiCard(word, apiKey); // Pasamos la apiKey aquí
      setData(result);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('API key not valid')) {
         setError('La API Key ingresada no es válida. Revisa la configuración.');
         setShowKeyInput(true);
      } else {
         setError(err.message || 'Ocurrió un error al generar la tarjeta. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A]/20">
      <header className="h-20 border-b border-[#1A1A1A]/10 flex items-center justify-between px-6 md:px-12 bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-bold">A</span>
          </div>
          <h1 className="text-xl font-bold tracking-tighter uppercase hidden md:block">L'Atelier Anki</h1>
        </div>
        <button 
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
        >
          <Key size={14} /> {apiKey ? 'API Key Configurada' : 'Configurar API'}
        </button>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="space-y-8">

          {/* Settings API Key Panel */}
          {showKeyInput && (
            <div className="p-6 md:p-8 bg-blue-50 border border-blue-100 rounded-[2rem] animate-slide-up shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-900 mb-4">Configuración de Gemini (Gratis)</h2>
              <p className="text-sm text-blue-800 mb-4 opacity-80">
                Para usar esta app sin coste de servidores, necesitas tu propia API Key de Google AI Studio (es gratis). Tu clave se guarda solo en tu navegador local.
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Pega tu API Key de Gemini aquí..."
                  className="flex-1 bg-white px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
                <button 
                  onClick={handleSaveKey}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  Guardar en mi navegador
                </button>
              </div>
            </div>
          )}
          
          <div className="p-8 md:p-12 bg-white/30 rounded-[2.5rem] border border-[#1A1A1A]/10 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-12">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] mb-4 opacity-40">
                  01. Palabra a traducir
                </label>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Éphémère, agricultura, apple..."
                  className="w-full bg-transparent border-b-2 border-[#1A1A1A] text-4xl md:text-5xl font-serif italic py-3 focus:outline-none placeholder:opacity-20 transition-all font-light"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !word.trim()}
                className="w-full bg-[#1A1A1A] text-white py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-sm mt-8 shadow-2xl transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Génération en cours...</>
                ) : (
                  'Generar Tarjeta'
                )}
              </button>
            </form>

            <div className="mt-6 p-6 bg-[#E8E4DE] rounded-2xl border border-[#1A1A1A]/5">
              <p className="text-xs leading-relaxed opacity-60 font-medium mb-4">
                La inteligencia artificial genera traducciones, pronunciación en IPA, y ejemplos naturales contextuales para facilitar tu proceso de creación de tarjetas Anki.
              </p>
              
              <div className="pt-4 border-t border-[#1A1A1A]/10">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3 opacity-60 text-orange-700">
                  ¿Cómo generar el Audio en Anki (AwesomeTTS)?
                </h3>
                <ol className="text-xs space-y-2 opacity-80 list-decimal pl-4 font-medium">
                  <li>En Anki ve a <strong>Tools &gt; Add-ons &gt; Get Add-ons...</strong></li>
                  <li>Pega el código <strong>1436550454</strong> (AwesomeTTS) y reinicia Anki.</li>
                  <li>Al añadir una carta (Add), pega el francés generado aquí en tu campo de origen.</li>
                  <li>Haz clic dentro de tu campo de "Audio", y pulsa el icono del altavoz (o <strong>Ctrl+T</strong>).</li>
                  <li>En <em>Service</em> pon "Google Translate", voz en Francés, abajo selecciona tu campo de Francés como <em>Source Field</em> y dale a <strong>Record</strong>.</li>
                </ol>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl text-sm font-medium animate-slide-up shadow-sm">
              {error}
            </div>
          )}

          {data && (
            <section className="bg-[#F9F7F2] p-6 md:p-12 rounded-[2.5rem] flex flex-col gap-8 animate-slide-up border border-[#1A1A1A]/5 shadow-inner">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-2">
                <h2 className="text-5xl md:text-6xl font-serif italic font-light tracking-tight text-[#1A1A1A] break-words">
                  {data.frances}
                </h2>
                <span className="text-sm opacity-40 font-mono mt-4 md:mt-0 tracking-wide">/{data.ipa}/</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CopyableField label="Francés" value={data.frances} />
                <CopyableField label="Español" value={data.espanol} />
                <CopyableField label="IPA" value={data.ipa} isSerif={false} />
                <CopyableField label="Inglés" value={data.ingles} />
                <CopyableField label="Ejemplo" value={data.ejemplo} isFullWidth={true} isItalic={true} />
                <CopyableField label="Aclaración" value={data.aclaracion} isFullWidth={true} isDark={true} isSerif={false} />
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
