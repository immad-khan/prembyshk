"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CloseIcon,
  GiftIcon,
  SearchIcon,
  TruckIcon,
  WhatsappIcon,
} from "@/components/icons";
import { formatPrice } from "@/lib/format";

export type AdminOrderItem = {
  id: number;
  orderNumber: string;
  productSlug: string;
  name: string;
  variant: string;
  image: string;
  unitPrice: number;
  quantity: number;
};

export type AdminOrder = {
  id: number;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  note: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  createdAt: string;
  items: AdminOrderItem[];
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  confirmed: {
    label: "Confirmed / New",
    color: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  processing: {
    label: "In Production / Packing",
    color: "text-blue-800",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  dispatched: {
    label: "Dispatched / Courier Handed",
    color: "text-purple-800",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-rose-800",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
};

function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  if (digits.startsWith("92")) return digits;
  return digits;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function timeAgo(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
}

interface AdminOrdersProps {
  authHeaders: () => Record<string, string>;
  onOrdersUpdated?: (orders: AdminOrder[]) => void;
}

export function AdminOrders({ authHeaders, onOrdersUpdated }: AdminOrdersProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [deletingNumber, setDeletingNumber] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [newOrderNotice, setNewOrderNotice] = useState<string | null>(null);

  async function fetchOrders(silent = false) {
    if (!silent) setRefreshing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        cache: "no-store",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Could not load orders");
      const data = (await res.json()) as { orders?: AdminOrder[] };
      const list = data.orders || [];

      // Check if there are newly arrived orders
      setOrders((prev) => {
        if (prev.length > 0 && list.length > prev.length) {
          const newest = list[0];
          setNewOrderNotice(
            `🔔 New order placed on store: ${newest.orderNumber} by ${newest.customerName} (${formatPrice(newest.total)})`,
          );
        }
        return list;
      });

      if (onOrdersUpdated) {
        onOrdersUpdated(list);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void fetchOrders();
  }, []);

  // Polling every 25 seconds for incoming orders
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void fetchOrders(true);
    }, 25000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  async function updateStatus(orderNumber: string, nextStatus: string) {
    setUpdatingStatus(orderNumber);
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status: nextStatus } : o)),
    );
    if (selectedOrder?.orderNumber === orderNumber) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus } : prev));
    }

    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch {
      alert("Could not update order status on server. Please try again.");
      void fetchOrders(true);
    } finally {
      setUpdatingStatus(null);
    }
  }

  async function deleteOrder(orderNumber: string) {
    if (!confirm(`Are you sure you want to delete order ${orderNumber}? This will permanently remove it.`)) {
      return;
    }
    setDeletingNumber(orderNumber);
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete order");
      setOrders((prev) => prev.filter((o) => o.orderNumber !== orderNumber));
      if (selectedOrder?.orderNumber === orderNumber) {
        setSelectedOrder(null);
      }
    } catch {
      alert("Failed to delete order.");
    } finally {
      setDeletingNumber(null);
    }
  }

  function copyOrderNumber(num: string) {
    navigator.clipboard?.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  }

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();
      if (!matchesStatus) return false;
      if (!q) return true;

      const itemsMatch = order.items.some(
        (it) => it.name.toLowerCase().includes(q) || it.variant.toLowerCase().includes(q),
      );

      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.phone.toLowerCase().includes(q) ||
        order.email.toLowerCase().includes(q) ||
        order.city.toLowerCase().includes(q) ||
        order.address.toLowerCase().includes(q) ||
        itemsMatch
      );
    });
  }, [orders, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => (o.status !== "cancelled" ? sum + o.total : sum), 0);
    const confirmedCount = orders.filter((o) => o.status === "confirmed").length;
    const processingCount = orders.filter((o) => o.status === "processing").length;
    const dispatchedCount = orders.filter((o) => o.status === "dispatched").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;
    return { totalOrders, totalRevenue, confirmedCount, processingCount, dispatchedCount, deliveredCount };
  }, [orders]);

  return (
    <div>
      {/* Top Banner Notice for new incoming order */}
      {newOrderNotice && (
        <div className="mb-6 flex items-center justify-between rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{newOrderNotice}</span>
          </div>
          <button
            onClick={() => setNewOrderNotice(null)}
            className="text-amber-800 hover:text-amber-950 text-xs uppercase tracking-wider underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-3xl text-ink">Customer Orders</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Monitor client purchases in real-time, view full contact & delivery details, and manage fulfillment.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-soft bg-cream-deep/60 px-3 py-2 rounded-sm border border-line cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-rose-deep h-3.5 w-3.5"
            />
            <span className="tracking-wider uppercase text-[0.62rem]">
              Live Check {autoRefresh && <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping ml-1" />}
            </span>
          </label>
          <button
            onClick={() => void fetchOrders()}
            disabled={refreshing}
            className="rounded-sm border border-line px-4 py-2.5 text-[0.62rem] tracking-[0.18em] uppercase text-ink transition hover:bg-blush-soft disabled:opacity-50"
          >
            {refreshing ? "Refreshing…" : "↻ Refresh Orders"}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-sm border border-line bg-blush-soft/40 p-4">
          <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted">Total Orders</p>
          <p className="mt-1 font-serif text-3xl text-ink">{stats.totalOrders}</p>
        </div>
        <div className="rounded-sm border border-line bg-blush-soft/40 p-4">
          <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted">Total Revenue</p>
          <p className="mt-1 font-serif text-2xl text-rose-deep sm:text-3xl">
            {formatPrice(stats.totalRevenue)}
          </p>
        </div>
        <div className="rounded-sm border border-line bg-amber-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-[0.62rem] tracking-[0.18em] uppercase text-amber-900">New / Unfulfilled</p>
            {stats.confirmedCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <p className="mt-1 font-serif text-3xl text-amber-950">
            {stats.confirmedCount + stats.processingCount}
          </p>
          <p className="text-[0.6rem] text-amber-800/80 mt-0.5">
            {stats.confirmedCount} confirmed, {stats.processingCount} packing
          </p>
        </div>
        <div className="rounded-sm border border-line bg-emerald-50/60 p-4">
          <p className="text-[0.62rem] tracking-[0.18em] uppercase text-emerald-900">Completed Delivery</p>
          <p className="mt-1 font-serif text-3xl text-emerald-950">{stats.deliveredCount}</p>
          <p className="text-[0.6rem] text-emerald-800/80 mt-0.5">{stats.dispatchedCount} in transit</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number, customer name, phone, city, product…"
            className="w-full rounded-sm border border-line bg-cream pl-10 pr-4 py-3 text-sm text-ink outline-none focus:border-rose"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 sm:items-center">
          {[
            { id: "all", label: `All (${orders.length})` },
            { id: "confirmed", label: `Confirmed (${stats.confirmedCount})` },
            { id: "processing", label: `Processing (${stats.processingCount})` },
            { id: "dispatched", label: `Dispatched (${stats.dispatchedCount})` },
            { id: "delivered", label: `Delivered (${stats.deliveredCount})` },
            { id: "cancelled", label: "Cancelled" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`rounded-sm border px-3 py-2 text-[0.62rem] tracking-[0.14em] uppercase transition ${
                statusFilter === pill.id
                  ? "border-rose-deep bg-rose-deep text-cream"
                  : "border-line bg-cream text-ink-soft hover:border-rose-light hover:bg-blush-soft"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-10 py-16 text-center text-sm text-muted">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-rose-deep border-t-transparent mb-2" />
          <p>Loading order data…</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-6 rounded-sm border border-rose-light bg-rose-50 p-4 text-sm text-rose-deep">
          {error}
        </div>
      )}

      {/* Orders List */}
      {!loading && (
        <div className="mt-6 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-sm border border-line bg-cream p-12 text-center">
              <p className="eyebrow">Zero Orders Found</p>
              <h3 className="mt-2 font-serif text-2xl text-ink">
                {orders.length === 0
                  ? "No orders have been placed yet."
                  : "No orders match your filter criteria."}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">
                {orders.length === 0
                  ? "As soon as a client checks out on the website, their order and full delivery details will appear here automatically."
                  : "Try clearing your search query or switching to All status."}
              </p>
              {orders.length > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 rounded-sm border border-line px-5 py-2.5 text-[0.62rem] tracking-[0.18em] uppercase text-ink hover:bg-blush-soft"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusCfg = STATUS_LABELS[order.status.toLowerCase()] || {
                label: order.status,
                color: "text-ink",
                bg: "bg-cream-deep",
                border: "border-line",
              };
              const cleanPhone = formatWhatsAppNumber(order.phone);
              const waGreeting = encodeURIComponent(
                `Assalam-o-Alaikum ${order.customerName.trim()}!\n\nThis is Prem by SHK regarding your order *${order.orderNumber}* for Rs ${order.total.toLocaleString()}.\n\nWe have received your order and are preparing your jewellery for delivery to:\n${order.address}, ${order.city}.\n\nThank you for choosing Prem by SHK! ✨`,
              );

              return (
                <article
                  key={order.orderNumber}
                  className="rounded-sm border border-line bg-cream p-5 shadow-sm transition hover:border-rose-light"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-xl font-medium tracking-wide text-ink">
                          {order.orderNumber}
                        </span>
                        <button
                          onClick={() => copyOrderNumber(order.orderNumber)}
                          title="Copy order number"
                          className="rounded border border-line px-1.5 py-0.5 text-[0.58rem] text-muted hover:border-rose-light hover:text-rose-deep"
                        >
                          {copiedNumber === order.orderNumber ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <span className="text-xs text-muted">·</span>
                      <time className="text-xs text-ink-soft">{formatDate(order.createdAt)}</time>
                      <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[0.6rem] text-muted">
                        {timeAgo(order.createdAt)}
                      </span>
                    </div>

                    {/* Status badge with inline selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[0.62rem] tracking-[0.16em] uppercase text-muted">Status:</span>
                      <select
                        value={order.status.toLowerCase()}
                        disabled={updatingStatus === order.orderNumber}
                        onChange={(e) => void updateStatus(order.orderNumber, e.target.value)}
                        className={`rounded-sm border px-3 py-1.5 text-xs font-medium uppercase tracking-wider outline-none cursor-pointer transition ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                      >
                        <option value="confirmed">Confirmed / New</option>
                        <option value="processing">In Production / Packing</option>
                        <option value="dispatched">Dispatched / Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Body Details */}
                  <div className="mt-4 grid gap-6 md:grid-cols-[1.2fr_1.8fr_1fr]">
                    {/* Customer Info */}
                    <div className="space-y-2 border-b border-line pb-4 md:border-b-0 md:border-r md:pr-6">
                      <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted">Customer & Shipping</p>
                      <h4 className="font-serif text-lg text-ink font-normal">{order.customerName}</h4>
                      
                      {/* Phone & WhatsApp Contact buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <a
                          href={`tel:${order.phone}`}
                          className="inline-flex items-center gap-1.5 rounded-sm border border-line bg-cream px-2.5 py-1 text-xs text-ink hover:border-rose-light hover:bg-blush-soft"
                        >
                          📞 {order.phone}
                        </a>
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${waGreeting}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-sm bg-emerald-700 px-2.5 py-1 text-[0.64rem] font-medium tracking-wide text-white hover:bg-emerald-800"
                          >
                            <WhatsappIcon className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>

                      <div className="pt-1">
                        <a
                          href={`mailto:${order.email}`}
                          className="text-xs text-rose-deep hover:underline break-all"
                        >
                          ✉ {order.email}
                        </a>
                      </div>

                      <div className="mt-2 text-xs text-ink-soft leading-relaxed flex items-start gap-1.5 pt-1">
                        <TruckIcon className="h-3.5 w-3.5 text-rose mt-0.5 shrink-0" />
                        <div>
                          <p>{order.address}</p>
                          <p className="font-medium text-ink">
                            {order.city} {order.postalCode ? `· ${order.postalCode}` : ""} · {order.country}
                          </p>
                        </div>
                      </div>

                      {order.note && (
                        <div className="mt-3 rounded-sm border border-rose-light/70 bg-blush-soft/50 p-2.5 text-xs text-rose-deep flex items-start gap-1.5">
                          <GiftIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium block uppercase text-[0.58rem] tracking-wider">Client Note / Gift Request:</span>
                            <span className="italic">“{order.note}”</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Items ordered preview */}
                    <div className="border-b border-line pb-4 md:border-b-0 md:border-r md:pr-6">
                      <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted mb-3">
                        Purchased Pieces ({order.items.reduce((s, i) => s + i.quantity, 0)} items)
                      </p>
                      <ul className="space-y-3">
                        {order.items.map((item, idx) => (
                          <li key={item.id ?? idx} className="flex items-center gap-3">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-14 w-12 rounded-sm border border-line object-cover shrink-0"
                              />
                            ) : (
                              <div className="h-14 w-12 rounded-sm bg-blush-soft border border-line shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/product/${item.productSlug}`}
                                target="_blank"
                                className="text-xs font-serif text-ink hover:text-rose-deep truncate block font-medium"
                              >
                                {item.name}
                              </Link>
                              <p className="text-[0.62rem] uppercase tracking-wider text-muted">
                                {item.variant ? `Variant: ${item.variant}` : "Standard"} · Qty {item.quantity}
                              </p>
                              <p className="text-xs text-ink-soft">
                                {formatPrice(item.unitPrice)} each
                              </p>
                            </div>
                            <p className="text-xs font-medium text-ink shrink-0">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Financial summary & Action Buttons */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <p className="text-[0.62rem] tracking-[0.18em] uppercase text-muted mb-3">Pricing Breakdown</p>
                        <div className="space-y-1.5 text-xs text-ink-soft">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="text-ink">{formatPrice(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery</span>
                            <span className="text-ink">
                              {order.shipping === 0 ? "Free Shipping" : formatPrice(order.shipping)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-line pt-2 text-sm font-serif font-medium text-ink">
                            <span>Grand Total</span>
                            <span className="text-base text-rose-deep">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-5 space-y-2 pt-3 border-t border-line">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="w-full rounded-sm bg-rose-deep py-2 text-[0.62rem] tracking-[0.18em] uppercase text-cream transition hover:bg-rose text-center font-medium"
                        >
                          Full Order Details & Slip
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href={`/order/${order.orderNumber}`}
                            target="_blank"
                            className="rounded-sm border border-line py-1.5 text-center text-[0.6rem] tracking-[0.14em] uppercase text-ink hover:bg-blush-soft"
                          >
                            Storefront View ↗
                          </Link>
                          <button
                            onClick={() => void deleteOrder(order.orderNumber)}
                            disabled={deletingNumber === order.orderNumber}
                            className="rounded-sm border border-line py-1.5 text-center text-[0.6rem] tracking-[0.14em] uppercase text-muted hover:border-rose-light hover:text-rose-deep disabled:opacity-50"
                          >
                            {deletingNumber === order.orderNumber ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {/* Complete Order Details & Printable Packing Slip Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-ink/60 p-2 sm:p-6 backdrop-blur-sm">
          <div className="mx-auto min-h-full max-w-3xl rounded-sm border border-line bg-cream p-6 sm:p-10 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-line pb-5">
              <div>
                <p className="eyebrow">Prem by SHK · Client Order</p>
                <h3 className="mt-1 font-serif text-3xl text-ink">
                  Order {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-muted mt-1">
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="hidden sm:inline-block rounded-sm border border-line px-3 py-1.5 text-[0.62rem] tracking-[0.16em] uppercase text-ink hover:bg-blush-soft"
                >
                  🖨 Print Packing Slip
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  aria-label="Close modal"
                  className="rounded-full border border-line p-2 text-ink hover:text-rose-deep"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Status changer in modal */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 bg-blush-soft/50 p-3.5 rounded-sm border border-line">
              <span className="text-xs text-ink-soft">
                Fulfillment Status:{" "}
                <strong className="text-ink uppercase font-medium">
                  {STATUS_LABELS[selectedOrder.status.toLowerCase()]?.label || selectedOrder.status}
                </strong>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[0.6rem] tracking-wider uppercase text-muted">Change:</span>
                <select
                  value={selectedOrder.status.toLowerCase()}
                  onChange={(e) => void updateStatus(selectedOrder.orderNumber, e.target.value)}
                  className="rounded-sm border border-line bg-cream px-3 py-1 text-xs uppercase font-medium"
                >
                  <option value="confirmed">Confirmed / New</option>
                  <option value="processing">In Production / Packing</option>
                  <option value="dispatched">Dispatched / Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 border border-line rounded-sm p-5 bg-cream">
              <div>
                <h4 className="text-[0.64rem] tracking-[0.18em] uppercase text-muted">Client Information</h4>
                <p className="font-serif text-xl text-ink mt-1">{selectedOrder.customerName}</p>
                <p className="text-sm text-ink-soft mt-1">
                  <strong>Phone:</strong> {selectedOrder.phone}
                </p>
                <p className="text-sm text-ink-soft">
                  <strong>Email:</strong> {selectedOrder.email}
                </p>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="rounded-sm border border-line px-3 py-1 text-xs hover:bg-blush-soft"
                  >
                    Call Client
                  </a>
                  <a
                    href={`https://wa.me/${formatWhatsAppNumber(selectedOrder.phone)}?text=${encodeURIComponent(
                      `Assalam-o-Alaikum ${selectedOrder.customerName}!\n\nThis is Prem by SHK regarding your order ${selectedOrder.orderNumber}.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-sm bg-emerald-700 px-3 py-1 text-xs text-white hover:bg-emerald-800 flex items-center gap-1"
                  >
                    <WhatsappIcon className="h-3 w-3" /> WhatsApp
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-[0.64rem] tracking-[0.18em] uppercase text-muted">Delivery Address</h4>
                <p className="text-sm text-ink font-medium mt-1">{selectedOrder.address}</p>
                <p className="text-sm text-ink-soft">
                  {selectedOrder.city} {selectedOrder.postalCode ? `· ${selectedOrder.postalCode}` : ""}
                </p>
                <p className="text-sm text-ink-soft">{selectedOrder.country}</p>
                {selectedOrder.note && (
                  <div className="mt-3 rounded-sm border border-rose-light bg-blush-soft/60 p-2.5 text-xs text-rose-deep">
                    <strong>Client Note:</strong> {selectedOrder.note}
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mt-6">
              <h4 className="text-[0.64rem] tracking-[0.18em] uppercase text-muted mb-3">Order Items</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-[0.62rem] uppercase tracking-wider text-muted">
                      <th className="pb-2">Piece</th>
                      <th className="pb-2">Variant</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Unit Price</th>
                      <th className="pb-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {selectedOrder.items.map((it, idx) => (
                      <tr key={it.id ?? idx} className="py-3">
                        <td className="py-3 flex items-center gap-3">
                          {it.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.image} alt="" className="h-12 w-10 object-cover rounded-sm border border-line" />
                          )}
                          <div>
                            <p className="font-serif text-base text-ink">{it.name}</p>
                            <p className="text-[0.6rem] text-muted">/{it.productSlug}</p>
                          </div>
                        </td>
                        <td className="py-3 text-ink-soft">{it.variant || "Standard"}</td>
                        <td className="py-3 text-center font-medium text-ink">{it.quantity}</td>
                        <td className="py-3 text-right text-ink-soft">{formatPrice(it.unitPrice)}</td>
                        <td className="py-3 text-right font-medium text-ink">{formatPrice(it.unitPrice * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total calculations */}
              <div className="mt-5 border-t border-line pt-4 flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-ink-soft">
                    <span>Subtotal:</span>
                    <span className="text-ink">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>Shipping / Delivery:</span>
                    <span className="text-ink">
                      {selectedOrder.shipping === 0 ? "Free" : formatPrice(selectedOrder.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2 font-serif text-xl text-ink font-medium">
                    <span>Grand Total:</span>
                    <span className="text-rose-deep">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Packing slip footer */}
            <div className="mt-8 border-t border-dashed border-line pt-4 text-center text-xs text-muted flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>Prem by SHK · Luxury Fashion Jewellery · Hand-packed with love</p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-sm border border-line px-4 py-2 text-[0.62rem] tracking-wider uppercase text-ink hover:bg-blush-soft"
                >
                  Print Slip
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-sm bg-rose-deep px-4 py-2 text-[0.62rem] tracking-wider uppercase text-cream hover:bg-rose"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
