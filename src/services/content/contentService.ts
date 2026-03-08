//
//  contentService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Feb 1, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'
import { mockDomains, mockSkills, mockContentItems } from '@mocks/content/contentMock'

export interface Domain {
  id: string
  code: string
  name: string
  description: string
}

export interface Skill {
  id: string
  domainId: string
  code: string
  name: string
  description: string
}

export interface ContentItem {
  id: string
  skillId: string
  type: string
  title: string
  description: string
  url?: string
}

// Backend API functions
const getDomainsAPI = async (): Promise<Domain[]> => {
  return httpClient.get<Domain[]>('/content/domains')
}

const getSkillsAPI = async (domainId?: string): Promise<Skill[]> => {
  const params = domainId ? `?domainId=${domainId}` : ''
  return httpClient.get<Skill[]>(`/content/skills${params}`)
}

const getContentItemsAPI = async (skillId?: string, type?: string): Promise<ContentItem[]> => {
  const params = new URLSearchParams()
  if (skillId) params.append('skillId', skillId)
  if (type) params.append('type', type)
  const queryString = params.toString()
  return httpClient.get<ContentItem[]>(`/content/content-items${queryString ? '?' + queryString : ''}`)
}

// Mock functions
const getDomainsMock = async (): Promise<Domain[]> => {
  await new Promise(r => setTimeout(r, 300))
  return mockDomains
}

const getSkillsMock = async (domainId?: string): Promise<Skill[]> => {
  await new Promise(r => setTimeout(r, 300))
  return domainId 
    ? mockSkills.filter((s: Skill) => s.domainId === domainId)
    : mockSkills
}

const getContentItemsMock = async (skillId?: string, type?: string): Promise<ContentItem[]> => {
  await new Promise(r => setTimeout(r, 300))
  let items = mockContentItems
  if (skillId) items = items.filter((i: ContentItem) => i.skillId === skillId)
  if (type) items = items.filter((i: ContentItem) => i.type === type)
  return items
}

// Export adapter functions
export const getDomains = USE_REAL_API ? getDomainsAPI : getDomainsMock
export const getSkills = USE_REAL_API ? getSkillsAPI : getSkillsMock
export const getContentItems = USE_REAL_API ? getContentItemsAPI : getContentItemsMock
