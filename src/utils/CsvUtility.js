export default class CsvUtility {
  static exportToCSV(feedbackData, fileName = 'feedback.csv') {
    try {
      if (feedbackData.length === 0) {
        throw new Error('Нет отзывов для экспорта');
      }

      // Создаем CSV содержимое
      let csvContent = '"Дата","Имя","Email","Отзыв","Оценка","Функции"\n';

      feedbackData.forEach(feedback => {
        const row = [
          `"${new Date(feedback.timestamp).toLocaleString('ru-RU')}"`,
          `"${feedback.name || 'Аноним'}"`,
          `"${feedback.email || ''}"`,
          `"${feedback.message || ''}"`,
          `"${feedback.rating || ''}"`,
          `"${feedback.features ? feedback.features.join(', ') : ''}"`
        ].join(',');

        csvContent += row + '\n';
      });

      // Создаем Blob и скачиваем файл
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, message: 'Отзывы успешно экспортированы в CSV!' };
    } catch (error) {
      return { success: false, message: `Ошибка экспорта: ${error.message}` };
    }
  }
}
