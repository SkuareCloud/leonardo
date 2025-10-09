import { client as orchestratorClient } from "@lib/api/orchestrator/client.gen"
import { createResolvePhoneMissionMissionsResolvePhoneResultsPost } from "@lib/api/orchestrator/sdk.gen"
import { NextRequest, NextResponse } from "next/server"
import { ApiService } from "../../../lib/api_service"

export async function POST(request: NextRequest) {
    const apiService = new ApiService()
    // Ensure orchestrator client is configured by instantiating ApiService
    const formData = await request.formData()

    const csvFile = formData.get("csv_file") as File | null
    const charactersCategoriesRaw = formData.get("characters_categories") as string | null
    const maxPhonesPerScenario = formData.get("max_phones_per_scenario") as string | null
    const timeBetweenScenarios = formData.get("time_between_scenarios") as string | null
    const batchSize = formData.get("batch_size") as string | null
    const batchInterval = formData.get("batch_interval") as string | null

    if (!csvFile) {
        return NextResponse.json({ error: "csv_file is required" }, { status: 400 })
    }

    const categories: string[] | undefined = charactersCategoriesRaw
        ? JSON.parse(charactersCategoriesRaw)
        : undefined

    const response = await createResolvePhoneMissionMissionsResolvePhoneResultsPost({
        client: orchestratorClient,
        body: { csv_file: csvFile },
        query: {
            characters_categories: categories,
            max_phones_per_scenario: maxPhonesPerScenario
                ? Number(maxPhonesPerScenario)
                : undefined,
            time_between_scenarios: timeBetweenScenarios ? Number(timeBetweenScenarios) : undefined,
            batch_size: batchSize ? Number(batchSize) : undefined,
            batch_interval: batchInterval ? Number(batchInterval) : undefined,
        },
    })

    if (response.error) {
        return NextResponse.json({ error: response.error }, { status: 500 })
    }
    return NextResponse.json(response.data)
}
