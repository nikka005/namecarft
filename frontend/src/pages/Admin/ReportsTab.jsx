import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Users, Package, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ReportsTab = ({ token, api }) => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('orders');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const reportTypes = [
    { id: 'orders', label: 'Orders Report', icon: ShoppingCart, description: 'All order details including customer info, items, and payment status' },
    { id: 'customers', label: 'Customers Report', icon: Users, description: 'Customer list with contact details and order history' },
    { id: 'products', label: 'Products Report', icon: Package, description: 'Product inventory with stock levels and pricing' },
    { id: 'revenue', label: 'Revenue Report', icon: DollarSign, description: 'Sales and revenue breakdown by date' },
  ];

  const exportReport = async (format) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports/export?report_type=${reportType}&format=json`, token);
      const data = res.data.data;

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        saveAs(blob, `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`);
      } else if (format === 'csv' || format === 'excel') {
        // Flatten nested objects for CSV/Excel
        const flatData = data.map(item => {
          const flat = {};
          Object.keys(item).forEach(key => {
            if (typeof item[key] === 'object' && item[key] !== null) {
              if (Array.isArray(item[key])) {
                flat[key] = JSON.stringify(item[key]);
              } else {
                Object.keys(item[key]).forEach(subKey => {
                  flat[`${key}_${subKey}`] = item[key][subKey];
                });
              }
            } else {
              flat[key] = item[key];
            }
          });
          return flat;
        });

        const ws = XLSX.utils.json_to_sheet(flatData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, reportType);

        if (format === 'csv') {
          const csv = XLSX.utils.sheet_to_csv(ws);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
          saveAs(blob, `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
        } else {
          XLSX.writeFile(wb, `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
        }
      }

      toast({ title: 'Report exported successfully', description: `${res.data.count} records exported` });
    } catch (e) {
      toast({ title: 'Error exporting report', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Reports & Export</h2>
        <p className="text-gray-500">Generate and download reports for your business</p>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              reportType === type.id
                ? 'border-sky-500 bg-sky-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              reportType === type.id ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              <type.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900">{type.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{type.description}</p>
          </button>
        ))}
      </div>

      {/* Date Range (optional) */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Date Range (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold mb-4">Export Format</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => exportReport('excel')}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export as Excel
          </Button>
          <Button
            onClick={() => exportReport('csv')}
            disabled={loading}
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export as CSV
          </Button>
          <Button
            onClick={() => exportReport('json')}
            disabled={loading}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export as JSON
          </Button>
        </div>
        {loading && (
          <div className="mt-4 flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            Generating report...
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-6 text-white">
        <h3 className="font-semibold mb-2">Pro Tip</h3>
        <p className="text-sky-100">
          Export your data regularly for backup purposes. You can import Excel/CSV files into accounting software like Tally or QuickBooks for financial reporting.
        </p>
      </div>
    </div>
  );
};

export default ReportsTab;
