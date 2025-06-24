import React from 'react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  return (
    <div className="quick-actions">
      <button onClick={() => onActionClick('resumir')}>
        Resumir
      </button>
      <button onClick={() => onActionClick('simplificar')}>
        Simplificar
      </button>
      <button onClick={() => onActionClick('extrair_dados')}>
        Extrair dados
      </button>
      <button onClick={() => onActionClick('reescrever')}>
        Reescrever
      </button>
    </div>
  );
};

export default QuickActions;
