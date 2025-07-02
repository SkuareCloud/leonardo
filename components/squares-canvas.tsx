"use client"

import { useEffect, useRef } from "react"

interface HoveredSquare {
  x: number
  y: number
}

const SVGs = ["icons/avatar-1.svg", "icons/avatar-2.svg", "icons/avatar-3.svg"]

const Squares = ({
  direction = "right",
  speed = 1,
  borderColor = "#999",
  squareSize = 40,
  hoverFillColor = "#222",
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number | null>(null)
  const numSquaresX = useRef<number>(0)
  const numSquaresY = useRef<number>(0)
  const gridOffset = useRef({ x: 0, y: 0 })
  const hoveredSquare = useRef<HoveredSquare | null>(null)
  const preloadedSvgs = useRef<HTMLImageElement[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Preload the SVG image
    if (preloadedSvgs.current.length === 0) {
      SVGs.forEach(svg => {
        const img = new Image()
        img.src = svg
        preloadedSvgs.current.push(img)
      })
    }

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize)
          const squareY = y - (gridOffset.current.y % squareSize)

          if (
            hoveredSquare.current &&
            Math.floor((x - startX) / squareSize) === hoveredSquare.current.x &&
            Math.floor((y - startY) / squareSize) === hoveredSquare.current.y
          ) {
            ctx.fillStyle = hoverFillColor
            ctx.fillRect(squareX, squareY, squareSize, squareSize)
          }

          ctx.strokeStyle = borderColor
          ctx.strokeRect(squareX, squareY, squareSize, squareSize)

          // Draw SVG in the center of each square
          if (preloadedSvgs.current.length > 0) {
            // Calculate grid position to ensure consistent icon assignment
            const gridX = Math.floor(x / squareSize) + Math.floor(y / squareSize)
            const gridY = Math.floor(y / squareSize)
            const svgIndex = Math.abs(gridX + gridY) % preloadedSvgs.current.length
            const svgImage = preloadedSvgs.current[svgIndex]
            const svgSize = squareSize * 0.6 // Make SVG smaller to ensure it fits
            const svgX = squareX + (squareSize - svgSize) / 2
            const svgY = squareY + (squareSize - svgSize) / 2

            // Draw the SVG image using drawImage
            ctx.drawImage(svgImage, svgX, svgY, svgSize, svgSize)
          }
        }
      }

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2,
      )
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1)
      switch (direction) {
        case "right":
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize
          break
        case "left":
          gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize
          break
        case "up":
          gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize
          break
        case "down":
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize
          break
        case "diagonal":
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize
          break
        default:
          break
      }

      drawGrid()
      requestRef.current = requestAnimationFrame(updateAnimation)
    }

    // const handleMouseMove = (event: MouseEvent) => {
    //   const rect = canvas.getBoundingClientRect()
    //   const mouseX = event.clientX - rect.left
    //   const mouseY = event.clientY - rect.top

    //   const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize
    //   const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize

    //   const hoveredSquareX = Math.floor((mouseX + gridOffset.current.x - startX) / squareSize)
    //   const hoveredSquareY = Math.floor((mouseY + gridOffset.current.y - startY) / squareSize)

    //   if (
    //     !hoveredSquare.current ||
    //     hoveredSquare.current.x !== hoveredSquareX ||
    //     hoveredSquare.current.y !== hoveredSquareY
    //   ) {
    //     hoveredSquare.current = { x: hoveredSquareX, y: hoveredSquareY }
    //   }
    // }

    // const handleMouseLeave = () => {
    //   hoveredSquare.current = null
    // }

    // canvas.addEventListener("mousemove", handleMouseMove)
    // canvas.addEventListener("mouseleave", handleMouseLeave)

    requestRef.current = requestAnimationFrame(updateAnimation)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      //   canvas.removeEventListener("mousemove", handleMouseMove)
      //   canvas.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [direction, speed, borderColor, hoverFillColor, squareSize])

  return <canvas ref={canvasRef} className={`squares-canvas ${className}`}></canvas>
}

export default Squares
