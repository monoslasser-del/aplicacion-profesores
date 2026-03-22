import React from 'react';
import { motion } from 'motion/react';
import { MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import type { Student } from '../StudentListScreen';

interface StudentCardProps {
  student: Student;
  onSelect: (student: Student) => void;
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'present') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (status === 'absent')  return <XCircle className="w-4 h-4 text-red-400" />;
  return <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-white text-[9px] font-bold">T</div>;
};

export function StudentCard({ student, onSelect }: StudentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(student)}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer transition-transform"
    >
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0 border border-blue-50">
        <span className="text-blue-700 font-black text-sm">
          {student.lastName.charAt(0)}{student.firstName.charAt(0)}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-gray-900 font-bold text-base truncate">{student.lastName}</h3>
        <p className="text-gray-500 text-sm truncate">{student.firstName}</p>
        {student.curp && <p className="text-gray-400 text-[10px] font-mono mt-0.5">{student.curp}</p>}
      </div>
      <div className="flex items-center gap-2">
        <StatusIcon status={student.status} />
        <button 
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 active:bg-gray-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(student);
          }}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
