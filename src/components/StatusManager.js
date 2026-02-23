export default class StatusManager {

  static showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) {
      return;
    }
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type} show`;

    // Автоматически скрыть сообщение через 5 секунд
    setTimeout(() => {
      statusDiv.className = 'status-message';
    }, 5000);
  }
}
