export interface AuthRequest {
  msisdn: string;
}

export interface OtpRequest {
  msisdn: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  sessionId?: string;
}

export interface OtpValidation {
  msisdn: string;
  otp: string;
}

export interface AuthResponse {
  "accessToken": string,
  "refreshToken": string,
  "expiresIn": 0,
  "tokenType": string,
  "user": {
    "id"?: 0,
    "openId"?: string,
    "firstName": string,
    "lastName": string,
    "email": string
  }
}

export interface AuthError {
  message: string;
  code: string;
}

export enum AuthState {
  INITIAL = 'initial',
  REQUESTING_OTP = 'requesting-otp',
  OTP_SENT = 'otp-sent',
  VALIDATING_OTP = 'validating-otp',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error'
}

export interface User {
  id?: number;
  firstName: string,
  lastName: string,
  email: string,
}
