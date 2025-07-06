import { useConfig } from 'vike-react/useConfig'
import { wrapTitle } from '@/shared/lib/wrap-title'

export async function data() {
  const config = useConfig()

  config({
    title: wrapTitle("Конфиг"),
  })

}