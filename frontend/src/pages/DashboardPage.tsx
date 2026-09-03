import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';
import { incidentsApi } from '../api/incidents';
import { servicesApi } from '../api/services';
import { StatCard } from '../components/common/StatCard';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { LoadingSpinner } from '../components/common/LoadingAndEmpty';
import { ServiceStatusBadge } from '../components/common/Badge';
import {
  AlertOctagon,
  AlertTriangle,
  Server,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.getOverview(),
  });

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analytics', 'incidents'],
    queryFn: () => analyticsApi.getIncidents(),
  });

  const { data: recentData, isLoading: isRecentLoading } = useQuery({
    queryKey: ['incidents', 'recent'],
    queryFn: () => incidentsApi.list({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list(),
  });

  if (isOverviewLoading || isAnalyticsLoading) {
    return <LoadingSpinner message="Calculating real-time cluster metrics..." />;
  }

  // Format MTTR nicely
  const formatMTTR = (minutes: number) => {
    if (!minutes || minutes <= 0) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = (minutes / 60).toFixed(1);
    return `${hours}h`;
  };

  // Severity Chart Data
  const severityData = analytics
    ? [
        { name: 'SEV-1', count: analytics.bySeverity.SEV_1, color: '#ef4444' },
        { name: 'SEV-2', count: analytics.bySeverity.SEV_2, color: '#f97316' },
        { name: 'SEV-3', count: analytics.bySeverity.SEV_3, color: '#eab308' },
        { name: 'SEV-4', count: analytics.bySeverity.SEV_4, color: '#38bdf8' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-mono">
            Engineering Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and incident triage health for production infrastructure
          </p>
        </div>
      </div>

      {/* Top KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Incidents"
          value={overview?.activeIncidents ?? 0}
          subtitle="Currently open & triaging"
          highlight={overview && overview.activeIncidents > 0 ? 'red' : 'none'}
          icon={<AlertOctagon className="w-5 h-5 text-rose-400" />}
        />
        <StatCard
          title="Critical Incidents"
          value={overview?.criticalIncidents ?? 0}
          subtitle="SEV-1 & SEV-2 active outages"
          highlight={overview && overview.criticalIncidents > 0 ? 'amber' : 'none'}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
        />
        <StatCard
          title="Services Affected"
          value={`${overview?.servicesAffected ?? 0} / ${overview?.totalServices ?? 0}`}
          subtitle="Components with open incidents"
          icon={<Server className="w-5 h-5 text-sky-400" />}
        />
        <StatCard
          title="Avg Resolution Time"
          value={formatMTTR(overview?.averageResolutionMinutes ?? 0)}
          subtitle="Mean time to resolution (MTTR)"
          icon={<Clock className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incident Volume Over Time (AreaChart) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Incident Volume Over Time
              </h2>
              <p className="text-[11px] text-slate-400">Daily logged incidents history</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-56 w-full">
            {analytics?.volumeOverTime && analytics.volumeOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.volumeOverTime}>
                  <defs>
                    <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => val.slice(5)}
                  />
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
                    stroke="#818cf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#incidentGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                No historical incidents recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Incidents by Severity (BarChart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight mb-1">
              Incidents by Severity
            </h2>
            <p className="text-[11px] text-slate-400 mb-4">Total breakdown across all events</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            {severityData.some((item) => item.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500 italic">No incidents recorded yet.</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 mt-2 font-mono text-xs">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Health Snapshot */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Service Health Summary
            </h2>
            <p className="text-[11px] text-slate-400">Current status of monitored services</p>
          </div>
          <Link
            to="/services"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            Manage Services <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 italic bg-slate-950/40 rounded-lg border border-dashed border-slate-800">
            No registered services in database. Register services to monitor operational health.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center justify-between"
              >
                <div className="truncate mr-2">
                  <span className="text-xs font-semibold text-slate-200 block truncate">
                    {svc.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {svc.activeIncidentsCount || 0} active incidents
                  </span>
                </div>
                <ServiceStatusBadge status={svc.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Incidents Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Recent Incidents
            </h2>
            <p className="text-[11px] text-slate-400">Latest active and resolved alerts</p>
          </div>
          <Link
            to="/incidents"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            View All Incidents <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <IncidentTable
          incidents={recentData?.incidents || []}
          isLoading={isRecentLoading}
        />
      </div>
    </div>
  );
};
