'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateWORedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/production/wo/new')
  }, [router])
  return null
}
