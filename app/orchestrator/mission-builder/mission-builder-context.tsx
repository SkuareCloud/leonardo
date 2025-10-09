import { MissionType } from "@lib/api/models"
import { MissionCreate } from "@lib/api/orchestrator"
import { createContext } from "react"

export type OnChangeMissionPayloadCallback = (payload: Partial<MissionCreate>) => void

export const MissionBuilderContext = createContext<{
    missionType: MissionType
    onChangeMissionPayload: OnChangeMissionPayloadCallback
}>({
    missionType: "RandomDistributionMission",
    onChangeMissionPayload: () => {},
})
