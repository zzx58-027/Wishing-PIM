import { RouteGroup } from '../utils/routeManager';
import * as pooleFtpEndpoints from '../endpoints/poole-ftp/index';

/**
 * 路由配置 - 集中管理所有路由
 */
export const routeGroups: RouteGroup[] = [
  {
    prefix: '/poole-ftp',
    routes: [
      {
        path: '/get-files-list',
        method: 'post',
        handler: pooleFtpEndpoints.GetFilesList
      },
      {
        path: '/get-files-download-url',
        method: 'post',
        handler: pooleFtpEndpoints.GetFilesDownloadUrl
      }
    ]
  }
];

/**
 * 单独的路由配置（不属于任何组）
 */
export const standaloneRoutes = [
  // {
  //   path: '/health',
  //   method: 'get' as const,
  //   handler: HealthCheck
  // }
];

/**
 * 获取所有路由的统计信息
 */
export function getRouteStats() {
  const groupRouteCount = routeGroups.reduce((total, group) => total + group.routes.length, 0);
  const standaloneRouteCount = standaloneRoutes.length;
  
  return {
    totalGroups: routeGroups.length,
    totalRoutes: groupRouteCount + standaloneRouteCount,
    groupRoutes: groupRouteCount,
    standaloneRoutes: standaloneRouteCount,
    groups: routeGroups.map(group => ({
      prefix: group.prefix,
      routeCount: group.routes.length,
      routes: group.routes.map(route => `${route.method.toUpperCase()} ${group.prefix}${route.path}`)
    }))
  };
}