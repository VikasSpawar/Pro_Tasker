import Image from 'next/image'
import TaskManager from './Task_Management'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between lg:px-24 md:p-4 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500">
   <TaskManager/>
    
    </main>
  )
}
