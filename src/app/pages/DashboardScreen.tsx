import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CapacitorNfc } from '@capgo/capacitor-nfc';
import { 
  Filter, 
  ChevronRight, 
  User, 
  Menu, 
  Calendar, 
  Users, 
  FileText, 
  Download, 
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  TrendingUp,
  FileSpreadsheet,
  Smartphone,
  Search,
  Settings,
  Bell,
  ClipboardList,
  Printer
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../storage/db';
import { studentService } from '../../services/studentService';
import { pdfGenerator } from '../../lib/pdfGenerator';
import { hardwareServices } from '../../utils/hardwareServices';

export function DashboardScreen() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Obtener perfil del docente real
  const userProfiles = useLiveQuery(() => db.userProfile.toArray()) || [];
  const activeUser = userProfiles.length > 0 ? userProfiles[userProfiles.length - 1] : { name: 'Docente', grade: '3° A', role: 'Educador' };
  
  const [group, setGroup] = useState(activeUser.grade || '3° A');

  const handleNfcScan = async () => {
    try {
      // Usamos el servicio de base que creamos antes para inicializar el escaneo
      await hardwareServices.initNfcListener(
        async (tagData) => {
          // Éxito en lectura: Vibrar, registrar log interno y notificar al profe
          await hardwareServices.vibrateSuccess();
          const uid = tagData.id ? Array.from(tagData.id).map((i: any) => i.toString(16).padStart(2, '0')).join(':') : 'unknown-uid';
          
          await hardwareServices.saveLocalLog(`NFC Attendance Scan: ${uid}`);
          
          alert(`¡Asistencia tomada!\n\nUID de Tarjeta: ${uid}`);
        },
        async (error) => {
          // Error en lectura: Vibración distinta de fallo
          await hardwareServices.vibrateError();
          await hardwareServices.saveLocalLog(`NFC Error: ${JSON.stringify(error)}`);
          alert("Error leyendo tarjeta: " + JSON.stringify(error));
        }
      );
      
      alert("Por favor, acerca la tarjeta NFC del alumno al teléfono.");
    } catch (error) {
      await hardwareServices.vibrateError();
      await hardwareServices.saveLocalLog(`NFC Init Error: ${JSON.stringify(error)}`);
      alert("Error iniciando la antena NFC de tu dispositivo.");
    }
  };

  const handleExport = (period: 'Semanal' | 'Mensual' | 'Trimestral') => {
    // Definimos el rango de fechas dinámicamente según el periodo (simulado para este ejemplo)
    const end = new Date();
    const start = new Date();
    
    if (period === 'Semanal') start.setDate(end.getDate() - 7);
    if (period === 'Mensual') start.setMonth(end.getMonth() - 1);
    if (period === 'Trimestral') start.setMonth(end.getMonth() - 3);

    pdfGenerator.generateActivityReport({
      title: 'Reporte de Productividad y Asistencia NEM',
      period: period,
      dateStart: start.toLocaleDateString(),
      dateEnd: end.toLocaleDateString(),
      students: recentStudentsDb // Usamos la data real de la base de datos
    });
    
    setShowExportModal(false);
  };

  // Obtener lista real de estudiantes desde la base de datos local usando Dexie hook
  const recentStudentsDb = useLiveQuery(() => studentService.getAllStudents()) || [];
  
  // Mapear los datos de la DB al formato esperado por la UI (simulando estado de asistencia por ahora)
  const recentStudents = recentStudentsDb.map((student, index) => ({
    id: student.id.toString(),
    name: student.name,
    studentId: student.curp || '12845678', // Un ID de ejemplo si no hay CURP
    time: index % 2 === 0 ? '09:10 AM' : '',
    present: index % 2 === 0
  }));

  // Update stats dynamically based on DB size
  const totalStudents = recentStudentsDb.length;
  const attendanceStats = {
    present: recentStudents.filter(s => s.present).length,
    total: totalStudents > 0 ? totalStudents : 30, // Fallback si está vacío
    percentage: totalStudents > 0 ? (recentStudents.filter(s => s.present).length / totalStudents) * 100 : 40
  };

  const gradeStats = {
    average: 8.7,
    trimester: 2,
    subjects: [
      { name: 'Lenguajes', average: 8.6, color: 'bg-orange-500' },
      { name: 'Saberes', average: 8.8, color: 'bg-blue-500' },
      { name: 'Ética', average: 8.7, color: 'bg-purple-500' },
      { name: 'Comunitario', average: 8.9, color: 'bg-green-500' }
    ]
  };

  return (
    <div className="flex flex-col flex-1 w-full min-h-0 bg-slate-50 overflow-hidden relative">
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Top Header - EDUCATIONAL & DISTINCTIVE DESIGN */}
      <div className="bg-blue-600 rounded-b-[2rem] px-5 pt-5 pb-6 shadow-xl shrink-0 relative overflow-hidden z-20">
        {/* Background textures */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>

        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform backdrop-blur-sm border border-white/20"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-inner flex items-center justify-center border-2 border-white/20">
                <span className="text-white font-black text-lg">{activeUser.name.charAt(0)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 px-3 rounded-xl bg-white/10 flex items-center gap-1.5 backdrop-blur-sm border border-white/20">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-white font-bold text-sm">Pro</span>
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center relative backdrop-blur-sm border border-white/20">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold border border-blue-600">2</span>
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="flex flex-col justify-end relative z-10 mb-2">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-white text-3xl font-black mb-1 leading-tight"
          >
            Hola, <br/>{activeUser.name.split(' ')[0]} 👋
          </motion.h2>
          <p className="text-blue-100 font-medium text-sm">Tu aula virtual está lista para hoy.</p>
        </div>

        {/* Group Selector Toggle */}
        <div className="relative mt-4 z-10">
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-base font-bold rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none shadow-sm"
          >
            <option className="text-slate-800" value={activeUser.grade}>{activeUser.grade} (Tu grupo)</option>
            <option className="text-slate-800" value="1° A">1° A</option>
            <option className="text-slate-800" value="2° A">2° A</option>
            <option className="text-slate-800" value="3° B">3° B</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
               <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Side Menu Overlay */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/30 z-40"
          onClick={() => setShowMenu(false)}
        >
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-72 h-full bg-white shadow-2xl"
          >
            {/* User Profile in Sidebar */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-inner flex items-center justify-center border-2 border-white/20">
                   <span className="text-white font-black text-2xl">{activeUser.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{activeUser.name}</h3>
                  <p className="text-white/80 text-sm">{activeUser.grade} · {activeUser.role}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-4">
              <button 
                onClick={() => {
                  setShowMenu(false);
                  navigate('/calendar');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
              >
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 font-medium">Calendario</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-green-500"></span>
              </button>
              <button 
                onClick={() => {
                  setShowMenu(false);
                  navigate('/students');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
              >
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Lista del Grupo</span>
                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Ver Reportes</span>
                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left">
                <Download className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Exportar PDF</span>
                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors text-left">
                <Send className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Enviar Notificación</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-24 z-10 space-y-5">
        
        {/* Quick NFC Primary Action (Moved up for priority) */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
        >
          <button 
            onClick={handleNfcScan}
            className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-400 to-teal-500 rounded-[2rem] p-6 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all group"
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="text-left">
                <h3 className="text-white font-black text-xl mb-1">Pase de Lista NFC</h3>
                <p className="text-emerald-50 font-medium text-sm flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Acerca la credencial
                </p>
              </div>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                <ChevronRight className="w-8 h-8 text-white" />
              </div>
            </div>
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Attendance Card - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-slate-100 rounded-[2rem] p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-40"
          >
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10"></div>
             <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                 <Users className="w-5 h-5 text-blue-600" />
               </div>
               <span className="text-blue-600 text-xs font-bold uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-lg">Hoy</span>
             </div>
             <div>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-slate-900 text-4xl font-black leading-none">{attendanceStats.present}</span>
                  <span className="text-slate-400 text-sm font-bold mb-1">/ {attendanceStats.total}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Asistencia grupal</p>
             </div>
          </motion.div>

          {/* Grades Card - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white border-2 border-slate-100 rounded-[2rem] p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-40"
          >
             <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-10"></div>
             <div className="flex items-center justify-between mb-4">
               <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                 <TrendingUp className="w-5 h-5 text-orange-600" />
               </div>
               <span className="text-orange-600 text-xs font-bold uppercase tracking-wider bg-orange-50 px-2 py-1 rounded-lg">Trim {gradeStats.trimester}</span>
             </div>
             <div>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-slate-900 text-4xl font-black leading-none">{gradeStats.average}</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">Promedio NEM</p>
             </div>
          </motion.div>
        </div>

        {/* Import Students Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900 rounded-[2rem] p-1 flex items-center shadow-lg"
        >
          <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center ml-1">
            <FileSpreadsheet className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex-1 px-4 text-left">
            <h3 className="text-white font-bold text-sm">Lista de Excel</h3>
            <p className="text-slate-400 text-xs">Importar alumnos rápidamente</p>
          </div>
          <button 
             onClick={() => navigate('/import-students')}
             className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-3 rounded-[1.3rem] mr-2 active:scale-95 transition-transform shadow-sm"
          >
            IMPORTAR
          </button>
        </motion.div>

        {/* Attendance Register */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold text-lg">Asistencia Reciente</h3>
            <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800">
               <span className="font-bold pb-1.5">...</span>
            </button>
          </div>
          
          <div className="bg-blue-50 rounded-2xl px-4 py-2 mb-4 flex items-center justify-between">
            <span className="text-blue-600 font-bold text-lg">
              {attendanceStats.present} / {attendanceStats.total}
            </span>
            <span className="text-blue-600 text-sm font-medium">Asistieron</span>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar alumno..."
              className="w-full bg-slate-50 border-0 rounded-[1.2rem] pl-12 pr-4 py-3.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Student List */}
          <div className="space-y-3">
            {recentStudents.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-sm font-medium">No hay alumnos registrados.</div>
            )}
            {recentStudents.slice(0, 3).map((student, i) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                onClick={() => navigate(`/student/${student.id}`)}
                className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 cursor-pointer active:scale-98 transition-all border border-transparent hover:border-slate-100"
              >
                <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-sm ${
                  student.present ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-slate-100'
                }`}>
                  <User className={`w-6 h-6 ${student.present ? 'text-white' : 'text-slate-400'}`} />
                </div>
                
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-slate-800 font-bold text-sm truncate leading-none">{student.name}</h4>
                  </div>
                  <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                    {student.present ? `UP: ${student.studentId}` : 'Faltante'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  {student.present ? (
                    <>
                      <div className="flex items-center gap-1.5 justify-end">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                         <p className="text-slate-500 text-xs font-bold">{student.time}</p>
                      </div>
                    </>
                  ) : (
                    <button className="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold px-3 py-2 rounded-xl active:scale-95 transition-all">
                      PASAR
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {recentStudents.length > 3 && (
            <button className="w-full text-center text-blue-600 font-bold text-sm mt-4 py-2 hover:bg-blue-50 rounded-xl transition-colors">
              VER TODOS
            </button>
          )}
        </motion.div>

        {/* Quick Actions Footer - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-4 gap-2 bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100"
        >
          <button 
            onClick={() => navigate('/activities')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-700 text-[10px] font-medium text-center">Actividades</span>
          </button>
          <button 
            onClick={() => navigate('/students')}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-700 text-[10px] font-medium text-center">Lista del Grupo</span>
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-gray-700 text-[10px] font-medium text-center">Exportar PDF</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-700 text-[10px] font-medium text-center">Enviar Notificación</span>
          </button>
        </motion.div>
      </div>

      {/* RENDER EXPORT MODAL OPTIONS */}
      {showExportModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Printer className="w-6 h-6 text-red-500" />
                Generar Reporte
              </h3>
              <button 
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">¿Qué periodo deseas incluir en este reporte para imprimir?</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => handleExport('Semanal')}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <div className="text-left">
                  <div className="font-bold text-gray-900">Resumen Semanal</div>
                  <div className="text-xs text-gray-500">Últimos 7 días activos</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
              
              <button 
                onClick={() => handleExport('Mensual')}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <div className="text-left">
                  <div className="font-bold text-gray-900">Cierre Mensual</div>
                  <div className="text-xs text-gray-500">Evaluación de mes natural</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button 
                onClick={() => handleExport('Trimestral')}
                className="w-full flex items-center justify-between p-4 border-2 border-red-100 bg-red-50 rounded-xl active:scale-95 transition-transform"
              >
                <div className="text-left">
                  <div className="font-bold text-red-900">Boleta Trimestral NEM</div>
                  <div className="text-xs text-red-700">Reporte oficial para padres</div>
                </div>
                <Download className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}