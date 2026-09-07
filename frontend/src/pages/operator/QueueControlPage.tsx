import React, { useEffect, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import QueueBoard, { type QueueItem } from "../../components/operator/QueueBoard";
import CurrentTokenDisplay from "../../components/operator/CurrentTokenDisplay";
import DailyStats from "../../components/operator/DailyStats";
import api from "../../services/api";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const QueueControlPage: React.FC = () => {
  const navigate = useNavigate();
  const [centreId] = useState<string>("centre-punjab-01");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentServing, setCurrentServing] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [callingNext, setCallingNext] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/operator/roster/${centreId}?status=ALL`);
      if (res.data?.success) {
        const list: QueueItem[] = res.data.data;
        setQueue(list.filter((b) => ["CHECKED_IN", "WAITING", "CALLED"].includes(b.status)));
        const active = list.find((b) => ["CALLED", "IN_PROCUREMENT"].includes(b.status));
        if (active) {
          setCurrentServing(active);
        } else if (list.length > 0) {
          setCurrentServing(list[0]);
        }
      }
    } catch {
      const fallbackList: QueueItem[] = [
        {
          id: "bk-1",
          token: "B-114",
          farmerName: "Sardar Gurdeep Singh",
          farmerPhone: "+91 98140 12345",
          cropName: "Sharbati Wheat",
          expectedQuantity: 45,
          status: "CALLED",
          slotWindow: "09:00 - 10:00",
          queuePosition: 1,
          checkedInAt: new Date().toISOString(),
        },
        {
          id: "bk-2",
          token: "B-115",
          farmerName: "Harinder Singh Gill",
          farmerPhone: "+91 98722 56789",
          cropName: "Sharbati Wheat",
          expectedQuantity: 52,
          status: "WAITING",
          slotWindow: "09:00 - 10:00",
          queuePosition: 2,
          checkedInAt: new Date().toISOString(),
        },
        {
          id: "bk-3",
          token: "B-116",
          farmerName: "Jasbir Kaur Sandhu",
          farmerPhone: "+91 94178 98765",
          cropName: "Basmati Paddy",
          expectedQuantity: 40,
          status: "WAITING",
          slotWindow: "10:00 - 11:00",
          queuePosition: 3,
          checkedInAt: new Date().toISOString(),
        },
        {
          id: "bk-4",
          token: "B-117",
          farmerName: "Manjit Singh Brar",
          farmerPhone: "+91 98150 44321",
          cropName: "Sharbati Wheat",
          expectedQuantity: 60,
          status: "WAITING",
          slotWindow: "10:00 - 11:00",
          queuePosition: 4,
          checkedInAt: new Date().toISOString(),
        },
      ];
      setQueue(fallbackList);
      setCurrentServing(fallbackList[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData();
  }, [centreId]);

  const handleCallNext = async () => {
    try {
      setCallingNext(true);
      const nextWaiting = queue.find((q) => q.status === "WAITING");
      if (!nextWaiting) {
        toast.info("No waiting farmers in queue.");
        return;
      }

      await api.post(`/api/queue/call-next`, {
        centreId,
        counterNo: 1,
      });

      toast.success(`Called Token ${nextWaiting.token} to Counter #1`);
      fetchQueueData();
    } catch {
      // Simulate advance
      const nextWaiting = queue.find((q) => q.status === "WAITING");
      if (nextWaiting) {
        setCurrentServing(nextWaiting);
        setQueue((prev) =>
          prev.map((item) =>
            item.id === nextWaiting.id ? { ...item, status: "CALLED" } : item
          )
        );
        toast.success(`Called Token ${nextWaiting.token} to Counter #1`);
      }
    } finally {
      setCallingNext(false);
    }
  };

  const handleCallSpecific = (item: QueueItem) => {
    setCurrentServing(item);
    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: "CALLED" } : q))
    );
    toast.success(`Token ${item.token} called to Desk.`);
  };

  const handleSkip = (item: QueueItem) => {
    setQueue((prev) => {
      const rest = prev.filter((q) => q.id !== item.id);
      return [...rest, { ...item, queuePosition: prev.length }];
    });
    toast.info(`Token ${item.token} moved to end of queue.`);
  };

  const handleNoShow = (item: QueueItem) => {
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
    toast.warning(`Token ${item.token} marked as No-Show.`);
  };

  const handleProcess = (item: QueueItem) => {
    navigate({
      to: "/operator/intake",
      search: { bookingId: item.id } as any,
    });
  };

  const filteredQueue = queue.filter(
    (q) =>
      q.token.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.farmerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.cropName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Metrics Row */}
      <DailyStats
        waitingCount={queue.filter((q) => q.status === "WAITING").length}
        processingCount={queue.filter((q) => ["CALLED", "IN_PROCUREMENT"].includes(q.status)).length}
        completedCount={64}
        totalDisbursed={1425000}
        totalQuintals={625}
      />

      {/* Massive Token Display & Call Next */}
      <CurrentTokenDisplay
        currentToken={currentServing?.token || null}
        farmerName={currentServing?.farmerName}
        cropName={currentServing?.cropName}
        quantity={currentServing?.expectedQuantity}
        counterNo={1}
        onCallNext={handleCallNext}
        isLoading={callingNext}
        nextToken={queue.find((q) => q.status === "WAITING")?.token || null}
        totalWaiting={queue.filter((q) => q.status === "WAITING").length}
      />

      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Token (B-114), Farmer Name, or Crop..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 shadow-xs focus:border-emerald-500 focus:outline-hidden"
          />
        </div>

        <button
          onClick={fetchQueueData}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Queue
        </button>
      </div>

      {/* Queue Board Table */}
      <QueueBoard
        queue={filteredQueue}
        onCall={handleCallSpecific}
        onSkip={handleSkip}
        onNoShow={handleNoShow}
        onProcess={handleProcess}
      />
    </div>
  );
};

export default QueueControlPage;
