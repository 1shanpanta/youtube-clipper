import React from 'react';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { AppStatus } from '../../types';

interface StatusDisplayProps {
  status: AppStatus;
  className?: string;
}

const statusIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const statusColors = {
  info: 'text-white/70',
  success: 'text-green-300',
  warning: 'text-amber-300',
  error: 'text-red-300',
};

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, className = "" }) => {
  const Icon = statusIcons[status.type];

  return (
    <div className={`rounded-xl bg-black/20 ring-1 ring-white/10 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_6px_20px_rgba(0,0,0,0.35)] ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-4 w-4 mt-0.5 ${statusColors[status.type]}`} title="Status" />
        <p className="text-sm text-white/80">{status.message}</p>
      </div>
    </div>
  );
};