import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from './tooltip';

interface HelpIconProps {
  content: string;
  className?: string;
}

export const HelpIcon: React.FC<HelpIconProps> = ({ content, className = '' }) => {
  return (
    <Tooltip content={content}>
      <HelpCircle 
        className={`inline-block cursor-help text-muted-foreground hover:text-foreground transition-colors ${className}`}
        size={16}
      />
    </Tooltip>
  );
};
