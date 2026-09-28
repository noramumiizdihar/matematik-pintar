import React from 'react';
import { Language } from '../../types/curriculum';
import { CuteNumberBoard } from '../board/CuteNumberBoard';

interface NumberGrid100Props {
  language: Language;
  initialSelected?: number;
}

/**
 * Revamped NumberGrid100 - now powered by the playful, cheerful CuteNumberBoard
 * Designed for young children with pastel cards, bilingual pronunciation, and mascot interaction.
 */
export const NumberGrid100: React.FC<NumberGrid100Props> = ({
  language,
  initialSelected
}) => {
  return <CuteNumberBoard language={language} initialSelected={initialSelected} />;
};
