import { Combobox } from "@/components/combobox"
import { AvatarModelWithProxy } from "@lib/api/avatars"
import { ScenarioWithResult } from "@lib/api/operator/types.gen"
import { InputWithLabel } from "./mission-builder-utils"

function getScenarioName(scenario: ScenarioWithResult, profiles: AvatarModelWithProxy[]) {
  if (!scenario.scenario.id) {
    return "No ID"
  }
  const profileId = scenario.scenario.profile.id
  const profile = profiles.find(profile => profile.id === profileId)
  if (!profile) {
    return "No profile"
  }
  return `${scenario.scenario.id} (${profile.data.eliza_character?.name})`
}

export function EchoMissionBuilder({
  scenarios,
  profiles,
}: {
  scenarios: Record<string, ScenarioWithResult>
  profiles: AvatarModelWithProxy[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <InputWithLabel label="Description"></InputWithLabel>
      <Combobox
        options={Object.values(scenarios).map(scenario => ({
          value: scenario.scenario.id ?? "",
          label: getScenarioName(scenario, profiles),
        }))}
      />
      {/* <SelectWithLabel label="External scenario ID">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a scenario" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(scenarios).map(scenario => (
              <SelectItem key={scenario.scenario.id} value={scenario.scenario.id ?? ""}>
                {scenario.scenario.id ?? "No ID"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SelectWithLabel> */}
    </div>
  )
}
