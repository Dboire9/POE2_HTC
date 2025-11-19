/**
 * Error Banner Component
 * Displays actionable error messages with suggestions
 */

import { AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { CraftingError } from '../types/errors';

interface ErrorBannerProps {
  error: CraftingError;
  onDismiss?: () => void;
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  const getErrorColor = (type: string): string => {
    switch (type) {
      case 'HEAP_SPACE_ERROR':
      case 'TIMEOUT_ERROR':
        return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'VALIDATION_ERROR':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'NETWORK_ERROR':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const getErrorIcon = () => {
    return <AlertCircle className="h-5 w-5 flex-shrink-0" />;
  };

  return (
    <div
      className={`rounded-lg border-2 p-4 ${getErrorColor(error.type)}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getErrorIcon()}</div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-sm">{error.type.replace(/_/g, ' ')}</h3>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </div>

          {error.suggestions && error.suggestions.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Suggestions:
              </p>
              <ul className="space-y-1 text-sm">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!error.recoverable && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              ⚠️ This error is not recoverable. Please restart the application.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
