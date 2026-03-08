//
//  contentMock.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Feb 1, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import type { Domain, Skill, ContentItem } from '@services/content/contentService'

export const mockDomains: Domain[] = [
  {
    id: '1',
    code: 'backend',
    name: 'Backend Development',
    description: 'Server-side development technologies and concepts'
  },
  {
    id: '2',
    code: 'frontend',
    name: 'Frontend Development',
    description: 'Client-side development technologies and frameworks'
  }
]

export const mockSkills: Skill[] = [
  {
    id: '1',
    domainId: '1',
    code: 'java',
    name: 'Java',
    description: 'Java programming language and ecosystem'
  },
  {
    id: '2',
    domainId: '1',
    code: 'spring',
    name: 'Spring Framework',
    description: 'Spring application framework'
  },
  {
    id: '3',
    domainId: '2',
    code: 'react',
    name: 'React',
    description: 'React JavaScript library'
  },
  {
    id: '4',
    domainId: '2',
    code: 'hooks',
    name: 'React Hooks',
    description: 'React Hooks for state management'
  }
]

export const mockContentItems: ContentItem[] = [
  {
    id: '1',
    skillId: '1',
    type: 'article',
    title: 'Introduction to Java',
    description: 'Basic concepts of Java programming',
    url: 'https://example.com/java-intro'
  },
  {
    id: '2',
    skillId: '1',
    type: 'video',
    title: 'Java OOP Concepts',
    description: 'Object-oriented programming in Java',
    url: 'https://example.com/java-oop'
  },
  {
    id: '3',
    skillId: '3',
    type: 'article',
    title: 'Getting Started with React',
    description: 'Introduction to React components',
    url: 'https://example.com/react-intro'
  },
  {
    id: '4',
    skillId: '4',
    type: 'video',
    title: 'Understanding useState',
    description: 'Deep dive into React useState hook',
    url: 'https://example.com/usestate'
  }
]
