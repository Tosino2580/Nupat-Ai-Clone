import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Sparkles, MessageCircle, Image, Lock, Zap } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    category: 'Getting Started',
    icon: <Sparkles size={16} className="text-violet-400" />,
    items: [
      {
        q: 'What is Lumina?',
        a: 'Lumina is an intelligent AI assistant powered by advanced language models. It can help you write, think, create, plan, answer questions, and generate images — all in one place.',
      },
      {
        q: 'Do I need an account to use Lumina?',
        a: 'Yes, you need a free account to start chatting. Sign up with just your email and password — no credit card required.',
      },
      {
        q: 'Is Lumina free to use?',
        a: 'Yes! Lumina is completely free. Create an account and start chatting immediately with no limits.',
      },
    ],
  },
  {
    category: 'Chatting with Lumina',
    icon: <MessageCircle size={16} className="text-violet-400" />,
    items: [
      {
        q: 'How do I start a new conversation?',
        a: 'Click the "New Chat" button in the sidebar (or tap the menu icon on mobile). Each chat is saved automatically so you can come back to it anytime.',
      },
      {
        q: 'Can Lumina remember previous conversations?',
        a: 'Yes — within a single chat, Lumina remembers the full conversation history so you can have continuous, context-aware conversations.',
      },
      {
        q: 'How do I delete a chat?',
        a: 'Hover over a chat in the sidebar and click the delete icon that appears. This will permanently remove the chat and all its messages.',
      },
    ],
  },
  {
    category: 'Image Generation',
    icon: <Image size={16} className="text-violet-400" />,
    items: [
      {
        q: 'Can Lumina generate images?',
        a: 'Yes! Just ask Lumina to create, draw, or generate an image in your message — for example "Generate a sunset over the ocean" or "Draw a futuristic city". The image will appear directly in the chat.',
      },
      {
        q: 'How do I save a generated image?',
        a: 'After the image loads, a "Save" button appears below it. Click it to download the image to your device.',
      },
    ],
  },
  {
    category: 'Privacy & Security',
    icon: <Lock size={16} className="text-violet-400" />,
    items: [
      {
        q: 'Is my data safe?',
        a: 'Yes. Your password is securely hashed and never stored in plain text. Your chats are stored securely and are only accessible to you.',
      },
      {
        q: 'How do I log out?',
        a: 'Click your avatar icon at the top right → then tap "Log out". On mobile, go to My Account page and tap the Log out button at the bottom.',
      },
    ],
  },
  {
    category: 'Performance',
    icon: <Zap size={16} className="text-violet-400" />,
    items: [
      {
        q: 'Why is the AI response slow sometimes?',
        a: 'Response speed depends on the complexity of your message and server load. Most responses arrive within a few seconds. Image generation can take a bit longer as it uses an external service.',
      },
      {
        q: 'What should I do if the AI gives a wrong answer?',
        a: 'AI can make mistakes. Always verify important information from trusted sources. You can follow up in the same chat to correct or refine the answer.',
      },
    ],
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-800/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left text-gray-200 text-sm font-medium hover:bg-gray-800/40 transition"
      >
        <span>{q}</span>
        {open ? <ChevronUp size={15} className="text-violet-400 flex-shrink-0 ml-3" /> : <ChevronDown size={15} className="text-gray-500 flex-shrink-0 ml-3" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-gray-400 text-sm leading-relaxed border-t border-gray-800/60 bg-gray-900/30">
          {a}
        </div>
      )}
    </div>
  );
};

const HelpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#05040a', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800/60 sticky top-0 z-10" style={{ background: '#05040a' }}>
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-gray-800/60 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-white font-semibold text-lg">Help & FAQ</h1>
          <p className="text-gray-500 text-xs">Answers to common questions</p>
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center py-8 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-600/30 flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-violet-400" />
        </div>
        <h2 className="text-white font-bold text-xl mb-1">How can we help?</h2>
        <p className="text-gray-400 text-sm max-w-xs">Everything you need to know about using Lumina AI.</p>
      </div>

      {/* FAQ sections */}
      <div className="flex flex-col gap-6 px-4 pb-10">
        {faqs.map((section) => (
          <div key={section.category}>
            <div className="flex items-center gap-2 mb-3">
              {section.icon}
              <p className="text-white font-semibold text-sm">{section.category}</p>
            </div>
            <div className="flex flex-col gap-2">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpPage;
