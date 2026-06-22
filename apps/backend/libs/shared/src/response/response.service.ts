import { Injectable } from '@nestjs/common';

/**
 * 标准化 API 响应数据结构
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * 分页信息
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * 分页响应数据结构
 */
export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

/**
 * 响应工具服务 —— 提供统一的数据格式化方法
 *
 * 用法：
 * - controller 中直接 return this.responseService.success(data);
 * - 或者交给 InterceptorService 自动包装（推荐）
 */
@Injectable()
export class ResponseService {
  /**
   * 成功响应
   */
  success<T>(data: T, message = '操作成功', code = 200): ApiResponse<T> {
    return {
      code,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 失败响应（业务错误，非 HTTP 异常）
   */
  fail(message = '操作失败', code = 400): ApiResponse<null> {
    return {
      code,
      message,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 分页列表响应
   */
  paginated<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message = '查询成功',
  ): PaginatedApiResponse<T> {
    return {
      code: 200,
      message,
      data: list,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 判断返回值是否已经是标准格式（避免拦截器二次包装）
   */
  isStandardFormat(data: any): boolean {
    return (
      data !== null &&
      typeof data === 'object' &&
      'code' in data &&
      'message' in data &&
      'timestamp' in data
    );
  }
}
