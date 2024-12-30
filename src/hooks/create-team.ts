import { CreateTeamModalProviderContext } from '@/components/layout/create-team-provider'
import { useContext } from 'react'

export const useCreateTeamModal = () => {
  const context = useContext(CreateTeamModalProviderContext)
  if (context === undefined) {
    throw new Error('useCreateTeamModal must be used within a CreateTeamModalProvider')
  }
  return context
}
