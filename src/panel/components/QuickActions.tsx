import React from 'react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  return (
    <div className="quick-actions">
      <button onClick={() => onActionClick('summarize')}>
        Resumir
      </button>
      <button onClick={() => onActionClick('simplify')}>
        Simplificar
      </button>
      <button onClick={() => onActionClick('extract')}>
        Extrair dados
      </button>
      <button onClick={() => onActionClick('rewrite')}>
        Reescrever
      </button>
    </div>
  );
};

export default QuickActions;
