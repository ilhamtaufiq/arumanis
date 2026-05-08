import { QueryClient } from '@tanstack/react-query'
import * as pekerjaanApi from '@/features/pekerjaan/api/pekerjaan'
import * as penerimaApi from '@/features/penerima/api'
import * as outputApi from '@/features/output/api/output'
import * as kontrakApi from '@/features/kontrak/api/kontrak'

/**
 * Sets up default mutation functions for offline support.
 * This allows mutations to be resumed after a page reload.
 */
export function setupMutationDefaults(queryClient: QueryClient) {
  // Pekerjaan Mutations
  queryClient.setMutationDefaults(['pekerjaan', 'create'], {
    mutationFn: (variables: any) => pekerjaanApi.createPekerjaan(variables),
  })

  queryClient.setMutationDefaults(['pekerjaan', 'update'], {
    mutationFn: (variables: { id: number; data: any }) => 
      pekerjaanApi.updatePekerjaan(variables.id, variables.data),
  })

  queryClient.setMutationDefaults(['pekerjaan', 'delete'], {
    mutationFn: (id: number) => pekerjaanApi.deletePekerjaan(id),
  })

  // Document Register Mutations
  queryClient.setMutationDefaults(['document-register', 'create'], {
    mutationFn: (variables: any) => pekerjaanApi.createDocumentRegister(variables),
  })

  queryClient.setMutationDefaults(['document-register', 'update'], {
    mutationFn: (variables: { id: number; data: any }) => 
      pekerjaanApi.updateDocumentRegister(variables.id, variables.data),
  })

  queryClient.setMutationDefaults(['document-register', 'delete'], {
    mutationFn: (id: number) => pekerjaanApi.deleteDocumentRegister(id),
  })

  // Document Type Mutations
  queryClient.setMutationDefaults(['document-type', 'create'], {
    mutationFn: (variables: any) => pekerjaanApi.createDocumentType(variables),
  })

  queryClient.setMutationDefaults(['document-type', 'update'], {
    mutationFn: (variables: { id: number; data: any }) => 
      pekerjaanApi.updateDocumentType(variables.id, variables.data),
  })

  queryClient.setMutationDefaults(['document-type', 'delete'], {
    mutationFn: (id: number) => pekerjaanApi.deleteDocumentType(id),
  })

  // Penerima Mutations
  queryClient.setMutationDefaults(['penerima', 'create'], {
    mutationFn: (variables: any) => penerimaApi.createPenerima(variables),
  })

  queryClient.setMutationDefaults(['penerima', 'update'], {
    mutationFn: (variables: { id: number; data: any }) => 
      penerimaApi.updatePenerima(variables),
  })

  queryClient.setMutationDefaults(['penerima', 'delete'], {
    mutationFn: (id: number) => penerimaApi.deletePenerima(id),
  })

  // Output Mutations
  queryClient.setMutationDefaults(['output', 'create'], {
    mutationFn: (variables: any) => outputApi.createOutput(variables),
  })

  queryClient.setMutationDefaults(['output', 'update'], {
    mutationFn: (variables: { id: number; data: any }) => 
      outputApi.updateOutput(variables.id, variables.data),
  })

  queryClient.setMutationDefaults(['output', 'delete'], {
    mutationFn: (id: number) => outputApi.deleteOutput(id),
  })

  // Kontrak Mutations
  queryClient.setMutationDefaults(['kontrak', 'create'], {
    mutationFn: (variables: any) => kontrakApi.createKontrak(variables),
  })

  queryClient.setMutationDefaults(['kontrak', 'update'], {
    mutationFn: (variables: { id: number; data: any }) => 
      kontrakApi.updateKontrak(variables.id, variables.data),
  })

  queryClient.setMutationDefaults(['kontrak', 'delete'], {
    mutationFn: (id: number) => kontrakApi.deleteKontrak(id),
  })
}
