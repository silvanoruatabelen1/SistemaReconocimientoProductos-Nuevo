import { toast } from '../components/Toast.js';
export const notify = {
  success: (msg) => toast(msg, 'success'),
  info: (msg) => toast(msg, 'primary'),
  warn: (msg) => toast(msg, 'warning'),
  error: (msg) => toast(msg, 'danger')
};

