
import React from 'react';

interface RoomStatusCardProps {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export const RoomStatusCard: React.FC<RoomStatusCardProps> = ({
  status,
  count,
  percentage,
  color
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <div>
          <h3 className="font-medium text-gray-900">{status}</h3>
          <p className="text-sm text-gray-500">{percentage}% of total</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-gray-900">{count}</div>
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
