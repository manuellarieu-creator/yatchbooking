'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function AdminMessagesClient() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/conversations')
      .then(res => res.json())
      .then(data => {
        if (data.conversations) {
          setConversations(data.conversations);
        }
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const selectConversation = async (conv: any) => {
    setSelectedConv(conv);
    setMessages([]);
    try {
      const res = await fetch(`/api/messages?conversationId=${conv.id}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedConv) return;
    
    setSending(true);
    try {
      const payload = {
        conversationId: selectedConv.id,
        content: replyContent,
        displayAsUserId: selectedConv.advertiser?.id
      };

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (data.message) {
        setMessages([...messages, data.message]);
        setReplyContent('');
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  return (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Messagerie Centralisée</h1>
          <p className="admin-subtitle">Gérez les échanges entre les clients et les annonceurs (profils gérés ou non).</p>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '1rem', overflow: 'hidden', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        {/* SIDEBAR CONVERSATIONS */}
        <div style={{ width: '350px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <input type="text" placeholder="Rechercher..." style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Chargement...</div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Aucune conversation.</div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.id} 
                  onClick={() => selectConversation(conv)}
                  style={{ 
                    padding: '1rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                    background: selectedConv?.id === conv.id ? '#f1f5f9' : '#fff',
                    borderLeft: selectedConv?.id === conv.id ? '3px solid #0f172a' : '3px solid transparent'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                    {conv.client?.firstName} {conv.client?.lastName} ↔ {conv.advertiser?.firstName} {conv.advertiser?.lastName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Yacht : {conv.listingTitle}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.lastMessage?.content || 'Nouvelle conversation'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CHAT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          {selectedConv ? (
            <>
              {/* HEADER */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Yacht : {selectedConv.listingTitle}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Client : {selectedConv.client?.firstName} {selectedConv.client?.lastName} | 
                    Propriétaire : {selectedConv.advertiser?.firstName} {selectedConv.advertiser?.lastName} {selectedConv.advertiser?.isManagedByAdmin ? '(Profil Géré)' : ''}
                  </div>
                </div>
              </div>

              {/* MESSAGES */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>Aucun message pour l'instant.</div>
                ) : (
                  messages.map(msg => {
                    const isClient = msg.sender?.role === 'CLIENT';
                    const isSystemOrAdmin = msg.isAdminReply || msg.sender?.role === 'ADMIN';
                    
                    let senderName = msg.sender?.firstName;
                    if (isSystemOrAdmin && selectedConv.advertiser) {
                      senderName = `${selectedConv.advertiser.firstName} (Admin)`;
                    }

                    return (
                      <div key={msg.id} style={{ alignSelf: isClient ? 'flex-start' : 'flex-end', maxWidth: '70%' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem', textAlign: isClient ? 'left' : 'right' }}>
                          {senderName} • {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div style={{ 
                          padding: '0.75rem 1rem', 
                          borderRadius: '8px',
                          background: isClient ? '#fff' : '#0f172a',
                          color: isClient ? '#334155' : '#fff',
                          border: isClient ? '1px solid #e2e8f0' : 'none',
                          borderBottomLeftRadius: isClient ? '0' : '8px',
                          borderBottomRightRadius: isClient ? '8px' : '0'
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <div style={{ padding: '1rem', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#b45309', background: '#fef3c7', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
                  ℹ️ En envoyant un message, vous répondrez au nom de : <strong>{selectedConv.advertiser?.firstName} {selectedConv.advertiser?.lastName}</strong>
                </div>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Tapez votre réponse pour le client..." 
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <button 
                    type="submit" 
                    disabled={sending || !replyContent.trim()}
                    style={{ background: '#000', color: '#fff', border: 'none', padding: '0 1.5rem', borderRadius: '6px', cursor: (sending || !replyContent.trim()) ? 'not-allowed' : 'pointer', fontWeight: 500 }}
                  >
                    Envoyer
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Sélectionnez une conversation pour commencer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
