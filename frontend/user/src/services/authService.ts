// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://e-learningsite.runasp.net/api'

export interface LoginRequest {
  FullName: string
  passwordHash: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userId?: string
}

export interface RegisterRequest {
  FullName: string
  Email: string
  Password: string
  ConfirmPassword: string
  PhoneNumber?: string
}

export interface ResetPasswordRequest {
  email: string
  otpCode: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileRequest {
  fullName: string
  portraitUrl?: string
  experience?: string
  gender?: string
  address?: string
  dateOfBirth?: string
}

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: email, // Backend expects FullName instead of Email
        passwordHash: password, // Backend expects PasswordHash
      }),
    })

    if (!response.ok) {
      let errorMessage = 'Login failed'
      try {
        const errorText = await response.text()
        errorMessage = errorText || errorMessage
      } catch (e) {
        // If we can't read the error text, use the default message
      }
      throw new Error(errorMessage)
    }

    return response.json()
  }

  static async register(data: RegisterRequest): Promise<any> {
    console.log('Sending registration data:', data); // Debug log
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    console.log('Registration response status:', response.status); // Debug log

    if (!response.ok) {
      let errorMessage = 'Registration failed'
      try {
        const errorText = await response.text()
        console.log('Registration error text:', errorText); // Debug log
        errorMessage = errorText || errorMessage
      } catch (e) {
        // If we can't read the error text, use the default message
        console.log('Could not read error text:', e);
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('Registration success result:', result); // Debug log
    return result
  }

  static async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    return response.json()
  }

  static async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password?email=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      let errorMessage = 'Failed to send reset email'
      try {
        const errorText = await response.text()
        errorMessage = errorText || errorMessage
      } catch (e) {
        // If we can't read the error text, use the default message
      }
      throw new Error(errorMessage)
    }
  }

  static async updateProfile(profileData: UpdateProfileRequest, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        FullName: profileData.fullName,
        PortraitUrl: profileData.portraitUrl,
        Experience: profileData.experience,
        Gender: profileData.gender,
        Address: profileData.address,
        DateOfBirth: profileData.dateOfBirth,
        UpdatedAt: new Date().toISOString()
      }),
    })

    if (!response.ok) {
      let errorMessage = 'Failed to update profile'
      try {
        const errorText = await response.text()
        errorMessage = errorText || errorMessage
      } catch (e) {
        // If we can't read the error text, use the default message
      }
      throw new Error(errorMessage)
    }
  }

  static async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Email: data.email,
        Otp: data.otpCode,
        NewPassword: data.newPassword,
        ConfirmNewPassword: data.confirmPassword
      }),
    })

    if (!response.ok) {
      let errorMessage = 'Failed to reset password'
      try {
        const errorText = await response.text()
        errorMessage = errorText || errorMessage
      } catch (e) {
        // If we can't read the error text, use the default message
      }
      throw new Error(errorMessage)
    }
  }
}