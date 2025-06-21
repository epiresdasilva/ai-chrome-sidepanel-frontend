import React from 'react';
import { Language } from '../../shared/types';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  selectedLanguage, 
  onLanguageChange 
}) => {
  return (
    <div className="language-selector">
      <label htmlFor="language-select">Idioma: </label>
      <select 
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value as Language)}
      >
        <option value="pt-BR">Português (Brasil)</option>
        <option value="pt-PT">Português (Portugal)</option>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
