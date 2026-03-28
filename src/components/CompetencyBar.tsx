import { getScoreColor, getScoreLabel, getScoreBgColor } from '@/lib/utils';

interface CompetencyBarProps {
  name: string;
  score: number;
  suggestion?: string;
}

export default function CompetencyBar({ name, score, suggestion }: CompetencyBarProps) {
  const percentage = (score / 5) * 100;

  return (
    <div className={`p-4 rounded-lg ${getScoreBgColor(score)}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-800">{name}</span>
        <span className={`font-bold ${getScoreColor(score)}`}>
          {score.toFixed(2)}/5 ({getScoreLabel(score)})
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {suggestion && (
        <p className="text-sm text-gray-600 mt-2">{suggestion}</p>
      )}
    </div>
  );
}
