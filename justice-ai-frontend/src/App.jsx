import { useState, useRef, useEffect } from 'react';
import { Send, Scale, Bot, User, Sparkles, Mic, FileText, Shield, Gavel, HelpCircle, Download } from 'lucide-react';
import { jsPDF } from "jspdf";

function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Greetings. I am Justice AI. I can assist you with Indian legal procedures, FIRs, and fundamental rights. How may I help you?", sender: 'bot' }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Quick Prompts Configuration
  const suggestions = [
    { icon: <FileText size={20}/>, title: "File an FIR", subtitle: "Steps to register a police complaint", prompt: "What is the procedure to file an FIR in India?" },
    { icon: <Shield size={20}/>, title: "Cyber Fraud", subtitle: "Reporting online scams & hacks", prompt: "I was scammed online. How do I report cyber fraud in India?" },
    { icon: <Gavel size={20}/>, title: "Tenant Rights", subtitle: "Eviction rules & rent disputes", prompt: "What are my rights as a tenant if my landlord tries to evict me?" },
    { icon: <HelpCircle size={20}/>, title: "RTI Application", subtitle: "How to request government info", prompt: "How do I file a Right to Information (RTI) application?" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- PDF Download Logic ---
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text("Justice AI - Legal Consultation", 15, 20);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 28);
    
    // Line
    doc.setDrawColor(200);
    doc.line(15, 32, 195, 32);

    // Content
    let y = 45;
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - (margin * 2);

    messages.forEach((msg) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      if (msg.sender === 'bot') {
        doc.setTextColor(44, 62, 80);
        doc.text("Justice AI:", margin, y);
      } else {
        doc.setTextColor(230, 126, 34);
        doc.text("You:", margin, y);
      }
      y += 7;

      // Message Text
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(msg.text, maxLineWidth);
      doc.text(lines, margin, y);
      y += (lines.length * 6) + 10;
    });

    // Save File
    doc.save("JusticeAI_Transcript.pdf");
  };

  // --- Voice Input Logic Only ---
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN'; 
      recognition.start();
      recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    } else {
      alert("Voice input is supported in Chrome/Edge/Safari.");
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    const userMessage = { id: Date.now(), text: text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, text: data.result, sender: 'bot' }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "⚠️ Server connection failed.", sender: 'bot', isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans text-slate-700">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900 text-slate-400 p-6 hidden md:flex flex-col border-r border-slate-800 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-8 text-white z-10">
          <Scale size={28} className="text-orange-500 drop-shadow-lg" />
          <h1 className="text-2xl font-bold tracking-tight">Justice AI</h1>
        </div>
        
        {/* Decorative Image */}
        <div className="flex-1 flex flex-col items-center justify-center opacity-80 mb-4">
            <img 
                src="../src/assets/justice.jpg" 
                alt="Justice AI" 
                className="w-full h-48 object-cover rounded-xl shadow-lg border border-slate-700 opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
            <p className="text-xs text-center mt-4 text-slate-500 italic">"Justice delayed is justice denied."</p>
        </div>

        <div className="mt-auto mb-6 z-10">
          <p className="text-sm leading-relaxed opacity-80">
            This AI provides legal information based on Indian Law (BNS, Constitution).
          </p>
          <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300">
            ⚠️ Not a substitute for a professional lawyer.
          </div>
        </div>

        <button 
          onClick={handleDownloadPDF} 
          disabled={messages.length <= 1}
          className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-10"
        >
          <Download size={18} /> Download Transcript
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative max-w-full bg-slate-50">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'bot' ? 'bg-white border border-slate-200 text-orange-500' : 'bg-slate-900 text-white'}`}>
                {msg.sender === 'bot' ? <Bot size={22} /> : <User size={22} />}
              </div>
              
              <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.sender === 'bot' 
                  ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' 
                  : 'bg-slate-900 text-white rounded-tr-none'
              } ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 max-w-[75%] animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-orange-500">
                <Bot size={22} />
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm italic mt-2">
                <Sparkles size={16} className="animate-spin text-orange-500" /> Analyzing Legal Context...
              </div>
            </div>
          )}

          {messages.length === 1 && !isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto pb-4 px-4 md:px-10">
              {suggestions.map((s, index) => (
                <button 
                  key={index} 
                  onClick={() => handleSend(s.prompt)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-orange-400 transition-all duration-200 text-left group"
                >
                  <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-1 group-hover:text-orange-500 transition-colors">
                    <span className="text-orange-500">{s.icon}</span> {s.title}
                  </h4>
                  <p className="text-sm text-slate-500 line-clamp-2">{s.subtitle}</p>
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-linear-to-t from-slate-100 via-slate-50 to-transparent flex justify-center">
          <div className="w-full max-w-3xl bg-white p-2 rounded-full shadow-xl border border-slate-200 flex items-center gap-2 focus-within:ring-2 focus-within:ring-orange-100 focus-within:border-orange-400 transition-all">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your rights..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none px-4 text-slate-800 placeholder:text-slate-400 text-base h-full"
            />
            
            <button 
              onClick={startListening} 
              disabled={isLoading} 
              className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-600 hover:scale-105 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
              title="Speak"
            >
              <Mic size={22} />
            </button>

            <button 
              onClick={() => handleSend()} 
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 rounded-full bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 hover:shadow-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;