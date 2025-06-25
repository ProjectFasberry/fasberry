import { ReactNode } from "react"

export const Tooltip = ({ trigger, content }: { trigger: ReactNode, content: ReactNode }) => {
  return (
    <div className="tooltip tooltip-left">
      <button className="btn p-0 w-full">
        {trigger}
      </button>
      <div className="tooltip-content">
        {content}
      </div>
    </div>
  )
}
