import request from '@/utils/request'
import type { selectUserFormData, userListReponseData } from './type'

enum API {
  ADD_USER = '/system/user/add',
  DELETE_USER = 'system/user/delete',
  UPDATE_USER = '/system/user/update',
  LIST_URL = '/system/user/list',
  DETAIL = 'system/user/detail',
}

export const reqAddUser = (data: any) =>
  request.post<any, any>(API.ADD_USER, data)

export const reqDeleteUser = (data: any) =>
  request.post<any, any>(API.DELETE_USER, data)

export const reqUpdateUser = (data: any) =>
  request.post<any, any>(API.UPDATE_USER, data)

export const reqListUser = (params: selectUserFormData) =>
  request.get<any, userListReponseData>(API.LIST_URL, { params })

export const reqDetailUser = (params: any) =>
  request.get<any, any>(API.DETAIL, { params })
