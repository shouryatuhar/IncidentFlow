import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';
import { LoadingSpinner } from '../components/common/LoadingAndEmpty';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
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
        { name: 'SEV-4', count: analytics.bySeverity.SEV_4, color: '#64748b' },
      ]
    : [];

  // Status Chart Data
  const statusData = analytics
    ? [
        { name: 'Investigating', count: analytics.byStatus.INVESTIGATING, color: '#f59e0b' },
        { name: 'Identified', count: analytics.byStatus.IDENTIFIED, color: '#6366f1' },
        { name: 'Monitoring', count: analytics.byStatus.MONITORING, color: '#a855f7' },
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
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-1">
        <h1 className="text-base font-semibold text-[#f4f4f5] tracking-tight">
          Reliability & Analytics
        </h1>
        <p className="text-xs text-[#71717a] mt-0.5">
          Historical trends, MTTR analysis, and service outage distributions
        </p>
      </div>

      {/* Restrained Inline Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-[#0d0e11] border border-[#1f2127] rounded-[6px] divide-y lg:divide-y-0 lg:divide-x divide-[#1f2127]">
        <div className="p-3.5">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Total Incidents
            </span>
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-semibold text-[#f4f4f5] font-mono">
              {total}
            </span>
          </div>
          <p className="text-[11px] text-[#71717a] mt-0.5">All recorded events</p>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Mean Time to Resolve
            </span>
            <Clock className="w-3.5 h-3.5 text-[#34d399]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[#f4f4f5] font-mono">
              {formatMTTR(overview?.averageResolutionMinutes || 0)}
            </span>
            <span className="text-[10px] text-[#34d399] font-mono">MTTR</span>
          </div>
          <p className="text-[11px] text-[#71717a] mt-0.5">Average duration</p>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Resolution Rate
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399]" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-semibold text-[#f4f4f5] font-mono">
              {resolutionRate}%
            </span>
          </div>
          <p className="text-[11px] text-[#71717a] mt-0.5">{resolved} of {total} resolved</p>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between text-[#71717a]">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Active Investigations
            </span>
            <Activity className="w-3.5 h-3.5 text-[#fb923c]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[#f4f4f5] font-mono">
              {active}
            </span>
            {active > 0 && (
              <span className="text-[10px] text-[#f87171] font-mono">
                open
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#71717a] mt-0.5">Requiring attention</p>
        </div>
      </div>

      {/* Two Column Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-4">
          <h2 className="text-xs font-semibold text-[#f4f4f5] mb-0.5">
            Incident Status Distribution
          </h2>
          <p className="text-[11px] text-[#71717a] mb-3">
            Count by current triage lifecycle stage
          </p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111215',
                    borderColor: '#26282f',
                    borderRadius: '5px',
                    color: '#f4f4f5',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-4">
          <h2 className="text-xs font-semibold text-[#f4f4f5] mb-0.5">
            Severity Distribution
          </h2>
          <p className="text-[11px] text-[#71717a] mb-3">
            Impact classification breakdown
          </p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111215',
                    borderColor: '#26282f',
                    borderRadius: '5px',
                    color: '#f4f4f5',
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
          </div>
        </div>
      </div>

      {/* Incidents by Service Breakdown Table */}
      <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] overflow-hidden">
        <div className="p-3.5 border-b border-[#1f2127]">
          <h2 className="text-xs font-semibold text-[#f4f4f5]">
            Outage Frequency by Service
          </h2>
          <p className="text-[11px] text-[#71717a]">
            Top impacted microservices by total historical incidents
          </p>
        </div>

        {serviceData.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#71717a] font-mono">
            No service incidents recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#a1a1aa]">
              <thead className="bg-[#0d0e11] border-b border-[#1f2127] text-[11px] font-medium text-[#71717a] uppercase tracking-wider font-mono">
                <tr>
                  <th scope="col" className="px-3.5 py-2">Service Component</th>
                  <th scope="col" className="px-3.5 py-2">Total Outages</th>
                  <th scope="col" className="px-3.5 py-2">Currently Active</th>
                  <th scope="col" className="px-3.5 py-2 text-right">Relative Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17181d]">
                {serviceData.map((item) => {
                  const maxIncidents = Math.max(...serviceData.map((s) => s.total), 1);
                  const percent = Math.round((item.total / maxIncidents) * 100);

                  return (
                    <tr key={item.name} className="hover:bg-[#121316] transition-colors">
                      <td className="px-3.5 py-2.5 font-medium text-[#ededed]">
                        {item.name}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[#f4f4f5]">
                        {item.total}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono">
                        {item.active > 0 ? (
                          <span className="text-[#f87171]">{item.active} active</span>
                        ) : (
                          <span className="text-[#71717a]">0</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-right w-44">
                        <div className="w-full bg-[#15161a] border border-[#22242a] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#5e6ad2] h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
