import { prisma } from '../../config/prisma';
import { IncidentStatus, Severity } from '@prisma/client';

export class AnalyticsService {
  static async getOverview() {
    const [
      totalIncidents,
      activeIncidents,
      criticalActiveIncidents,
      resolvedIncidents,
      allServices,
      servicesWithActiveIncidents,
    ] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({
        where: {
          status: { not: IncidentStatus.RESOLVED },
        },
      }),
      prisma.incident.count({
        where: {
          status: { not: IncidentStatus.RESOLVED },
          severity: { in: [Severity.SEV_1, Severity.SEV_2] },
        },
      }),
      prisma.incident.findMany({
        where: {
          status: IncidentStatus.RESOLVED,
          resolvedAt: { not: null },
        },
        select: {
          startedAt: true,
          resolvedAt: true,
        },
      }),
      prisma.service.count(),
      prisma.incident.findMany({
        where: {
          status: { not: IncidentStatus.RESOLVED },
        },
        distinct: ['serviceId'],
        select: { serviceId: true },
      }),
    ]);

    // Calculate average resolution time in minutes: (resolvedAt - startedAt)
    let totalResolutionMinutes = 0;
    for (const inc of resolvedIncidents) {
      if (inc.resolvedAt && inc.startedAt) {
        const diffMs = inc.resolvedAt.getTime() - inc.startedAt.getTime();
        const diffMins = Math.max(0, Math.round(diffMs / (1000 * 60)));
        totalResolutionMinutes += diffMins;
      }
    }

    const averageResolutionMinutes =
      resolvedIncidents.length > 0
        ? Math.round(totalResolutionMinutes / resolvedIncidents.length)
        : 0;

    return {
      totalIncidents,
      activeIncidents,
      criticalIncidents: criticalActiveIncidents,
      servicesAffected: servicesWithActiveIncidents.length,
      totalServices: allServices,
      averageResolutionMinutes,
    };
  }

  static async getIncidentAnalytics() {
    const [bySeverityRaw, byStatusRaw, services, allIncidents] = await Promise.all([
      prisma.incident.groupBy({
        by: ['severity'],
        _count: { id: true },
      }),
      prisma.incident.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.service.findMany({
        include: {
          incidents: {
            select: { id: true, status: true, severity: true },
          },
        },
      }),
      prisma.incident.findMany({
        select: {
          id: true,
          createdAt: true,
          severity: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Format severity breakdown
    const severityMap: Record<string, number> = {
      SEV_1: 0,
      SEV_2: 0,
      SEV_3: 0,
      SEV_4: 0,
    };
    bySeverityRaw.forEach((item) => {
      severityMap[item.severity] = item._count.id;
    });

    // Format status breakdown
    const statusMap: Record<string, number> = {
      INVESTIGATING: 0,
      IDENTIFIED: 0,
      MONITORING: 0,
      RESOLVED: 0,
    };
    byStatusRaw.forEach((item) => {
      statusMap[item.status] = item._count.id;
    });

    // Format service breakdown
    const byService = services.map((svc) => ({
      serviceId: svc.id,
      serviceName: svc.name,
      totalIncidents: svc.incidents.length,
      activeIncidents: svc.incidents.filter((i) => i.status !== IncidentStatus.RESOLVED).length,
    })).sort((a, b) => b.totalIncidents - a.totalIncidents);

    // Format volume over time (group by date YYYY-MM-DD)
    const volumeMap: Record<string, number> = {};
    allIncidents.forEach((inc) => {
      const dateKey = inc.createdAt.toISOString().slice(0, 10);
      volumeMap[dateKey] = (volumeMap[dateKey] || 0) + 1;
    });

    const volumeOverTime = Object.entries(volumeMap).map(([date, count]) => ({
      date,
      count,
    }));

    return {
      bySeverity: severityMap,
      byStatus: statusMap,
      byService,
      volumeOverTime,
    };
  }
}
