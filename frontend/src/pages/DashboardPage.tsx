import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';
import { incidentsApi } from '../api/incidents';
import { servicesApi } from '../api/services';
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
import { useAuth } from '../context/AuthContext';
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
  const { user } = useAuth();
  const { data: overview, isLoading: isOverviewLoading, dataUpdatedAt } = useQuery({
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
  const isDemoAccount = user?.email.endsWith('@incidentflow.dev') ?? false;

  if (isOverviewLoading || isAnalyticsLoading) {
    return <LoadingSpinner message="Calculating real-time cluster metrics..." />;
  }

  // Format MTTR nicely
  const formatMTTR = (minutes: number) => {
    if (!minutes || minutes <= 0) return '0m';
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
        { name: 'SEV-4', count: analytics.bySeverity.SEV_4, color: '#64748b' },
      ]
    : [];

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h1 className="text-base font-semibold text-[#e8ebe4] tracking-tight">
            Overview
          </h1>
          <p className="text-xs text-[#818b7e] mt-0.5">
            Incident triage health and reliability signals across your services
          </p>
        </div>
        {dataUpdatedAt > 0 && (
          <p className="text-[11px] text-[#818b7e]" aria-live="polite">
            Metrics refreshed {new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {isDemoAccount && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-[#3c453a] bg-[#191d19] px-3 py-2 text-xs text-[#c6cdc1]" role="status">
          <span className="font-medium text-[#e8ebe4]">Demo workspace</span>
          <span>Sample incidents are provided for evaluation; they are not live production telemetry.</span>
        </div>
      )}

      {/* Restrained Inline Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-[#191d19] border border-[#30372f] rounded-[6px] divide-y lg:divide-y-0 lg:divide-x divide-[#30372f]">
        {/* Active Incidents */}
        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#818b7e]">
              Active Incidents
            </span>
            <AlertOctagon className="w-3.5 h-3.5 text-[#f87171]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[#e8ebe4] font-mono">
              {overview?.activeIncidents ?? 0}
            </span>
            {overview && overview.activeIncidents > 0 && (
              <span className="text-[10px] text-[#f87171] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                investigating
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#818b7e] mt-0.5">Currently open & triaging</p>
        </div>

        {/* Critical Incidents */}
        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#818b7e]">
              Critical Incidents
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#fb923c]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[#e8ebe4] font-mono">
              {overview?.criticalIncidents ?? 0}
            </span>
            <span className="text-[10px] text-[#818b7e] font-mono">SEV-1 / SEV-2</span>
          </div>
          <p className="text-[11px] text-[#818b7e] mt-0.5">Major outages</p>
        </div>

        {/* Services Affected */}
        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#818b7e]">
              Services Affected
            </span>
            <Server className="w-3.5 h-3.5 text-[#818b7e]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[#e8ebe4] font-mono">
              {overview?.servicesAffected ?? 0}
              <span className="text-xs text-[#818b7e] font-normal"> / {overview?.totalServices ?? 0}</span>
            </span>
          </div>
          <p className="text-[11px] text-[#818b7e] mt-0.5">Monitored components</p>
        </div>

        {/* Avg Resolution Time (MTTR) */}
        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#818b7e]">
              Avg Resolution Time
            </span>
            <Clock className="w-3.5 h-3.5 text-[#34d399]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[#e8ebe4] font-mono">
              {formatMTTR(overview?.averageResolutionMinutes ?? 0)}
            </span>
            <span className="text-[10px] text-[#34d399] font-mono">MTTR</span>
          </div>
          <p className="text-[11px] text-[#818b7e] mt-0.5">Resolved incidents average</p>
        </div>
      </div>

      {/* Operational Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Incident Volume Over Time (AreaChart) */}
        <div className="lg:col-span-2 bg-[#191d19] border border-[#30372f] rounded-[6px] p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs font-semibold text-[#e8ebe4]">
                Incident Volume Over Time
              </h2>
              <p className="text-[11px] text-[#818b7e]">Daily logged incidents history</p>
            </div>
            <TrendingUp className="w-3.5 h-3.5 text-[#818b7e]" />
          </div>

          <div className="h-44 w-full">
            {analytics?.volumeOverTime && analytics.volumeOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.volumeOverTime}>
                  <defs>
                    <linearGradient id="incidentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a2aa83" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#a2aa83" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#667061"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis stroke="#667061" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#202520',
                      borderColor: '#343c32',
                      borderRadius: '5px',
                      color: '#e8ebe4',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Incidents"
                    stroke="#a2aa83"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#incidentGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#818b7e] italic font-mono">
                No historical incidents recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Incidents by Severity (BarChart) */}
        <div className="bg-[#191d19] border border-[#30372f] rounded-[6px] p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold text-[#e8ebe4] mb-0.5">
              Incidents by Severity
            </h2>
            <p className="text-[11px] text-[#818b7e] mb-2">Total breakdown across all events</p>
          </div>

          <div className="h-32 w-full flex items-center justify-center">
            {severityData.some((item) => item.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#667061" fontSize={10} tickLine={false} />
                  <YAxis stroke="#667061" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#202520',
                      borderColor: '#343c32',
                      borderRadius: '5px',
                      color: '#e8ebe4',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-[#818b7e] italic font-mono">No incidents recorded yet.</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#30372f] mt-2 font-mono text-[11px]">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[#a5aea0]">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-[#e8ebe4]">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Health Snapshot */}
      <div className="bg-[#191d19] border border-[#30372f] rounded-[6px] p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-semibold text-[#e8ebe4]">
              Service Health Summary
            </h2>
            <p className="text-[11px] text-[#818b7e]">Current status of monitored services</p>
          </div>
          <Link
            to="/services"
            className="text-xs text-[#dce1d8] hover:underline flex items-center gap-1 font-medium"
          >
            Manage Services <ArrowRight className="w-3 h-3 text-[#818b7e]" />
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#818b7e] font-mono bg-[#111411] rounded-[5px] border border-[#30372f]">
            No registered services in database. Register services to monitor operational health.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="p-2.5 bg-[#111411] border border-[#30372f] rounded-[5px] flex items-center justify-between hover:border-[#3c453a] transition-colors"
              >
                <div className="truncate mr-2">
                  <span className="text-xs font-medium text-[#dce1d8] block truncate">
                    {svc.name}
                  </span>
                  <span className="text-[10px] text-[#818b7e] font-mono">
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
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-[#e8ebe4]">
              Recent Incidents
            </h2>
            <p className="text-[11px] text-[#818b7e]">Latest active and resolved alerts</p>
          </div>
          <Link
            to="/incidents"
            className="text-xs text-[#dce1d8] hover:underline flex items-center gap-1 font-medium"
          >
            View All Incidents <ArrowRight className="w-3 h-3 text-[#818b7e]" />
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
