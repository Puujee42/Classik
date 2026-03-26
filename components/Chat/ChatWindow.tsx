'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, History } from 'lucide-react';
import { Message } from '@/models/Message';
import Image from 'next/image';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { useUser } from '@/context/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import UserStatus from './UserStatus';
import UserHistorySidebar from './UserHistorySidebar';

interface User {
    _id: string;
    name?: string;
    email?: string;
    image?: string;
    userId: string;
    role?: string;
    isOnline?: boolean;
    isInCall?: boolean;
}

interface ChatWindowProps {
    otherUser: User;
    guestId?: string;
    onBack: () => void;
}

const fetcher = ([url, guestId]: [string, string | undefined]) =>
    fetch(url, {
        headers: guestId ? { 'x-guest-id': guestId } : {}
    }).then((res) => res.json());

export default function ChatWindow({ otherUser, guestId, onBack }: ChatWindowProps) {
    const { user } = useUser();
    const { t } = useTranslation();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sending, setSending] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const { data: messages, mutate } = useSWR<Message[]>(
        [`/api/messages?otherUserId=${otherUser._id || otherUser.userId}`, guestId],
        fetcher,
        { refreshInterval: 3000 } // Polling every 3 seconds
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(guestId ? { 'x-guest-id': guestId } : {})
                },
                body: JSON.stringify({
                    receiverId: otherUser.userId,
                    content: newMessage,
                    type: 'text',
                }),
            });
            setNewMessage('');
            mutate(); // Refresh messages immediately
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-800/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5" strokeWidth={1.2} />
                    </button>
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-700 ring-2 ring-white/5">
                        {otherUser.image ? (
                            <Image src={otherUser.image} alt={otherUser.name || ''} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium bg-slate-600">
                                {(otherUser.name || otherUser.email || '?')[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-white leading-tight">{otherUser.name || 'User'}</h3>
                        <UserStatus
                            isAdmin={otherUser.role === 'admin'}
                            isInCall={otherUser.isInCall}
                            isOnline={otherUser.isOnline}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-[#E06B8B] transition-colors border border-white/5"
                        title="View History"
                    >
                        <History className="w-5 h-5" strokeWidth={1.2} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Array.isArray(messages) && messages.map((msg) => {
                    const effectiveUserId = user?.id || guestId;
                    const isMe = msg.senderId === effectiveUserId;
                    const isInvite = msg.type === 'call_invite';
                    const isCall = msg.type === 'call_started' || msg.type === 'call_ended';

                    if (isCall) return null;

                    return (
                        <div key={msg._id?.toString()} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                ? 'bg-[#E06B8B] text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                                }`}>
                                {isInvite ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="font-bold">📞 Видео дуудлага хийх хүсэлт (Идэвхгүй)</p>
                                    </div>
                                ) : (
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                )}
                                <span className={`text-[10px] mt-1 block text-right ${isMe ? 'text-white/60' : 'text-slate-500'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-md">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={t('chat', 'typeMessage')}
                        className="flex-1 bg-slate-800 border-none rounded-2xl px-4 py-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-[#E06B8B]/50 text-sm outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="p-3 bg-[#E06B8B] hover:bg-[#E64500] text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E06B8B]/20 active:scale-95"
                    >
                        <Send className="w-5 h-5" strokeWidth={1.2} />
                    </button>
                </div>
            </form>

            <UserHistorySidebar
                user={{ userId: otherUser.userId, name: otherUser.name }}
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />
        </div>
    );
}
