import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [trendWindow, setTrendWindow] = useState('all');
  const navigate = useNavigate();
  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.getOverview(),
  });

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['analytics', 'incidents'],
    queryFn: () => analyticsApi.getIncidents(),
  });

  const volumeData = useMemo(() => {
    const data = analytics?.volumeOverTime || [];
    if (trendWindow === 'all') return data;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(trendWindow));
    return data.filter((point) => new Date(`${point.date}T00:00:00`).getTime() >= cutoff.getTime());
  }, [analytics?.volumeOverTime, trendWindow]);

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
        { name: 'Identified', count: analytics.byStatus.IDENTIFIED, color: '#899477' },
        { name: 'Monitoring', count: analytics.byStatus.MONITORING, color: '#899477' },
        { name: 'Resolved', count: analytics.byStatus.RESOLVED, color: '#10b981' },
      ]
    : [];

  // Service Breakdown Data (top 8)
  const serviceData = (analytics?.byService || []).slice(0, 8).map((s) => ({
    serviceId: s.serviceId,
    name: s.serviceName,
    total: s.totalIncidents,
    active: s.activeIncidents,
  }));
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-1">
        <h1 className="text-base font-semibold text-[#e8ebe4] tracking-tight">
          Reliability & Analytics
        </h1>
        <p className="text-xs text-[#818b7e] mt-0.5">
          Historical incident trends, resolution performance, and service impact
        </p>
      </div>

      {/* Restrained Inline Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-[#191d19] border border-[#30372f] rounded-[6px] divide-y lg:divide-y-0 lg:divide-x divide-[#30372f]">
        <div className="p-3.5">
          <div className="flex items-center justify-between text-[#818b7e]">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Total Incidents
            </span>
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-semibold text-[#e8ebe4] font-mono">
              {total}
            </span>
          </div>
          <p className="text-[11px] text-[#818b7e] mt-0.5">All recorded events</p>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between text-[#818b7e]">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Mean Time to Resolve
            </span>
            <Clock className="w-3.5 h-3.5 text-[#34d399]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[#e8ebe4] font-mono">
              {formatMTTR(overview?.averageResolutionMinutes || 0)}
            </span>
            <span className="text-[10px] text-[#34d399] font-mono">MTTR</span>
          </div>
          <p className="text-[11px] text-[#818b7e] mt-0.5">Average duration</p>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between text-[#818b7e]">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Resolution Rate
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399]" />
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-semibold text-[#e8ebe4] font-mono">
              {resolutionRate}%
            </span>
          </div>
          <p className="text-[11px] text-[#818b7e] mt-0.5">{resolved} of {total} resolved</p>
        </div>

        <div className="p-3.5">
          <div className="flex items-center justify-between text-[#818b7e]">
            <span className="text-[11px] font-medium uppercase tracking-wider">
              Active Investigations
            </span>
            <Activity className="w-3.5 h-3.5 text-[#fb923c]" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[#e8ebe4] font-mono">
              {active}
            </span>
            {active > 0 && (
              <span className="text-[10px] text-[#f87171] font-mono">
                open
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#818b7e] mt-0.5">Requiring attention</p>
        </div>
      </div>

      <section className="bg-[#191d19] border border-[#30372f] rounded-[6px] p-4" aria-labelledby="incident-trend-title">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <h2 id="incident-trend-title" className="text-xs font-semibold text-[#e8ebe4]">Incident frequency</h2>
            <p className="text-[11px] text-[#818b7e]">Daily incidents created · metric cards above show all time</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-[#a5aea0]">
            <span>Trend window</span>
            <select value={trendWindow} onChange={(event) => setTrendWindow(event.target.value)} className="h-8 rounded border border-[#30372f] bg-[#111411] px-2 text-[#e8ebe4] focus:outline-none focus:ring-2 focus:ring-[#a2aa83]">
              <option value="all">All available history</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </label>
        </div>
        {volumeData.length ? (
          <div className="h-52 w-full" role="img" aria-label={`Incident frequency trend with ${volumeData.length} daily data points`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#667061" fontSize={10} tickLine={false} tickFormatter={(value) => String(value).slice(5)} />
                <YAxis stroke="#667061" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#202520', borderColor: '#3c453a', borderRadius: '5px', color: '#e8ebe4', fontSize: '11px' }} />
                <Bar dataKey="count" name="Incidents" fill="#a2aa83" radius={[3, 3, 0, 0]} cursor="pointer" onClick={(entry: any) => {
                  const date = String(entry?.date || entry?.payload?.date || '');
                  if (date) navigate(`/incidents?startDate=${date}&endDate=${date}`);
                }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <p className="py-10 text-center text-xs text-[#818b7e]">No incidents in this window. Choose a wider range to see older records.</p>}
        <p className="sr-only">Daily incident counts: {volumeData.map((point) => `${point.date}: ${point.count}`).join(', ') || 'no incidents in selected range'}.</p>
      </section>

      {/* Two Column Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="bg-[#191d19] border border-[#30372f] rounded-[6px] p-4">
          <h2 className="text-xs font-semibold text-[#e8ebe4] mb-0.5">
            Incident Status Distribution
          </h2>
          <p className="text-[11px] text-[#818b7e] mb-3">
            Select a bar to open matching incidents
          </p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
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
                <Bar dataKey="count" radius={[2, 2, 0, 0]} cursor="pointer" onClick={(entry: any) => {
                  const name = String(entry?.name || entry?.payload?.name || '');
                  const status = name.toUpperCase().replace(/ /g, '_');
                  if (status) navigate(`/incidents?status=${status}`);
                }}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 border-t border-[#30372f] pt-2" aria-label="Filter incidents by status">
            {statusData.map((item) => (
              <button key={item.name} type="button" onClick={() => navigate(`/incidents?status=${item.name.toUpperCase().replace(/ /g, '_')}`)} className="flex justify-between rounded px-2 py-1 text-xs text-[#a5aea0] hover:bg-[#252b25] focus-visible:ring-2 focus-visible:ring-[#a2aa83]">
                <span>{item.name}</span><span className="font-mono text-[#e8ebe4]">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-[#191d19] border border-[#30372f] rounded-[6px] p-4">
          <h2 className="text-xs font-semibold text-[#e8ebe4] mb-0.5">
            Severity Distribution
          </h2>
          <p className="text-[11px] text-[#818b7e] mb-3">
            Select a bar to open matching incidents
          </p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
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
                <Bar dataKey="count" radius={[2, 2, 0, 0]} cursor="pointer" onClick={(entry: any) => {
                  const name = String(entry?.name || entry?.payload?.name || '');
                  const severity = name.replace('-', '_');
                  if (severity) navigate(`/incidents?severity=${severity}`);
                }}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 border-t border-[#30372f] pt-2" aria-label="Filter incidents by severity">
            {severityData.map((item) => (
              <button key={item.name} type="button" onClick={() => navigate(`/incidents?severity=${item.name.replace('-', '_')}`)} className="flex justify-between rounded px-2 py-1 text-xs text-[#a5aea0] hover:bg-[#252b25] focus-visible:ring-2 focus-visible:ring-[#a2aa83]">
                <span>{item.name}</span><span className="font-mono text-[#e8ebe4]">{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents by Service Breakdown Table */}
      <div className="bg-[#191d19] border border-[#30372f] rounded-[6px] overflow-hidden">
        <div className="p-3.5 border-b border-[#30372f]">
          <h2 className="text-xs font-semibold text-[#e8ebe4]">
            Outage Frequency by Service
          </h2>
          <p className="text-[11px] text-[#818b7e]">
            Top impacted microservices by total historical incidents
          </p>
        </div>

        {serviceData.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#818b7e] font-mono">
            No service incidents recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#a5aea0]">
              <thead className="bg-[#191d19] border-b border-[#30372f] text-[11px] font-medium text-[#818b7e] uppercase tracking-wider font-mono">
                <tr>
                  <th scope="col" className="px-3.5 py-2">Service Component</th>
                  <th scope="col" className="px-3.5 py-2">Total Outages</th>
                  <th scope="col" className="px-3.5 py-2">Currently Active</th>
                  <th scope="col" className="px-3.5 py-2 text-right">Relative Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252b24]">
                {serviceData.map((item) => {
                  const maxIncidents = Math.max(...serviceData.map((s) => s.total), 1);
                  const percent = Math.round((item.total / maxIncidents) * 100);

                  return (
                    <tr key={item.name} className="hover:bg-[#121316] transition-colors">
                      <td className="px-3.5 py-2.5 font-medium text-[#dce1d8]">
                        <button onClick={() => navigate(`/incidents?serviceId=${encodeURIComponent(item.serviceId)}`)} className="text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a2aa83] rounded" aria-label={`View incidents for ${item.name}`}>
                          {item.name}
                        </button>
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[#e8ebe4]">
                        {item.total}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono">
                        {item.active > 0 ? (
                          <span className="text-[#f87171]">{item.active} active</span>
                        ) : (
                          <span className="text-[#818b7e]">0</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-right w-44">
                        <div className="w-full bg-[#252b25] border border-[#2e352d] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#a2aa83] h-full rounded-full"
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
