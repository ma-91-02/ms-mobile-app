/**
 * Funciones de utilidad para trabajar con fechas
 */

/**
 * Formatea una fecha en formato de tiempo relativo (hace X minutos, hace X horas, etc.)
 * @param dateString - Cadena de fecha ISO o timestamp
 * @returns Texto formateado del tiempo relativo
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Si la fecha es inválida, devolver string vacío
  if (isNaN(date.getTime())) {
    return '';
  }

  // Menos de un minuto
  if (diffInSeconds < 60) {
    return 'الآن'; // Ahora
  }
  
  // Menos de una hora
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `قبل ${minutes} دقيقة`; // Hace X minutos
  }
  
  // Menos de un día
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `قبل ${hours} ساعة`; // Hace X horas
  }
  
  // Menos de una semana
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `قبل ${days} يوم`; // Hace X días
  }
  
  // Menos de un mes
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `قبل ${weeks} أسبوع`; // Hace X semanas
  }
  
  // Menos de un año
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `قبل ${months} شهر`; // Hace X meses
  }
  
  // Más de un año
  const years = Math.floor(diffInSeconds / 31536000);
  return `قبل ${years} سنة`; // Hace X años
}

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY)
 * @param dateString - Cadena de fecha ISO o timestamp
 * @returns Fecha formateada
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  
  // Si la fecha es inválida, devolver string vacío
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Formatea una fecha en formato largo (DD Month YYYY, HH:MM)
 * @param dateString - Cadena de fecha ISO o timestamp
 * @returns Fecha formateada
 */
export function formatLongDate(dateString: string): string {
  const date = new Date(dateString);
  
  // Si la fecha es inválida, devolver string vacío
  if (isNaN(date.getTime())) {
    return '';
  }
  
  // Nombres de los meses en árabe
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  const day = date.getDate();
  const month = arabicMonths[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year}، ${hours}:${minutes}`;
} 