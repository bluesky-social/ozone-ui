import { getLocalStorageData, setLocalStorageData } from '@/lib/local-storage'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const WORKSPACE_LIST_KEY = 'workspace_list'
const WORKSPACE_LIST_DELIMITER = ','
const WORKSPACE_LIST_QUERY_KEY = 'workspace-list'

// For now, these are just simple string lists stored in the localstorage of the user's browser. 
// While the use of react-query might feel like an overkill here, in the future, we may want to 
// sync these with server and for that to work we would just swap out the query or mutation fn

export const useWorkspaceList = () => {
  const { data, error, isFetching } = useQuery({
    retry: false,
    queryKey: [WORKSPACE_LIST_QUERY_KEY],
    queryFn: async () => {
      return getList()
    },
  })

  return { data, error, isFetching }
}

export const useWorkspaceAddItemsMutation = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation<string[], unknown, string[], unknown>(
    async (items) => {
      return addToList(items)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([WORKSPACE_LIST_QUERY_KEY])
      },
    },
  )

  return mutation
}

export const useWorkspaceRemoveItemsMutation = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation<string[], unknown, string[], unknown>(
    async (items) => {
      return removeFromList(items)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([WORKSPACE_LIST_QUERY_KEY])
      },
    },
  )

  return mutation
}

export const useWorkspaceEmptyMutation = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation(
    async () => {
      return emptyList()
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([WORKSPACE_LIST_QUERY_KEY])
      },
    },
  )

  return mutation
}

const getList = (): string[] => {
  const list = getLocalStorageData<string>(WORKSPACE_LIST_KEY)
  if (!list) return []
  return list.split(WORKSPACE_LIST_DELIMITER)
}

const addToList = (items: string[]) => {
  const list = getList()
  const newList = [...new Set([...list, ...items])]
  setLocalStorageData(
    WORKSPACE_LIST_KEY,
    newList.join(WORKSPACE_LIST_DELIMITER),
  )
  return newList
}

const removeFromList = (items: string[]) => {
  const list = getList()
  const newList = list.filter((item) => !items.includes(item))
  setLocalStorageData(
    WORKSPACE_LIST_KEY,
    newList.join(WORKSPACE_LIST_DELIMITER),
  )
  return newList
}

const emptyList = () => {
  setLocalStorageData(WORKSPACE_LIST_KEY, null)
  return []
}
