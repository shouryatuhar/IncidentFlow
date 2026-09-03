import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';
import { StatCard } from '../components/common/StatCard';
import { LoadingSpinner } from '../components/common/LoadingAndEmpty';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { BarChart3, Activity, Clock, CheckCircle2 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.getOverview(),
  });

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analytics', 'incidents'],
    queryFn: () => analyticsApi.getIncidents(),
  });

  if (isOverviewLoading || isAnalyticsLoading) {
    return <LoadingSpinner message="Aggregating cluster reliability metrics..." />;
  }

  // MTTR
  const formatMTTR = (minutes: number) => {
    if (!minutes || minutes <= 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = (minutes / 60).toFixed(1);
    return `${hours}h`;
  };

  const total = overview?.totalIncidents || 0;
  const active = overview?.activeIncidents || 0;
  const resolved = total - active;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  // Severity Chart Data
  const severityData = analytics
    ? [
        { name: 'SEV-1', count: analytics.bySeverity.SEV_1, color: '#ef4444' },
        { name: 'SEV-2', count: analytics.bySeverity.SEV_2, color: '#f97316' },
        { name: 'SEV-3', count: analytics.bySeverity.SEV_3, color: '#eab308' },
        { name: 'SEV-4', count: analytics.bySeverity.SEV_4, color: '#38bdf8' },
      ]
    : [];

  // Status Chart Data
  const statusData = analytics
    ? [
        { name: 'Investigating', count: analytics.byStatus.INVESTIGATING, color: '#f43f5e' },
        { name: 'Identified', count: analytics.byStatus.IDENTIFIED, color: '#f59e0b' },
        { name: 'Monitoring', count: analytics.byStatus.MONITORING, color: '#0ea5e9' },
        { name: 'Resolved', count: analytics.byStatus.RESOLVED, color: '#10b981' },
      ]
    : [];

  // Service Breakdown Data (top 8)
  const serviceData = (analytics?.byService || []).slice(0, 8).map((s) => ({
    name: s.serviceName,
    total: s.totalIncidents,
    active: s.activeIncidents,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight font-mono">
          System Reliability & Incident Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical trends, MTTR analysis, and service outage distributions
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Incidents"
          value={total}
          subtitle="All recorded events"
          icon={<BarChart3 className="w-5 h-5 text-indigo-400" />}
        />
        <StatCard
          title="Mean Time to Resolve (MTTR)"
          value={formatMTTR(overview?.averageResolutionMinutes || 0)}
          subtitle="Average time (resolvedAt - startedAt)"
          highlight="emerald"
          icon={<Clock className="w-5 h-5 text-emerald-400" />}
        />
        <StatCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          subtitle={`${resolved} resolved out of ${total}`}
          icon={<CheckCircle2 className="w-5 h-5 text-sky-400" />}
        />
        <StatCard
          title="Active Triage"
          value={active}
          subtitle="Unresolved incidents"
          highlight={active > 0 ? 'amber' : 'none'}
          icon={<Activity className="w-5 h-5 text-amber-400" />}
        />
      </div>

      {/* Charts Row 1: Volume Over Time */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Incident Frequency Over Time
          </h2>
          <p className="text-[11px] text-slate-400">Incident creation rate aggregated daily</p>
        </div>

        <div className="h-64 w-full">
          {analytics?.volumeOverTime && analytics.volumeOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.volumeOverTime}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Incidents"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#analyticsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
              No historical incident data available.
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2: Incidents by Service, Incidents by Severity, Incidents by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incidents by Service */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Incidents by Service
            </h2>
            <p className="text-[11px] text-slate-400">Services with the highest incident count</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {serviceData.length > 0 && serviceData.some((s) => s.total > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceData} layout="vertical" margin={{ left: 20, right: 10 }}>
                  <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    width={90}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" name="Total Incidents" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500 italic">No incidents recorded yet.</span>
            )}
          </div>
        </div>

        {/* Incidents by Severity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Incidents by Severity
            </h2>
            <p className="text-[11px] text-slate-400">Impact level breakdown</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {severityData.some((s) => s.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`sev-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500 italic">No incidents recorded yet.</span>
            )}
          </div>
        </div>

        {/* Incidents by Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Incidents by Status
            </h2>
            <p className="text-[11px] text-slate-400">Current lifecycle states</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {statusData.some((s) => s.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500 italic">No incidents recorded yet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
