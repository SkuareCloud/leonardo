"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { logger } from "@lib/logger"
import { ServiceBrowserClient } from "@lib/service-browser-client"
import { cn } from "@lib/utils"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Loader2, XIcon } from "lucide-react"
import { useRef, useState } from "react"

interface ActivationDialogProps {
    network: string
    avatarId: string
    onActivationComplete: () => Promise<void>
}

// Custom DialogContent with higher z-index
function CustomDialogContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean
}) {
    return (
        <DialogPortal>
            <DialogOverlay className="z-[9998]" />
            <DialogPrimitive.Content
                className={cn(
                    "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 pointer-events-auto fixed top-[50%] left-[50%] z-[9999] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
                    className,
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    )
}

export function ActivationDialog({
    network,
    avatarId,
    onActivationComplete,
}: ActivationDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [activationStatus, setActivationStatus] = useState<string | null>(null)
    const [isPolling, setIsPolling] = useState(false)
    const [activationError, setActivationError] = useState<string | null>(null)
    const [activationType, setActivationType] = useState("otp")
    const [isWaitingForOtp, setIsWaitingForOtp] = useState(false)
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [isSubmittingOtp, setIsSubmittingOtp] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [hasSubmittedOtp, setHasSubmittedOtp] = useState(false)
    const [shouldOverride, setShouldOverride] = useState(false)

    // Refs for form elements
    const sessionDataRef = useRef<HTMLTextAreaElement>(null)

    const pollStatus = async () => {
        try {
            logger.info(`Polling activation status for ${avatarId}...`)
            const status = await new ServiceBrowserClient().getActivationStatus(avatarId)
            logger.info(`Received activation status: ${status} for ${avatarId}`)
            setActivationStatus(status)
            setLastUpdated(new Date())

            // Check if we need to wait for OTP input
            if (status === "WAITING_FOR_OTP" && !hasSubmittedOtp) {
                logger.info(`Waiting for OTP input for ${avatarId}`)
                setIsWaitingForOtp(true)
                setIsPolling(false) // Stop polling until OTP is submitted
                return
            }

            // Check for final states
            if (
                status === "SUCCESS" ||
                status === "LOGIN_VERIFICATION_FAILED" ||
                status === "FAILED"
            ) {
                logger.info(`Activation reached final state: ${status} for ${avatarId}`)
                setIsPolling(false)
                setIsWaitingForOtp(false)
                if (status === "SUCCESS") {
                    // Refresh avatar data to show updated status
                    await onActivationComplete()
                }
            } else {
                // Continue polling for intermediate states
                logger.info(
                    `Continuing to poll in 2 seconds for ${avatarId}, current status: ${status}`,
                )
                setTimeout(pollStatus, 2000) // Poll every 2 seconds
            }
        } catch (error) {
            logger.error(`Failed to get activation status for ${avatarId}: ${error}`)
            setActivationError(`Failed to get activation status: ${error}`)
            setIsPolling(false)
            setIsWaitingForOtp(false)
        }
    }

    const handleActivation = async () => {
        try {
            const sessionData = sessionDataRef.current?.value

            logger.info(
                `Starting activation for ${network} on profile ${avatarId} with override: ${shouldOverride}, type: ${activationType}...`,
            )

            // Start activation
            await new ServiceBrowserClient().activate(
                avatarId,
                true,
                shouldOverride,
                sessionData || null,
            )

            // Start polling for status
            setIsPolling(true)
            setActivationStatus("STARTED")
            setActivationError(null)
            setIsWaitingForOtp(false)
            setOtp("")
            setPassword("")
            setLastUpdated(new Date())
            setHasSubmittedOtp(false)

            // Start polling
            setTimeout(pollStatus, 1000)
        } catch (error) {
            logger.error(`Failed to activate ${network}: ${error}`)
            setActivationError(`Failed to start activation: ${error}`)
        }
    }

    const handleOtpSubmit = async () => {
        if (!otp.trim()) {
            setActivationError("OTP is required")
            return
        }

        setIsSubmittingOtp(true)
        setActivationError(null)

        try {
            // Submit OTP and password together
            await new ServiceBrowserClient().submitCredentials(
                avatarId,
                otp.trim(),
                password.trim(),
            )

            // Clear OTP input and resume polling
            setIsWaitingForOtp(false)
            setIsPolling(true)
            setOtp("")
            setPassword("")
            setIsSubmittingOtp(false)
            setLastUpdated(new Date())
            setHasSubmittedOtp(true)

            // Resume polling immediately
            setTimeout(pollStatus, 1000)
        } catch (error) {
            logger.error(`Failed to submit credentials: ${error}`)
            setActivationError(`Failed to submit credentials: ${error}`)
            setIsSubmittingOtp(false)
        }
    }

    const handleClose = () => {
        if (!isPolling && !isWaitingForOtp) {
            setIsOpen(false)
            setActivationStatus(null)
            setActivationError(null)
            setIsWaitingForOtp(false)
            setOtp("")
            setPassword("")
            setHasSubmittedOtp(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        // Only allow closing if not currently polling or waiting for OTP
        if (!open && (isPolling || isWaitingForOtp)) {
            return
        }
        setIsOpen(open)
        if (!open) {
            setActivationStatus(null)
            setActivationError(null)
            setIsWaitingForOtp(false)
            setOtp("")
            setPassword("")
            setHasSubmittedOtp(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger>
                <Button variant="outline" size="sm">
                    Activate
                </Button>
            </DialogTrigger>
            <CustomDialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Activate {network.charAt(0).toUpperCase() + network.slice(1)}
                    </DialogTitle>
                    <DialogDescription>
                        Activate the {network} account for this avatar. This will start the
                        activation process.
                    </DialogDescription>
                </DialogHeader>
                {!isPolling && !isWaitingForOtp ? (
                    <div className="py-4">
                        <p className="text-muted-foreground mb-4 text-sm">
                            The activation process will:
                        </p>
                        <ul className="mb-4 space-y-2 text-sm">
                            <li>• Start the browser session</li>
                            <li>• Navigate to {network} login page</li>
                            <li>• Enter credentials and complete verification</li>
                            <li>• Verify successful activation</li>
                        </ul>
                        <p className="text-muted-foreground mb-4 text-sm">
                            This process may take a few minutes and may require manual intervention
                            for verification steps.
                        </p>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="activation-type" className="text-sm font-medium">
                                    Activation Type
                                </Label>
                                <Select
                                    value={activationType}
                                    onValueChange={(value) => {
                                        setActivationType(value)
                                        if (sessionDataRef.current) {
                                            sessionDataRef.current.style.display =
                                                value === "session" ? "block" : "none"
                                        }
                                    }}
                                    onOpenChange={(open) => {
                                        console.log("Select open state changed:", open)
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select activation type" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[10000]">
                                        <SelectItem value="otp">OTP Verification</SelectItem>
                                        <SelectItem value="session">
                                            Session Data Submission
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <textarea
                                    ref={sessionDataRef}
                                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[100px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Enter session data here..."
                                    style={{ display: "none" }}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="should-override"
                                    checked={shouldOverride}
                                    onCheckedChange={(checked) =>
                                        setShouldOverride(checked === true)
                                    }
                                />
                                <Label htmlFor="should-override" className="text-sm">
                                    Override existing activation (force re-activation)
                                </Label>
                            </div>
                        </div>
                    </div>
                ) : isWaitingForOtp ? (
                    <div className="py-4">
                        <div className="flex flex-col gap-4">
                            {activationError ? (
                                <div className="text-center">
                                    <div className="mb-2 text-lg font-semibold text-red-500">
                                        Error
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        {activationError}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <div className="mb-2 text-lg font-semibold">
                                            OTP Required
                                        </div>
                                        <div className="text-muted-foreground mb-4 text-sm">
                                            Please enter the OTP code sent to your device and
                                            optionally your password.
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="otp" className="text-sm font-medium">
                                                OTP Code *
                                            </Label>
                                            <Input
                                                id="otp"
                                                type="text"
                                                placeholder="Enter OTP code"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                disabled={isSubmittingOtp}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label
                                                htmlFor="password"
                                                className="text-sm font-medium"
                                            >
                                                Password (Optional)
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Enter password if required"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                disabled={isSubmittingOtp}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="py-4">
                        <div className="flex flex-col items-center gap-4">
                            {activationError ? (
                                <div className="text-center">
                                    <div className="mb-2 text-lg font-semibold text-red-500">
                                        Activation Failed
                                    </div>
                                    <div className="text-muted-foreground text-sm">
                                        {activationError}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="size-6 animate-spin" />
                                        <span className="text-lg font-semibold">
                                            {activationStatus === "SUCCESS" ||
                                            activationStatus === "LOGIN_VERIFICATION_FAILED" ||
                                            activationStatus === "FAILED"
                                                ? "Activation Complete"
                                                : "Activation in Progress"}
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <div className="mb-1 text-sm font-medium">
                                            Current Status:
                                        </div>
                                        <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm capitalize">
                                            {activationStatus?.toLowerCase().replace(/_/g, " ")}
                                            {isPolling && (
                                                <div
                                                    className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
                                                    title="Updating status..."
                                                ></div>
                                            )}
                                        </div>
                                        {lastUpdated && (
                                            <div className="text-muted-foreground mt-1 text-xs">
                                                Last updated: {lastUpdated.toLocaleTimeString()}
                                            </div>
                                        )}
                                    </div>
                                    {activationStatus === "SUCCESS" && (
                                        <div className="text-center">
                                            <div className="mb-2 text-lg font-semibold text-green-500">
                                                ✅ Activation Successful!
                                            </div>
                                            <div className="text-muted-foreground text-sm">
                                                The {network} account has been successfully
                                                activated and is ready to use.
                                            </div>
                                        </div>
                                    )}
                                    {activationStatus === "LOGIN_VERIFICATION_FAILED" && (
                                        <div className="text-center">
                                            <div className="mb-2 text-lg font-semibold text-red-500">
                                                ❌ Login Verification Failed
                                            </div>
                                            <div className="text-muted-foreground text-sm">
                                                The login verification process failed. This could be
                                                due to incorrect credentials or security measures.
                                                Please try again.
                                            </div>
                                        </div>
                                    )}
                                    {activationStatus === "FAILED" && (
                                        <div className="text-center">
                                            <div className="mb-2 text-lg font-semibold text-red-500">
                                                ❌ Activation Failed
                                            </div>
                                            <div className="text-muted-foreground text-sm">
                                                The activation process failed. Please check your
                                                settings and try again.
                                            </div>
                                        </div>
                                    )}
                                    {/* Show intermediate status messages */}
                                    {activationStatus &&
                                        ![
                                            "SUCCESS",
                                            "LOGIN_VERIFICATION_FAILED",
                                            "FAILED",
                                        ].includes(activationStatus) && (
                                            <div className="text-center">
                                                <div className="text-muted-foreground text-sm">
                                                    {activationStatus === "CHECKING_PROFILE" &&
                                                        "Checking profile status..."}
                                                    {activationStatus === "STARTED" &&
                                                        "Starting browser session..."}
                                                    {activationStatus === "ALREADY_LOGGED_IN" &&
                                                        "Profile already logged in..."}
                                                    {activationStatus === "ENTERING_OTP" &&
                                                        "Processing OTP..."}
                                                    {activationStatus ===
                                                        "CHECKING_IF_WAITING_FOR_PASSWORD" &&
                                                        "Checking if password is required..."}
                                                    {activationStatus === "WAITING_FOR_PASSWORD" &&
                                                        "Waiting for password input..."}
                                                    {activationStatus === "ENTERING_PASSWORD" &&
                                                        "Processing password..."}
                                                    {activationStatus === "WAITING_10_SECONDS" &&
                                                        "Waiting for verification..."}
                                                    {activationStatus === "VERIFYING_LOGIN" &&
                                                        "Verifying login status..."}
                                                    {activationStatus === "SKIPPED" &&
                                                        "Step skipped..."}
                                                </div>
                                            </div>
                                        )}
                                </>
                            )}
                        </div>
                    </div>
                )}
                <DialogFooter>
                    {!isPolling && !isWaitingForOtp ? (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleActivation}>Start Activation</Button>
                        </>
                    ) : isWaitingForOtp ? (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleOtpSubmit}
                                disabled={isSubmittingOtp || !otp.trim()}
                            >
                                {isSubmittingOtp ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit OTP"
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={handleClose}>
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </CustomDialogContent>
        </Dialog>
    )
}
