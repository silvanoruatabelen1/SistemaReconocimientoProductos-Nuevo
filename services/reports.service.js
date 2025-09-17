import { listOrders } from './orders.service.js';

export function salesByDay({ depotId = null } = {}) {
  const orders = listOrders({ depotId });
  const byDay = new Map();
  for (const o of orders) {
    const day = new Date(o.at);
    const key = `${day.getFullYear()}-${(day.getMonth()+1).toString().padStart(2,'0')}-${day.getDate().toString().padStart(2,'0')}`;
    byDay.set(key, (byDay.get(key) || 0) + (o.total || 0));
  }
  const labels = Array.from(byDay.keys()).sort();
  const data = labels.map(k => byDay.get(k));
  return { labels, data };
}

