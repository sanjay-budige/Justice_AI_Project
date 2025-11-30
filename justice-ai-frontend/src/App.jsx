import { useState, useRef, useEffect } from 'react';
import { Send, Scale, Bot, User, Sparkles, Mic, FileText, Shield, Gavel, HelpCircle, Download } from 'lucide-react';
import { jsPDF } from "jspdf"; // Import PDF Library
import './App.css';

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
    doc.setTextColor(44, 62, 80); // Dark Blue
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
      // Add page if running out of space
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      // Sender Label
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      if (msg.sender === 'bot') {
        doc.setTextColor(44, 62, 80); // Dark Blue for Bot
        doc.text("Justice AI:", margin, y);
      } else {
        doc.setTextColor(230, 126, 34); // Orange for User
        doc.text("You:", margin, y);
      }
      y += 7;

      // Message Text
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0); // Black text
      
      // Split long text into lines
      const lines = doc.splitTextToSize(msg.text, maxLineWidth);
      doc.text(lines, margin, y);
      
      // Calculate next Y position based on number of lines
      y += (lines.length * 6) + 10; // 6 is line height, 10 is padding between messages
    });

    // Save File
    doc.save("JusticeAI_Transcript.pdf");
  };

  // Voice Input Logic (Mic)
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
    <div className="app-container">
      <div className="sidebar">
        <div className="brand">
          <Scale size={28} className="brand-icon" />
          <h1>Justice AI</h1>
        </div>
        <div className="info-panel">
          <p>This AI provides legal information based on Indian Law.</p>
          <div className="disclaimer">
            <small>⚠️ Not a substitute for a professional lawyer.</small>
          </div>
        </div>

        {/* Download Button */}
        <button className="btn-download" onClick={handleDownloadPDF} disabled={messages.length <= 1}>
          <Download size={18} /> Download Transcript
        </button>
      </div>

      <div className="chat-interface">
        <div className="messages-area">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              <div className="avatar">
                {msg.sender === 'bot' ? <Bot size={22} /> : <User size={22} />}
              </div>
              <div className="message-content">
                <div className={`message-bubble ${msg.isError ? 'error' : ''}`}>
                  {msg.text}
                </div>
                {/* Removed Speaker Button logic here */}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message-wrapper bot">
              <div className="avatar"><Bot size={22} /></div>
              <div className="message-bubble loading">
                <Sparkles size={18} className="spin" /> Analyzing Legal Context...
              </div>
            </div>
          )}
          
          {messages.length === 1 && !isLoading && (
            <div className="suggestions-grid">
              {suggestions.map((s, index) => (
                <button key={index} className="suggestion-card" onClick={() => handleSend(s.prompt)}>
                  <h4><span style={{color: 'var(--accent)'}}>{s.icon}</span> {s.title}</h4>
                  <p>{s.subtitle}</p>
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-zone">
          <div className="input-container">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your rights..."
              disabled={isLoading}
            />
            <button className="btn-mic" onClick={startListening} disabled={isLoading} title="Speak">
              <Mic size={22} />
            </button>
            <button className="btn-send" onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
              <Send size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;