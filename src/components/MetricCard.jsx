import React from 'react';

export default function MetricCard({ icon: Icon, label, value, tone = 'default' }) {
  const toneClasses = {
    default: 'bg-white border-gray-200',
    info: 'bg-blue-50 border-blue-100',
    success: 'bg-green-50 border-green-100',
    warning: 'bg-yellow-50 border-yellow-100',
    danger: 'bg-red-50 border-red-100'
  };

  return (
    <div className={`border rounded-xl p-4 flex flex-col gap-1 ${toneClasses[tone] || toneClasses.default}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-gray-600" />}
        <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}
