'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './GlobalChatBubble.css';

export default function GlobalChatBubble() {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([
    { type: 'incoming', text: "Bonjour ! Besoin d'une information sur un bateau en location ou en vente? N'hésitez pas à nous contacter", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const [hasAdminReply, setHasAdminReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing support conversation
    fetch('/api/conversations/support')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        if (data?.conversation) {
          setConvId(data.conversation.id);
          if (data.conversation.messages?.length > 0) {
            const msgs = data.conversation.messages;
            const adminReplied = msgs.some((m: any) => m.sender.role === 'ADMIN');
            setHasAdminReply(adminReplied);
            
            if (!adminReplied) {
              const formatted = msgs.map((m: any) => ({
                type: m.sender.role === 'ADMIN' ? 'incoming' : 'outgoing',
                text: m.content,
                time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }));
              setChatMsgs([
                { type: 'incoming', text: "Bonjour ! Besoin d'une information sur un bateau en location ou en vente? N'hésitez pas à nous contacter", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                ...formatted
              ]);
            }
          }
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && isChatOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMsgs, isChatOpen]);

  const toggleChat = () => {
    if (!isChatOpen && hasAdminReply && convId) {
      // Rediriger vers l'espace de messagerie si l'admin a répondu
      router.push(`/dashboard?tab=messages&convId=${convId}`);
      return;
    }
    setIsChatOpen(!isChatOpen);
  };

  const sendChatMsg = async () => {
    if (!chatInput.trim() || isSending) return;
    
    setIsSending(true);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = chatInput;
    
    setChatMsgs(prev => [...prev, { type: 'outgoing', text: userMsg, time }]);
    setChatInput('');

    try {
      // Create or get support conversation
      const convRes = await fetch('/api/conversations/support', { method: 'POST' });
      if (convRes.status === 401) {
        // Rediriger vers la page de connexion
        router.push('/auth');
        return;
      }
      
      const convData = await convRes.json();
      if (!convData.conversation) {
         setChatMsgs(prev => [...prev, { type: 'incoming', text: "Une erreur est survenue.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
         return;
      }

      const conversationId = convData.conversation.id;
      setConvId(conversationId);

      // Send the message
      const msgRes = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content: userMsg })
      });

      if (msgRes.ok) {
        // Auto-reply for first contact in the bubble
        setTimeout(() => {
          setChatMsgs(prev => [...prev, { type: 'incoming', text: "Merci de nous avoir contactés. Un conseiller vous répondra très rapidement.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        }, 1500);
      } else {
        setChatMsgs(prev => [...prev, { type: 'incoming', text: "Erreur d'envoi.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }
    } catch (err) {
      console.error(err);
      setChatMsgs(prev => [...prev, { type: 'incoming', text: "Erreur réseau.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="global-chat-bubble">
      <button className="chat-toggle" onClick={toggleChat}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
        </svg>
        {!isChatOpen && hasAdminReply && <span className="chat-badge-dot">1</span>}
        {!isChatOpen && !hasAdminReply && chatMsgs.length === 1 && <span className="chat-badge-dot">1</span>}
      </button>
      
      <div className={`chat-window ${isChatOpen ? 'open' : ''}`}>
        <div className="chat-head">
          <div className="chat-head-avatar">VY</div>
          <div className="chat-head-info">
            <div className="chat-head-name">VOYYACHT</div>
            <div className="chat-head-status">En ligne</div>
          </div>
          <button className="chat-head-close" onClick={() => setIsChatOpen(false)}>×</button>
        </div>
        <div className="chat-messages">
          {chatMsgs.map((m, i) => (
            <div key={i} className={`chat-msg ${m.type}`}>
              {m.text}
              <span className="chat-msg-time">{m.time}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-row">
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Votre message..." 
            value={chatInput} 
            onChange={e => setChatInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && sendChatMsg()} 
            disabled={isSending}
          />
          <button className="chat-send" onClick={sendChatMsg} disabled={isSending}>
             {isSending ? '...' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  );
}
