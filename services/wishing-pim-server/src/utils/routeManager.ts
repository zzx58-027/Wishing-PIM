import { OpenAPIRoute } from "chanfana";
import { Context } from "hono";

// 使用 fromHono 返回的类型
type OpenAPIHono = any; // 简化类型定义以避免复杂的类型推导问题

/**
 * 路由配置接口
 */
export interface RouteConfig {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  handler: typeof OpenAPIRoute;
  middleware?: any[];
}

/**
 * 路由组配置接口
 */
export interface RouteGroup {
  prefix: string;
  routes: RouteConfig[];
  middleware?: any[];
}

/**
 * 路由管理器类
 */
export class RouteManager {
  private app: OpenAPIHono;
  private registeredRoutes: Map<string, RouteConfig> = new Map();

  constructor(app: OpenAPIHono) {
    this.app = app;
  }

  /**
   * 注册单个路由
   */
  registerRoute(config: RouteConfig): void {
    const routeKey = `${config.method.toUpperCase()}:${config.path}`;
    
    if (this.registeredRoutes.has(routeKey)) {
      console.warn(`Route ${routeKey} already registered, skipping...`);
      return;
    }

    // 应用中间件
    if (config.middleware && config.middleware.length > 0) {
      this.app.use(config.path, ...config.middleware);
    }
    // // 注册路由
    // this.app[config.method](config.path, config.handler);
    // 使用正确的 chanfana 方式注册路由
    switch (config.method) {
      case 'get':
        this.app.get(config.path, config.handler);
        break;
      case 'post':
        this.app.post(config.path, config.handler);
        break;
      case 'put':
        this.app.put(config.path, config.handler);
        break;
      case 'delete':
        this.app.delete(config.path, config.handler);
        break;
      case 'patch':
        this.app.patch(config.path, config.handler);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${config.method}`);
    }
    
    this.registeredRoutes.set(routeKey, config);
    console.log(`✓ Registered route: ${config.method.toUpperCase()} ${config.path}`);
  }

  /**
   * 注册路由组
   */
  registerRouteGroup(group: RouteGroup): void {
    console.log(`📁 Registering route group: ${group.prefix}`);
    
    // 应用组级中间件
    if (group.middleware && group.middleware.length > 0) {
      this.app.use(`${group.prefix}/*`, ...group.middleware);
    }

    // 注册组内所有路由
    group.routes.forEach(route => {
      const fullPath = `${group.prefix}${route.path}`;
      this.registerRoute({
        ...route,
        path: fullPath
      });
    });
  }

  /**
   * 批量注册路由
   */
  registerRoutes(routes: RouteConfig[]): void {
    routes.forEach(route => this.registerRoute(route));
  }

  /**
   * 批量注册路由组
   */
  registerRouteGroups(groups: RouteGroup[]): void {
    groups.forEach(group => this.registerRouteGroup(group));
  }

  /**
   * 获取已注册的路由列表
   */
  getRegisteredRoutes(): RouteConfig[] {
    return Array.from(this.registeredRoutes.values());
  }

  /**
   * 打印路由信息
   */
  printRoutes(): void {
    console.log('\n📋 Registered Routes:');
    console.log('=' .repeat(50));
    
    const routes = this.getRegisteredRoutes();
    const groupedRoutes = routes.reduce((acc, route) => {
      const pathParts = route.path.split('/');
      const group = pathParts[1] || 'root';
      if (!acc[group]) acc[group] = [];
      acc[group].push(route);
      return acc;
    }, {} as Record<string, RouteConfig[]>);

    Object.entries(groupedRoutes).forEach(([group, routes]) => {
      console.log(`\n📂 ${group}:`);
      routes.forEach(route => {
        console.log(`  ${route.method.toUpperCase().padEnd(6)} ${route.path}`);
      });
    });
    
    console.log('\n' + '=' .repeat(50));
  }
}

/**
 * 自动扫描并注册端点的工具函数
 */
export async function autoRegisterEndpoints(
  routeManager: RouteManager,
  endpointsPath: string,
  options: {
    prefix?: string;
    middleware?: any[];
    exclude?: string[];
  } = {}
): Promise<void> {
  try {
    // 动态导入端点模块
    const endpointModule = await import(endpointsPath);
    
    const routes: RouteConfig[] = [];
    
    // 遍历导出的类，自动生成路由配置
    Object.entries(endpointModule).forEach(([name, EndpointClass]) => {
      if (options.exclude?.includes(name)) return;
      
      // 根据类名生成路径和方法
      const { path, method } = generateRouteFromClassName(name);
      
      routes.push({
        path,
        method,
        handler: EndpointClass as typeof OpenAPIRoute,
        middleware: options.middleware
      });
    });

    // 如果有前缀，作为路由组注册
    if (options.prefix) {
      routeManager.registerRouteGroup({
        prefix: options.prefix,
        routes,
        middleware: options.middleware
      });
    } else {
      routeManager.registerRoutes(routes);
    }
  } catch (error) {
    console.error(`Failed to auto-register endpoints from ${endpointsPath}:`, error);
  }
}

/**
 * 根据类名生成路由路径和方法
 */
function generateRouteFromClassName(className: string): { path: string; method: 'get' | 'post' | 'put' | 'delete' | 'patch' } {
  // 默认方法映射
  const methodMap: Record<string, 'get' | 'post' | 'put' | 'delete' | 'patch'> = {
    'get': 'get',
    'list': 'get',
    'fetch': 'get',
    'create': 'post',
    'add': 'post',
    'update': 'put',
    'edit': 'put',
    'modify': 'put',
    'delete': 'delete',
    'remove': 'delete',
    'patch': 'patch'
  };

  // 将驼峰命名转换为kebab-case
  const kebabCase = className
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

  // 尝试从类名中提取方法
  let method: 'get' | 'post' | 'put' | 'delete' | 'patch' = 'post'; // 默认为post
  let path = `/${kebabCase}`;

  for (const [key, value] of Object.entries(methodMap)) {
    if (className.toLowerCase().includes(key)) {
      method = value;
      // 从路径中移除方法名
      path = path.replace(new RegExp(`-?${key}`, 'i'), '');
      break;
    }
  }

  // 清理路径
  path = path.replace(/^-+|-+$/g, '').replace(/-+/g, '-');
  if (!path.startsWith('/')) path = `/${path}`;
  if (path === '/') path = '/index';

  return { path, method };
}

/**
 * 创建路由管理器实例的工厂函数
 */
export function createRouteManager(app: OpenAPIHono): RouteManager {
  return new RouteManager(app);
}