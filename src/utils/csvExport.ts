import { Order } from '../types';

export const exportOrdersToCSV = (orders: Order[], filename = 'basaveshwara_dabha_orders.csv') => {
  if (!orders || orders.length === 0) {
    alert('No orders available to export.');
    return;
  }

  const headers = [
    'Order Number',
    'Date & Time',
    'Customer Name',
    'Customer Phone',
    'Order Type',
    'Status',
    'Payment Method',
    'Payment Status',
    'Subtotal (INR)',
    'Tax (INR)',
    'Delivery Fee (INR)',
    'Total Amount (INR)',
    'Items Summary',
    'Special Instructions'
  ];

  const rows = orders.map((order) => {
    const itemsSummary = order.items
      .map((item) => `${item.product_name_en} (${item.variant_name_en || 'Regular'}) x${item.quantity}`)
      .join('; ');

    return [
      `"${order.order_number}"`,
      `"${new Date(order.created_at).toLocaleString('en-IN')}"`,
      `"${order.customer_name.replace(/"/g, '""')}"`,
      `"${order.customer_phone}"`,
      `"${order.order_type}"`,
      `"${order.status}"`,
      `"${order.payment_method}"`,
      `"${order.payment_status}"`,
      order.subtotal,
      order.tax,
      order.delivery_fee,
      order.total_amount,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      `"${(order.special_instructions || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
