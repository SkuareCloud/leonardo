export function getBadgeColorByActivationSource(activationSource: string, dim: boolean = false) {
  // Hash the activation source to a color
  const hash = activationSource.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  const group = hash % 4
  return `var(--chart-${group})`
}

export function getBadgeClassNamesByActivationSource(activationSource: string, dim: boolean = false) {
  const hash = activationSource.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  const group = hash % 4
  if (group === 0) {
    return "bg-red-100"
  } else if (group === 1) {
    return "bg-blue-100"
  } else if (group === 2) {
    return "bg-green-100"
  } else if (group === 3) {
    return "bg-yellow-100"
  }
  return "bg-gray-100"
}
