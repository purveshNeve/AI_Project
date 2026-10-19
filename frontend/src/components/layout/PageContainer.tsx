import type { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './sidebar'

export interface PageContainerProps {
  children: ReactNode
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-[#F7F3EE] text-[#2F241F] flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 w-full">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full transition-all">
          {children}
        </main>
      </div>
    </div>
  )
}
