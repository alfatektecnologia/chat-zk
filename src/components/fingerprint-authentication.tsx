"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./auth-provider"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Loader2, Fingerprint, Check, AlertTriangle, Shield } from "lucide-react"
import * as LocalAuthentication from "expo-local-authentication"

interface FingerprintAuthenticationProps {
  onSuccess: () => void;
  onCancel: () => void;
  purpose?: string;  // Optional purpose for the verification
}

export default function FingerprintAuthentication({ onSuccess, onCancel, purpose = "authentication" }: FingerprintAuthenticationProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationSuccess, setVerificationSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isAvailable, setIsAvailable] = useState(false)

  // Check if fingerprint authentication is available
  useEffect(() => {
    checkBiometricAvailability()
  }, [])

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()
      
      setIsAvailable(hasHardware && isEnrolled)
      setIsLoading(false)
    } catch (err) {
      console.error("Biometric availability check error:", err)
      setError("Failed to check fingerprint availability")
      setIsLoading(false)
    }
  }

  const startAuthentication = async () => {
    if (!isAvailable || !user) return

    setIsVerifying(true)
    setError("")

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Verify fingerprint for ${purpose}`,
        disableDeviceFallback: true,
        cancelLabel: "Cancel"
      })

      if (result.success) {
        setVerificationSuccess(true)
        // Store verification timestamp
        localStorage.setItem('lastFingerprint', new Date().toISOString())
        onSuccess()
      } else {
        setError("Fingerprint verification failed. Please try again.")
      }
    } catch (err) {
      console.error("Fingerprint verification error:", err)
      setError("Failed to verify fingerprint. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-900 p-4">
      <Card className="w-full max-w-md bg-blue-800 border-purple-500">
        <CardHeader>
          <CardTitle className="text-white">Fingerprint Verification</CardTitle>
          <CardDescription className="text-gray-300">
            Verify your identity using fingerprint for {purpose}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-2" />
              <span className="text-gray-300">Checking fingerprint availability...</span>
            </div>
          ) : verificationSuccess ? (
            <Alert className="bg-green-900/20 border-green-500">
              <Shield className="h-4 w-4 text-green-400" />
              <AlertTitle className="text-green-400">Verification Successful</AlertTitle>
              <AlertDescription className="text-gray-300">
                Your identity has been verified. You can now proceed with {purpose}.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center py-8">
                <Fingerprint className="h-16 w-16 text-purple-400 mb-4" />
                <p className="text-gray-300 text-center">
                  {isAvailable 
                    ? "Place your finger on the sensor to verify your identity"
                    : "Fingerprint authentication is not available on this device"}
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-500">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertTitle className="text-red-400">Error</AlertTitle>
                  <AlertDescription className="text-gray-300">{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-sm text-gray-400">
                <p className="font-medium mb-1">Security Notice:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your fingerprint data never leaves your device</li>
                  <li>Authentication is handled by your device's secure element</li>
                  <li>No biometric data is stored by the application</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {!verificationSuccess && isAvailable && !isVerifying && (
            <Button 
              onClick={startAuthentication} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Verify Fingerprint
            </Button>
          )}
          <Button 
            onClick={onCancel}
            variant="outline" 
            className="w-full border-purple-500 text-purple-400 hover:bg-purple-950"
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}