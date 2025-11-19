/**
 * ErrorDisplay Component - User-friendly error display with type-specific styling
 */

import { AlertCircle, XCircle, WifiOff, Clock, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CraftingError } from '../types/errors';
import type { ErrorType } from '../types/api';

interface ErrorDisplayProps {
  /** Error to display */
  error: CraftingError;
  /** Callback when error is dismissed */
  onDismiss: () => void;
}

/**
 * Maps error types to visual styling and icons
 */
const ERROR_STYLES: Record<
  ErrorType,
  {
    icon: typeof AlertCircle;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
  }
> = {
  HEAP_SPACE_ERROR: {
    icon: AlertCircle,
    bgColor: 'bg-red-950/50 dark:bg-red-950/30',
    borderColor: 'border-red-800 dark:border-red-700',
    iconColor: 'text-red-500',
    titleColor: 'text-red-200',
  },
  TIMEOUT_ERROR: {
    icon: Clock,
    bgColor: 'bg-orange-950/50 dark:bg-orange-950/30',
    borderColor: 'border-orange-800 dark:border-orange-700',
    iconColor: 'text-orange-500',
    titleColor: 'text-orange-200',
  },
  NETWORK_ERROR: {
    icon: WifiOff,
    bgColor: 'bg-blue-950/50 dark:bg-blue-950/30',
    borderColor: 'border-blue-800 dark:border-blue-700',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-200',
  },
  VALIDATION_ERROR: {
    icon: XCircle,
    bgColor: 'bg-yellow-950/50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-800 dark:border-yellow-700',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-200',
  },
  UNKNOWN_ERROR: {
    icon: AlertCircle,
    bgColor: 'bg-gray-950/50 dark:bg-gray-950/30',
    borderColor: 'border-gray-800 dark:border-gray-700',
    iconColor: 'text-gray-500',
    titleColor: 'text-gray-200',
  },
};

/**
 * User-friendly error display component with:
 * - Type-specific icons and colors
 * - Clear error messages
 * - Actionable suggestions
 * - Dismiss functionality
 * - Accessibility (ARIA labels, keyboard support)
 * - Dark mode support
 */
export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  const style = ERROR_STYLES[error.type];
  const Icon = style.icon;

  return (
    <Card
      className={`${style.bgColor} ${style.borderColor} border-2 animate-in slide-in-from-top-2 duration-300`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon
              className={`h-6 w-6 ${style.iconColor}`}
              aria-hidden="true"
            />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Title */}
            <div className="flex items-start justify-between gap-4">
              <h3 className={`font-semibold text-lg ${style.titleColor}`}>
                {getErrorTitle(error.type)}
              </h3>
              
              {/* Dismiss button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 hover:bg-white/10"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Error message */}
            <p className="text-sm text-foreground/90">
              {error.message}
            </p>

            {/* Suggestions */}
            {error.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground/80">
                  Suggestions:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground/70">
                  {error.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recoverable status */}
            {!error.recoverable && (
              <div className="pt-2 border-t border-current/20">
                <p className="text-xs text-foreground/60">
                  ⚠️ This error may require application restart
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Returns user-friendly title for error type
 */
function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case 'HEAP_SPACE_ERROR':
      return 'Memory Limit Exceeded';
    case 'TIMEOUT_ERROR':
      return 'Calculation Timeout';
    case 'NETWORK_ERROR':
      return 'Connection Error';
    case 'VALIDATION_ERROR':
      return 'Invalid Configuration';
    case 'UNKNOWN_ERROR':
      return 'Unexpected Error';
    default:
      return 'Error';
  }
}
