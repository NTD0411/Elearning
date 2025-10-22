import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call backend API for login
          const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5074/api'
          console.log('Attempting login with:', credentials.email);
          console.log('API URL:', `${apiBase}/auth/login`);
          console.log('Request body:', JSON.stringify({
            FullName: credentials.email,
            PasswordHash: credentials.password,
          }));
          
          const response = await fetch(`${apiBase}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              FullName: credentials.email, // Backend hỗ trợ cả email và fullName
              PasswordHash: credentials.password,
            }),
          })

          console.log('Response status:', response.status);
          console.log('Response ok:', response.ok);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Login failed:', response.statusText, errorText);
            return null
          }

          const data = await response.json()
          console.log('Login response data:', data);
          
          // Kiểm tra xem có user data không
          if (!data.user) {
            console.error('No user data in response:', data);
            return null;
          }
          
          console.log('User data:', data.user);
          
          // Decode JWT để lấy role từ claims
          const token = data.accessToken;
          if (!token) {
            console.error('No accessToken in response');
            return null;
          }
          const tokenParts = token.split('.');
          const payload = JSON.parse(atob(tokenParts[1]));
          const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

          return {
            id: data.user?.id?.toString() || '1',
            email: data.user?.email || credentials.email,
            name: data.user?.fullName || '',
            fullName: data.user?.fullName || '',
            portraitUrl: data.user?.portraitUrl || '',
            experience: data.user?.experience || '',
            gender: data.user?.gender || '',
            address: data.user?.address || '',
            dateOfBirth: data.user?.dateOfBirth || '',
            role: role || 'student', // Lấy role từ JWT claims
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }
        } catch (error: any) {
          console.error('Login error:', error)
          console.error('Error details:', {
            message: error?.message,
            stack: error?.stack,
            name: error?.name
          })
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.fullName = user.fullName;
        token.portraitUrl = user.portraitUrl;
        token.experience = user.experience;
        token.gender = user.gender;
        token.address = user.address;
        token.dateOfBirth = user.dateOfBirth;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.fullName = token.fullName;
        session.user.portraitUrl = token.portraitUrl;
        session.user.experience = token.experience;
        session.user.gender = token.gender;
        session.user.address = token.address;
        session.user.dateOfBirth = token.dateOfBirth;
      }
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Preserve default behavior for internal redirects
      if (url.startsWith(baseUrl)) return url;
      // If the callbackUrl asks for admin, route to admin app
      if (url.includes('admin=true')) return 'http://localhost:5173/';
      return baseUrl;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }