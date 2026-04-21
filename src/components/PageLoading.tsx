import { Spin } from 'antd'

interface PageLoadingProps {
  tip: string
  fullScreen?: boolean
}

export function PageLoading({ tip, fullScreen = false }: PageLoadingProps) {
  return (
    <div
      className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[40vh] p-8'}`}
    >
      <Spin size="large" tip={tip} />
    </div>
  )
}
