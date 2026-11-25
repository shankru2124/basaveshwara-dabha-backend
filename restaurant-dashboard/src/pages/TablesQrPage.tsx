import React, { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode, Plus, Printer, ExternalLink, Edit2, Trash2, CheckCircle2,
  BellRing, Receipt, Users, Sparkles, X, Copy, Check, Globe, Utensils
} from 'lucide-react';
import { RestaurantTable, TableServiceRequest, TableStatus } from '../types';
import { api } from '../services/api';

interface TablesQrPageProps {
  tables: RestaurantTable[];
  serviceRequests: TableServiceRequest[];
  onRefresh: () => void;
}

const getDefaultCustomerUrl = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('bd_customer_qr_base_url');
    if (saved) return saved;
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || /^192\.168\.|^10\.|^172\./.test(host)) {
      return `http://${host}:5173`;
    }
    return window.location.origin;
  }
  return 'http://localhost:5173';
};

export const TablesQrPage: React.FC<TablesQrPageProps> = ({
  tables,
  serviceRequests,
  onRefresh
}) => {
  const [customerBaseUrl, setCustomerBaseUrl] = useState<string>(getDefaultCustomerUrl);
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [copiedTable, setCopiedTable] = useState<string | null>(null);

  // Add / Edit Table Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [section, setSection] = useState('Main Hall');
  const [isSaving, setIsSaving] = useState(false);

  // QR Card Print Modal
  const [previewQrTable, setPreviewQrTable] = useState<RestaurantTable | null>(null);
  const [isBulkPrintOpen, setIsBulkPrintOpen] = useState(false);

  const handleBaseUrlChange = (val: string) => {
    setCustomerBaseUrl(val);
    localStorage.setItem('bd_customer_qr_base_url', val);
  };

  const getTableQrUrl = (tNum: string) => {
    const cleanBase = customerBaseUrl.trim().replace(/\/+$/, '') || 'http://localhost:5173';
    return `${cleanBase}/?table=${encodeURIComponent(tNum)}`;
  };

  const sections = useMemo(() => {
    const set = new Set<string>(['Main Hall', 'AC Family Hall', 'Garden Patio']);
    tables.forEach((t) => {
      if (t.section) set.add(t.section);
    });
    return ['ALL', ...Array.from(set)];
  }, [tables]);

  const filteredTables = tables.filter((t) =>
    selectedSection === 'ALL' ? true : t.section === selectedSection
  );

  const pendingRequests = serviceRequests.filter((r) => r.status === 'PENDING');

  const openAddModal = () => {
    setEditingTable(null);
    const nextIdx = tables.length + 1;
    const suggested = `T-${nextIdx < 10 ? '0' : ''}${nextIdx}`;
    setTableNumber(suggested);
    setTableName(`Table ${nextIdx}`);
    setCapacity(4);
    setSection('Main Hall');
    setIsFormOpen(true);
  };

  const openEditModal = (t: RestaurantTable) => {
    setEditingTable(t);
    setTableNumber(t.table_number);
    setTableName(t.table_name);
    setCapacity(t.capacity);
    setSection(t.section || 'Main Hall');
    setIsFormOpen(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim() || !tableName.trim()) return;
    setIsSaving(true);
    try {
      if (editingTable) {
        await api.updateTable(editingTable.id, {
          table_number: tableNumber.trim().toUpperCase(),
          table_name: tableName.trim(),
          capacity,
          section: section.trim() || 'Main Hall'
        });
      } else {
        await api.createTable({
          table_number: tableNumber.trim().toUpperCase(),
          table_name: tableName.trim(),
          capacity,
          section: section.trim() || 'Main Hall',
          status: 'AVAILABLE',
          is_active: true
        });
      }
      setIsFormOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save table');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (t: RestaurantTable, newStatus: TableStatus) => {
    try {
      await api.updateTable(t.id, { status: newStatus });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update table status');
    }
  };

  const handleDeleteTable = async (t: RestaurantTable) => {
    if (!window.confirm(`Delete ${t.table_number} (${t.table_name}) and its QR code?`)) return;
    try {
      await api.deleteTable(t.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete table');
    }
  };

  const handleResolveRequest = async (reqId: string, clearTable: boolean) => {
    try {
      await api.resolveServiceRequest(reqId, clearTable);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve service request');
    }
  };

  const handleCopyUrl = (tNum: string) => {
    const url = getTableQrUrl(tNum);
    navigator.clipboard?.writeText(url);
    setCopiedTable(tNum);
    setTimeout(() => setCopiedTable(null), 2000);
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'OCCUPIED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'BILLING':
        return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      case 'RESERVED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === 'AVAILABLE').length,
    occupied: tables.filter((t) => t.status === 'OCCUPIED').length,
    billingOrAlerts: tables.filter((t) => t.status === 'BILLING').length + pendingRequests.length
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Live Smart QR Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total QR Tables</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{stats.available}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Occupied</p>
            <p className="text-2xl font-black text-amber-600 mt-0.5">{stats.occupied}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Waiter / Bill Alerts</p>
            <p className={`text-2xl font-black mt-0.5 ${pendingRequests.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {pendingRequests.length}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pendingRequests.length > 0 ? 'bg-red-100 text-red-600 animate-bounce' : 'bg-slate-100 text-slate-500'}`}>
            <BellRing className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Live Waiter Calls & Bill Requests Alert Panel */}
      {pendingRequests.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border-2 border-red-300 rounded-3xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm text-red-900 flex items-center gap-2 uppercase tracking-wider">
              <BellRing className="w-4 h-4 text-red-600 animate-bounce" />
              Active Table Service & Bill Requests ({pendingRequests.length})
            </h3>
            <span className="text-[11px] font-bold text-red-700">Live from Table QR</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl p-4 border border-red-200 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-black text-xs">
                      {req.table_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      req.request_type === 'REQUEST_BILL'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.request_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-900 mt-2">{req.table_name} • {req.customer_name || 'Guest'}</p>
                  {req.note && <p className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg">"{req.note}"</p>}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleResolveRequest(req.id, false)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl transition"
                  >
                    Mark Attended
                  </button>
                  {req.request_type === 'REQUEST_BILL' && (
                    <button
                      type="button"
                      onClick={() => handleResolveRequest(req.id, true)}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition"
                    >
                      Paid & Free Table
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Controls & Customer QR Domain Setting */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-brand-600" />
              Basaveshwara Dabha • Smart QR Floor & Table Cards
            </h3>
            <p className="text-xs text-slate-500">
              Customers scan a table QR to open the Basaveshwara Dabha menu directly in Dine-In mode, place orders to your kitchen, or call a waiter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkPrintOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              Print All QR Cards
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add Table
            </button>
          </div>
        </div>

        {/* Customer Menu QR Target URL Config */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 shrink-0">
            <Globe className="w-4 h-4 text-brand-600" />
            <span>QR Customer Menu Base URL:</span>
          </div>
          <input
            type="text"
            value={customerBaseUrl}
            onChange={(e) => handleBaseUrlChange(e.target.value)}
            placeholder="http://localhost:5173 or https://your-customer-app.vercel.app"
            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:border-brand-500"
          />
          <span className="text-[11px] text-slate-500 shrink-0">
            Example: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">?table=T-01</code>
          </span>
        </div>

        {/* Section Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {sections.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSection(sec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedSection === sec
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec === 'ALL' ? `All Sections (${tables.length})` : sec}
            </button>
          ))}
        </div>
      </div>

      {/* Tables & QR Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredTables.map((table) => {
          const qrUrl = getTableQrUrl(table.table_number);
          const hasAlert = (table.pending_requests_count || 0) > 0 || table.status === 'BILLING';

          return (
            <div
              key={table.id || table.table_number}
              className={`bg-white rounded-3xl border p-5 flex flex-col justify-between gap-4 transition ${
                hasAlert
                  ? 'border-red-400 ring-4 ring-red-100 shadow-md'
                  : 'border-slate-200/80 shadow-xs hover:shadow-md'
              }`}
            >
              {/* Top Row */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white font-black text-xs">
                        {table.table_number}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {table.capacity}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-1.5">{table.table_name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{table.section}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(table.status)}`}>
                    {table.status}
                  </span>
                </div>

                {/* Active Table Order Summary */}
                {(table.active_order_count || 0) > 0 && (
                  <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900">
                      {table.active_order_count} Active Order{(table.active_order_count || 0) > 1 ? 's' : ''}
                    </span>
                    <span className="font-black text-amber-900">₹{table.active_bill_total || 0}</span>
                  </div>
                )}

                {/* Scannable QR Preview */}
                <div
                  onClick={() => setPreviewQrTable(table)}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-brand-50/40 hover:border-brand-300 transition group"
                  title="Click to enlarge & print QR Table Card"
                >
                  <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-100">
                    <QRCodeSVG
                      value={qrUrl}
                      size={112}
                      level="M"
                      includeMargin={false}
                      fgColor="#0f172a"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-brand-600">
                    Click to Print Table QR Card
                  </span>
                </div>
              </div>

              {/* Status Switcher & Actions */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
                  {(['AVAILABLE', 'OCCUPIED', 'BILLING'] as TableStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(table, st)}
                      className={`py-1.5 rounded-lg border transition ${
                        table.status === st
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'AVAILABLE' ? 'Free' : st === 'OCCUPIED' ? 'Occupied' : 'Billing'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-1">
                  <a
                    href={qrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition"
                    title="Test opening Customer Menu for this table"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Test QR Link
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(table.table_number)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                    title="Copy Table QR URL"
                  >
                    {copiedTable === table.table_number ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewQrTable(table)}
                    className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl border border-slate-200 transition"
                    title="Print QR Card"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(table)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                    title="Edit Table"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTable(table)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition"
                    title="Delete Table"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Table Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-slate-900">
                {editingTable ? `Edit ${editingTable.table_number}` : 'Add New Smart QR Table'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Table Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. T-11 or VIP-1"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Seats Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 11 • Window Side"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dining Section / Zone</label>
                <input
                  type="text"
                  placeholder="e.g. Main Hall, AC Family Hall, Garden Patio"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-md"
                >
                  {isSaving ? 'Saving...' : editingTable ? 'Update Table' : 'Create Table & QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Single Printable Table Tent QR Card Modal */}
      {previewQrTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setPreviewQrTable(null)}
              className="no-print absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Branded Printable Table Card */}
            <div className="border-4 border-brand-600 rounded-3xl p-6 text-center bg-gradient-to-b from-amber-50 via-white to-orange-50 space-y-4">
              <div className="flex items-center justify-center gap-2.5">
                <img
                  src="/logo.jpg"
                  alt="Basaveshwara Dabha"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-brand-500 shadow-sm"
                />
                <div className="text-left">
                  <h4 className="font-black text-base text-slate-900 leading-tight">Basaveshwara Dabha</h4>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">100% Pure Vegetarian</p>
                </div>
              </div>

              <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900 text-white font-black text-sm tracking-wider">
                TABLE {previewQrTable.table_number}
              </div>

              <div className="bg-white p-4 rounded-2xl inline-block shadow-md border border-brand-200">
                <QRCodeSVG
                  value={getTableQrUrl(previewQrTable.table_number)}
                  size={200}
                  level="H"
                  includeMargin={true}
                  fgColor="#0f172a"
                />
              </div>

              <div className="space-y-1">
                <p className="font-black text-sm text-brand-700 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  SCAN TO ORDER & PAY
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  View Digital Menu • Place Order • Call Waiter • Request Bill
                </p>
                <p className="text-[10px] text-slate-400 font-mono break-all pt-1">
                  {getTableQrUrl(previewQrTable.table_number)}
                </p>
              </div>
            </div>

            <div className="no-print flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                Print Table Tent Card
              </button>
              <a
                href={getTableQrUrl(previewQrTable.table_number)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Print All QR Cards Modal */}
      {isBulkPrintOpen && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-6 sm:p-10">
          <div className="no-print max-w-6xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-black text-slate-900">Basaveshwara Dabha • All Table QR Tent Cards</h2>
              <p className="text-xs text-slate-500">Print and place on each dining table for instant contactless ordering.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print All ({tables.length}) Cards
              </button>
              <button
                type="button"
                onClick={() => setIsBulkPrintOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((t) => (
              <div key={t.table_number} className="border-2 border-brand-600 rounded-3xl p-6 text-center bg-gradient-to-b from-amber-50/60 to-white space-y-3 break-inside-avoid">
                <div className="flex items-center justify-center gap-2">
                  <img src="/logo.jpg" alt="Basaveshwara Dabha" className="w-9 h-9 rounded-lg object-cover border border-brand-400" />
                  <div className="text-left">
                    <h4 className="font-black text-sm text-slate-900">Basaveshwara Dabha</h4>
                    <p className="text-[9px] font-bold text-emerald-700 uppercase">100% Pure Vegetarian</p>
                  </div>
                </div>
                <div className="inline-block px-3.5 py-1 rounded-full bg-slate-900 text-white font-black text-xs">
                  {t.table_number} • {t.section}
                </div>
                <div className="bg-white p-3 rounded-2xl inline-block border border-slate-200">
                  <QRCodeSVG value={getTableQrUrl(t.table_number)} size={150} level="H" includeMargin={true} />
                </div>
                <p className="font-extrabold text-xs text-brand-700">SCAN QR TO ORDER & CALL WAITER</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
