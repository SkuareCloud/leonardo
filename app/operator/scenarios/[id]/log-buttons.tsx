import { Button } from "@/components/ui/button"
import { buildOpenSearchOperatorProfileLogsLink } from "@lib/opensearch-query-builder"
import { ExternalLinkIcon } from "lucide-react"

interface LogButtonsProps {
  scenarioId: string
  profileId: string
}

export function LogButtons({ scenarioId, profileId }: LogButtonsProps) {
  return (
    <>
      <Button variant="outline" asChild className="flex items-center gap-2">
        <a
          href={buildOpenSearchOperatorProfileLogsLink(profileId, scenarioId)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLinkIcon className="h-4 w-4" />
          Profile Logs
        </a>
      </Button>
    </>
  )
}
