const FEEDBACK_LOCAL_STORAGE = 'feedbacks';
const EXISTING_FEEDBACKS = JSON.parse(localStorage.getItem(FEEDBACK_LOCAL_STORAGE) || '[]');

export default class StorageManager {

  static saveFeedback(feedback) {
    EXISTING_FEEDBACKS.push(feedback);
    localStorage.setItem(FEEDBACK_LOCAL_STORAGE, JSON.stringify(EXISTING_FEEDBACKS));
    return EXISTING_FEEDBACKS;
  }

  static getAllFeedback() {
    return EXISTING_FEEDBACKS;
  }

  static clearAllFeedback() {
    localStorage.removeItem(FEEDBACK_LOCAL_STORAGE);
    return '[]';
  }
}
