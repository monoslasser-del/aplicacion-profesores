export const reportService = {
  generatePdf: async (type: 'semanal' | 'mensual' | 'trimestral', groupId: string | number) => {
    const token = localStorage.getItem('auth_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://tech.ecteam.mx/api';
    
    const response = await fetch(`${baseUrl}/v1/reports/generate?type=${type}&group_id=${groupId}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    if (!response.ok) throw new Error(`Error generando reporte PDF de tipo: ${type}`);
    return await response.blob();
  }
};
