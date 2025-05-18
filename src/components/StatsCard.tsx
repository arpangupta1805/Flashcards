import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
  change?: {
    value: number;
    label: string;
  };
}

export const StatsCard = ({ title, value, icon, color = 'blue', change }: StatsCardProps) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'green':
        return 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'red':
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'purple':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'yellow':
        return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getChangeColorClasses = () => {
    if (!change) return '';
    
    return change.value >= 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center">
          {icon && (
            <div className={`p-3 rounded-lg ${getColorClasses()}`}>
              <span className="text-xl">{icon}</span>
            </div>
          )}
          <div className={icon ? 'ml-4' : ''}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
              
              {change && (
                <p className={`ml-2 text-sm font-medium ${getChangeColorClasses()}`}>
                  {change.value > 0 ? '+' : ''}{change.value} {change.label}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 