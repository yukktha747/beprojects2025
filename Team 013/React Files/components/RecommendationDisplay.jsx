import React from 'react';
import { AlertCircle, Activity, Heart, Calendar, Lightbulb } from 'lucide-react';

const RecommendationDisplay = ({ recommendations, healthMetrics }) => {
  const iconMap = {
    urgent_actions: <AlertCircle className="w-4 h-4" />,
    specific: <Activity className="w-4 h-4" />,
    lifestyle: <Heart className="w-4 h-4" />,
    monitoring: <Calendar className="w-4 h-4" />
  };

  const getMetricsAlert = (metrics) => {
    if (!metrics) return null;

    return (
      <div className="mb-4 bg-blue-900 border-blue-800 p-4 rounded-lg">
        <h2 className="text-blue-300 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Health Metrics Summary
        </h2>
        <div className="mt-2 space-y-2 text-blue-200">
          {metrics.bmi && (
            <p>BMI: {metrics.bmi} ({metrics.bmi_category})</p>
          )}
          {metrics.blood_pressure_category && (
            <p>Blood Pressure Category: {metrics.blood_pressure_category}</p>
          )}
          {metrics.lifestyle_factors && (
            <div>
              <p>Lifestyle Factors:</p>
              <ul className="list-disc list-inside pl-4">
                {metrics.lifestyle_factors.smoking && <li>Currently smoking</li>}
                {metrics.lifestyle_factors.alcohol && <li>Regular alcohol consumption</li>}
                {metrics.lifestyle_factors.physical_activity && <li>Physically active</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {healthMetrics && getMetricsAlert(healthMetrics)}

      {Object.entries(recommendations).map(([category, items]) => {
        if (!items || items.length === 0) return null;

        const categoryTitle = category.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return (
          <div
            key={category}
            className={`
              ${category === 'urgent_actions' ? 'bg-red-900 border-red-800' :
                category === 'specific' ? 'bg-purple-900 border-purple-800' :
                category === 'lifestyle' ? 'bg-green-900 border-green-800' :
                'bg-orange-900 border-orange-800'}
              p-4 rounded-lg
            `}
          >
            <h2 className={`
              ${category === 'urgent_actions' ? 'text-red-300' :
                category === 'specific' ? 'text-purple-300' :
                category === 'lifestyle' ? 'text-green-300' :
                'text-orange-300'}
              flex items-center gap-2
            `}>
              {iconMap[category]}
              {categoryTitle}
            </h2>
            <div className="mt-2 space-y-1">
              <ul className="list-disc list-inside pl-4">
                {items.map((item, index) => (
                  <li key={index} className="text-gray-200">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecommendationDisplay;
