import { toast } from '../components/Toast.js';
export const notify = {
  info: (m)=>toast(m,'info'),
  success: (m)=>toast(m,'success'),
  warn: (m)=>toast(m,'warning'),
  error: (m)=>toast(m,'error'),
};

