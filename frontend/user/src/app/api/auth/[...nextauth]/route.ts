import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
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
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fullName: credentials.email, // Backend hỗ trợ cả email và fullName
              passwordHash: credentials.password,
            }),
          })

          if (!response.ok) {
            console.error('Login failed:', response.statusText)
            return null
          }

          const data = await response.json()
          
          // Return user object with tokens và thông tin user
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
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }
        } catch (error) {
          console.error('Login error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.refreshToken = (user as any).refreshToken
        token.userId = user.id
        token.fullName = (user as any).fullName
        token.portraitUrl = (user as any).portraitUrl
        token.experience = (user as any).experience
        token.gender = (user as any).gender
        token.address = (user as any).address
        token.dateOfBirth = (user as any).dateOfBirth
      }
      return token
    },
    async session({ session, token }) {
      if (session) {
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
        (session as any).userId = token.userId;
        (session.user as any).fullName = token.fullName;
        (session.user as any).portraitUrl = token.portraitUrl;
        (session.user as any).experience = token.experience;
        (session.user as any).gender = token.gender;
        (session.user as any).address = token.address;
        (session.user as any).dateOfBirth = token.dateOfBirth;
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }