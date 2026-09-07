import React, { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";

export const AuditLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const logs = [
    {
      id: "log-1",
      action: "PROCUREMENT_RECORDED",
      entity: "Booking",
      entityId: "KQ-KHN-1048",
      userName: "Khanna Operator Desk (Desk-1)",
      role: "OPERATOR",
      ipAddress: "192.168.1.42",
      details: "Weighed 45.5 Qtl Sharbati Wheat, Grade A, ₹1,03,513",
      timestamp: "2 mins ago",
    },
    {
      id: "log-2",
      action: "DBT_PAYMENT_DISBURSED",
      entity: "Payment",
      entityId: "PAY-10482",
      userName: "Direct Benefit Transfer Gateway",
      role: "SYSTEM",
      ipAddress: "10.0.4.12",
      details: "Disbursed ₹1,03,513 to SBI A/c ••••4821 (UTR: DBT-2026-948210)",
      timestamp: "2 mins ago",
    },
    {
      id: "log-3",
      action: "GATE_CHECK_IN",
      entity: "QueueEntry",
      entityId: "KQ-KHN-1048",
      userName: "Gate Scanner #01",
      role: "OPERATOR",
      ipAddress: "192.168.1.10",
      details: "QR Pass verified, Assigned Queue Position #1",
      timestamp: "32 mins ago",
    },
    {
      id: "log-4",
      action: "SLOT_BOOKED",
      entity: "Booking",
      entityId: "KQ-KHN-1052",
      userName: "Jaswinder Singh",
      role: "FARMER",
      ipAddress: "49.36.120.8",
      details: "Booked 50 Qtl Wheat for Tomorrow (09:00 - 10:00)",
      timestamp: "1 hour ago",
    },
    {
      id: "log-5",
      action: "MSP_RATE_UPDATED",
      entity: "CropMaster",
      entityId: "CROP-WHEAT",
      userName: "Admin Ministry Desk",
      role: "ADMIN",
      ipAddress: "14.139.60.2",
      details: "Updated MSP Rate for Wheat from ₹2125 to ₹2275 / Qtl",
      timestamp: "Yesterday",
    },
  ];

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Immutable Audit Trail & Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete tamper-evident log of every gate check-in, weighment record, MSP transaction, and DBT disbursal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            <ShieldCheck size={14} className="text-emerald-600" /> Tamper-Proof Trail Active
          </span>
        </div>
      </div>

      {/* Search Header */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Action, Token ID, Operator, or Details..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-hidden"
        />
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Activity Log Stream</h3>
          <span className="font-mono text-xs text-slate-500">{filteredLogs.length} Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Action & Entity</th>
                <th className="px-5 py-3.5">Triggered By</th>
                <th className="px-5 py-3.5">Details</th>
                <th className="px-5 py-3.5">IP / Source</th>
                <th className="px-5 py-3.5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-slate-900 block">{log.action}</span>
                    <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {log.entity}: {log.entityId}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-slate-900 block">{log.userName}</span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                      {log.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-xs">{log.details}</td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">{log.ipAddress}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
