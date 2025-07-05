import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './styling/Support.css';

function Support() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const genAI = new GoogleGenerativeAI('AIzaSyA-N32yR44YV5Fj1rezq7dZVJqXCxDy6Is');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const chat = model.startChat({
        history: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: msg.text,
        })),
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const botMessage = response.text();

      setMessages(prev => [...prev, { text: botMessage, sender: 'bot' }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting. Please try again later.", 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="support-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" className="send-button" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default Support;