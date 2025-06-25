import rison from "rison"
import { read_server_env } from "./server-env"

export const buildOpenSearchFilter = (
  key: string,
  value: string | boolean,
  alias: string | null = null,
  disabled: boolean = false,
  negate: boolean = false,
): {
  meta: {
    alias: string | null
    disabled: boolean
    negate: boolean
    key: string
    value: string
    type: string
  }
  query?: {}
  exists?: {}
} => {
  if (typeof value === "boolean") {
    return {
      meta: {
        alias,
        disabled,
        negate,
        key,
        value: String(value),
        type: "exists",
      },
      exists: {
        field: key,
      },
    }
  }

  return {
    meta: {
      alias,
      disabled,
      negate,
      key,
      value: String(value),
      type: "phrase",
    },
    query: {
      match_phrase: {
        [key]: value,
      },
    },
  }
}
export const buildOpenSearchLink = ({
  filters,
  columns = ["level", "thread", "logger", "msg"],
}: {
  filters: {
    meta: {
      alias: string | null
      disabled: boolean
      negate: boolean
      key: string
      value: string
      type: string
    }
    query?: {}
    exists?: {}
  }[]
  columns?: string[]
}) => {
  const { opensearchBaseUrl, opensearchIndexPatternId } = read_server_env()
  const _g = {
    filters: [],
    refreshInterval: { pause: true, value: 3000 },
    time: { from: "now-24h", to: "now" },
  }

  const _a = {
    discover: {
      columns,
    },
    metadata: {
      indexPattern: opensearchIndexPatternId,
      view: "discover",
    },
  }

  const _q = {
    filters,
    query: {
      language: "kuery",
      query: "",
    },
  }

  const base = `${opensearchBaseUrl}/_dashboards/app/data-explorer/discover/#`

  const url = `${base}?_g=${encodeURIComponent(rison.encode(_g))}&_a=${encodeURIComponent(
    rison.encode(_a),
  )}&_q=${encodeURIComponent(rison.encode(_q))}`

  return url
}

export const buildOpenSearchOperatorProfileLogsLink = (profileId: string) => {
  return buildOpenSearchLink({
    filters: [
      buildOpenSearchFilter("level", `DEBUG`, "Debug Logs", false, true),
      buildOpenSearchFilter("thread", `AsyncWorker-${profileId}`, `Avatar ${profileId}`),
      buildOpenSearchFilter("rsrq", false, `No RSRQ`, false, true),
    ],
  })
}
