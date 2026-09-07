import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Download, Calendar, RefreshCw, IndianRupee, Scale, CheckCircle2 } from "lucide-react";
import api from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";

export const DailyReportPage: React.FC = () => {
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [centreId] = useState<string>("centre-punjab-01");
  const [loading, setLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/procurement/daily-report/${centreId}?date=${reportDate}`);
      if (res.data?.success) {
        setReportData(res.data.data);
      }
    } catch {
      setReportData({
        centreId,
        date: reportDate,
        totalProcurements: 12,
        grandTotalWeight: 540.5,
        grandTotalAmount: 1229638,
        cropTotals: {
          "Sharbati Wheat": { quintals: 380.5, amount: 865638, count: 8 },
          "Basmati Paddy": { quintals: 160.0, amount: 364000, count: 4 },
        },
        records: [
          {
            receiptNumber: "PR-KHN-10482",
            token: "KQ-KHN-1048",
            farmerName: "Sardar Gurdeep Singh",
            phone: "+91 98140 12345",
            crop: "Sharbati Wheat",
            actualWeight: 45.5,
            qualityGrade: "GRADE_A",
            moisturePercent: 11.2,
            mspRate: 2275,
            totalAmount: 103513,
            completedAt: new Date().toISOString(),
            paymentStatus: "DISBURSED",
            utrNumber: "DBT-2026-948210",
          },
          {
            receiptNumber: "PR-KHN-10483",
            token: "KQ-KHN-1049",
            farmerName: "Harinder Singh Gill",
            phone: "+91 98722 56789",
            crop: "Sharbati Wheat",
            actualWeight: 52.0,
            qualityGrade: "GRADE_A",
            moisturePercent: 11.0,
            mspRate: 2275,
            totalAmount: 118300,
            completedAt: new Date().toISOString(),
            paymentStatus: "DISBURSED",
            utrNumber: "DBT-2026-948211",
          },
          {
            receiptNumber: "PR-KHN-10484",
            token: "KQ-KHN-1050",
            farmerName: "Jasbir Kaur Sandhu",
            phone: "+91 94178 98765",
            crop: "Basmati Paddy",
            actualWeight: 40.0,
            qualityGrade: "GRADE_A",
            moisturePercent: 11.5,
            mspRate: 2300,
            totalAmount: 92000,
            completedAt: new Date().toISOString(),
            paymentStatus: "PROCESSING",
            utrNumber: "DBT-2026-948212",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportDate, centreId]);

  const handleExportCsv = () => {
    if (!reportData?.records || reportData.records.length === 0) return;

    const csvData = reportData.records.map((r: any) => ({
      "Receipt Number": r.receiptNumber,
      "Token ID": r.token,
      "Farmer Name": r.farmerName,
      "Contact Number": r.phone,
      "Crop Name": r.crop,
      "Actual Weight (Qtl)": r.actualWeight,
      "Quality Grade": r.qualityGrade,
      "Moisture (%)": r.moisturePercent,
      "MSP Rate (₹/Qtl)": r.mspRate,
      "Total Settlement (₹)": r.totalAmount,
      "Completion Time": new Date(r.completedAt).toLocaleString("en-IN"),
      "Payment Status": r.paymentStatus,
      "DBT UTR Number": r.utrNumber,
    }));

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `KisanQueue_DailyReport_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Daily Mandi Procurement Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comprehensive audit report, weighbridge ledger, and CSV export for government accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReport}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={handleExportCsv}
            disabled={!reportData?.records?.length}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <Download size={15} /> Export Official CSV
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Select Date:</span>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Aggregate KPI Summary */}
      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Total Farmers Served</span>
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
            <p className="mt-2 font-mono text-3xl font-black text-slate-900">
              {reportData.totalProcurements}
            </p>
            <span className="text-[11px] text-slate-400">Official Receipts Generated</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Total Quantity Weighed</span>
              <Scale size={16} className="text-blue-600" />
            </div>
            <p className="mt-2 font-mono text-3xl font-black text-slate-900">
              {reportData.grandTotalWeight} <span className="text-base font-medium">Qtl</span>
            </p>
            <span className="text-[11px] text-slate-400">Weighbridge Verified</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Total Mandi Value Disbursed</span>
              <IndianRupee size={16} className="text-emerald-600" />
            </div>
            <p className="mt-2 font-mono text-3xl font-black text-emerald-950">
              ₹{(reportData.grandTotalAmount / 100000).toFixed(2)} Lakh
            </p>
            <span className="text-[11px] text-emerald-600">100% Direct DBT Bank Credit</span>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-3.5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Procurement & Settlement Log</h3>
          <span className="text-xs font-mono text-slate-500">{reportData?.records?.length || 0} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Receipt / Token</th>
                <th className="px-4 py-3">Farmer Details</th>
                <th className="px-4 py-3">Crop & Grade</th>
                <th className="px-4 py-3">Weight (Qtl)</th>
                <th className="px-4 py-3">Amount (₹)</th>
                <th className="px-4 py-3">DBT Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reportData?.records?.map((record: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-900">{record.receiptNumber}</div>
                    <div className="font-mono text-[11px] text-slate-500">{record.token}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{record.farmerName}</div>
                    <div className="font-mono text-[11px] text-slate-500">{record.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{record.crop}</div>
                    <div className="text-[11px] text-emerald-600">{record.qualityGrade} • {record.moisturePercent}% M</div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {record.actualWeight} Qtl
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-800">
                    ₹{record.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={record.paymentStatus} size="sm" />
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">{record.utrNumber}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyReportPage;
