'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Post,
  getPosts,
  savePosts,
  addPost as storeAddPost,
  updatePost as storeUpdatePost,
  deletePost as storeDeletePost,
} from '@/lib/store'

interface UseLocalStoreReturn {
  posts: Post[]
  addPost: (post: Omit<Post, 'id'>) => Post
  updatePost: (id: string, updates: Partial<Post>) => void
  deletePost: (id: string) => void
  isLoading: boolean
}

export function useLocalStore(): UseLocalStoreReturn {
  // Lazy initialization avoids set-state-in-effect lint error
  const [posts, setPosts] = useState<Post[]>(() => {
    if (typeof window !== 'undefined') {
      return getPosts()
    }
    return []
  })
  const isLoading = typeof window === 'undefined'

  const addPost = useCallback((post: Omit<Post, 'id'>): Post => {
    const newPost = storeAddPost(post)
    setPosts(getPosts())
    return newPost
  }, [])

  const updatePost = useCallback((id: string, updates: Partial<Post>): void => {
    storeUpdatePost(id, updates)
    setPosts(getPosts())
  }, [])

  const deletePost = useCallback((id: string): void => {
    storeDeletePost(id)
    setPosts(getPosts())
  }, [])

  // Keep state in sync if localStorage changes in another tab
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ce_posts') {
        setPosts(getPosts())
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Also sync on visibility change (user returns to tab)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleVisibility = () => {
      if (!document.hidden) {
        setPosts(getPosts())
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const syncPosts = useCallback(() => {
    savePosts(posts)
  }, [posts])

  // Sync on every posts change
  useEffect(() => {
    if (!isLoading && posts.length > 0) {
      syncPosts()
    }
  }, [posts, isLoading, syncPosts])

  return { posts, addPost, updatePost, deletePost, isLoading }
}
