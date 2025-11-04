/**
 * Stats Card Component
 * 
 * Carte de statistiques pour le dashboard admin
 * 
 * @version 1.0
 * @date 2025-11-05 00:45
 */

import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-green-100 text-green-600',
  warning: 'bg-yellow-100 text-yellow-600',
  danger: 'bg-red-100 text-red-600',
};

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  color = 'primary',
}: StatsCardProps) {
  return (
    <Card variant="bordered" hoverable>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardDescription className="mb-1">{title}</CardDescription>
            <CardTitle className="text-3xl font-bold">{value}</CardTitle>
            {description && (
              <p className="text-sm text-gray-600 mt-2">{description}</p>
            )}
          </div>
          {icon && (
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      {trend && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span className="text-sm text-gray-500">vs mois dernier</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

