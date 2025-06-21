import React, { useState } from 'react';

interface QuestionFormProps {
  onSubmit: (question: string) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question);
    }
  };

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <textarea
        className="question-input"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Digite sua pergunta aqui..."
        rows={3}
      />
      <button type="submit" disabled={!question.trim()}>
        Enviar
      </button>
    </form>
  );
};

export default QuestionForm;
